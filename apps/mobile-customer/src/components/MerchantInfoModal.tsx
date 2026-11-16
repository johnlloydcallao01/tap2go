import React from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import type { Merchant, Media, OperatingHours, StoreHoursPeriod } from '@encreasl/client-services';
import { useThemeColors } from '../contexts/ThemeContext';
import {
  getMerchantOrderUnavailableMessage,
  isMerchantClosedByStoreHours,
  isMerchantVacationActive,
} from '../utils/merchantAvailability';
import { formatCurrency } from '../utils/format';

type Props = {
  visible: boolean;
  merchant: Merchant | null | undefined;
  onClose: () => void;
};

type IconName = ComponentProps<typeof Ionicons>['name'];
type StoreHoursDay = {
  key: keyof OperatingHours;
  label: string;
};

const STORE_HOURS_DAYS: StoreHoursDay[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];
const MERCHANT_INFO_SNAP_POINTS = ['72%', '94%'];
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
const CMS_BASE_URL = API_URL.replace(/\/api\/?$/, '');

function getImageUrl(media: Media | null | undefined): string | null {
  let url = media?.cloudinaryURL || media?.url || media?.thumbnailURL || null;
  if (!url || url.startsWith('http') || url.startsWith('data:')) return url;
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  const cleanBase = CMS_BASE_URL.endsWith('/') ? CMS_BASE_URL : `${CMS_BASE_URL}/`;
  url = `${cleanBase}${cleanUrl}`;
  return url;
}

function formatTime(value: string): string {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function formatPeriod(period: StoreHoursPeriod): string {
  if (period.open === period.close) return 'Open 24 hours';
  const openMinutes = Number(period.open.slice(0, 2)) * 60 + Number(period.open.slice(3, 5));
  const closeMinutes = Number(period.close.slice(0, 2)) * 60 + Number(period.close.slice(3, 5));
  const overnight = closeMinutes < openMinutes;
  return `${formatTime(period.open)}–${formatTime(period.close)}${overnight ? ' (next day)' : ''}`;
}

function getDayPeriods(schedule: unknown, day: keyof OperatingHours): StoreHoursPeriod[] {
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) return [];
  const source = schedule as Record<string, unknown>;
  const capitalizedDay = `${day[0].toUpperCase()}${day.slice(1)}`;
  const value = source[day] ?? source[capitalizedDay];
  if (Array.isArray(value)) {
    return value.flatMap((period) => {
      if (!period || typeof period !== 'object' || Array.isArray(period)) return [];
      const candidate = period as Record<string, unknown>;
      return typeof candidate.open === 'string' && typeof candidate.close === 'string'
        ? [{ open: candidate.open, close: candidate.close }]
        : [];
    });
  }
  if (!value || typeof value !== 'object') return [];
  const legacy = value as Record<string, unknown>;
  if (legacy.closed === true || typeof legacy.open !== 'string' || typeof legacy.close !== 'string') {
    return [];
  }
  return [{ open: legacy.open, close: legacy.close }];
}

function hasScheduledPeriods(schedule: unknown): boolean {
  return STORE_HOURS_DAYS.some(({ key }) => getDayPeriods(schedule, key).length > 0);
}

function formatDate(date: string): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(value.getTime())) return date;
  return value.toLocaleDateString('en-PH', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTodayInTimezone(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const values = Object.fromEntries(
      parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]),
    );
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function getScheduleText(schedule: unknown, day: keyof OperatingHours): string {
  if (!schedule) return 'Hours not set';
  const periods = getDayPeriods(schedule, day);
  if (periods.length === 0) return 'Closed';
  return periods.map(formatPeriod).join(' · ');
}

function getStatusLabel(merchant: Merchant | null | undefined): string {
  if (!merchant) return 'Status unavailable';
  if (isMerchantVacationActive(merchant)) return 'Temporarily unavailable';
  if (merchant.isActive === false || merchant.isAcceptingOrders === false) return 'Not accepting orders';
  if (merchant.storeHoursStatus?.reason === 'no-hours') return 'Hours not set';
  if (isMerchantClosedByStoreHours(merchant)) return 'Closed now';
  if (merchant.isOpenNow === true || merchant.storeHoursStatus?.isOpen === true) return 'Open now';
  return 'Status unavailable';
}

function Section({
  title,
  icon,
  children,
  colors,
}: {
  title: string;
  icon: IconName;
  children: React.ReactNode;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.sectionHeading}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
  onPress,
}: {
  icon: IconName;
  label: string;
  value: string;
  colors: ReturnType<typeof useThemeColors>;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.detailRow}
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `${label}: ${value}` : undefined}
    >
      <Ionicons name={icon} size={17} color={colors.textSecondary} style={styles.rowIcon} />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
      </View>
      {onPress ? <Ionicons name="open-outline" size={15} color={colors.textSecondary} /> : null}
    </TouchableOpacity>
  );
}

function asPositiveNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function getAddressLabel(address: Merchant['activeAddress']): string | null {
  if (!address) return null;
  const formattedAddress = address.formatted_address?.trim();
  if (formattedAddress) return formattedAddress;

  const streetLine = [
    address.subpremise,
    address.floor_unit_room,
    [address.street_number, address.route].filter(Boolean).join(' '),
    address.street,
  ]
    .map(part => part?.trim())
    .filter((part): part is string => !!part)
    .join(', ');
  const parts = [
    streetLine,
    address.barangay,
    address.locality,
    address.city,
    address.administrative_area_level_2,
    address.administrative_area_level_1,
    address.postal_code,
    address.country,
  ]
    .map(part => part?.trim())
    .filter((part): part is string => !!part);

  return [...new Set(parts)].join(', ') || null;
}

export default function MerchantInfoModal({ visible, merchant, onClose }: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const timezone = merchant?.timezone || 'Asia/Manila';
  const unavailableMessage = getMerchantOrderUnavailableMessage(merchant);
  const statusLabel = getStatusLabel(merchant);
  const statusIsOpen = statusLabel === 'Open now';
  const merchantLogoUrl = getImageUrl(merchant?.vendor?.logo)
    || getImageUrl(merchant?.media?.thumbnail);
  const activeAddress = merchant?.activeAddress;
  const address = getAddressLabel(activeAddress);
  const latitude = activeAddress?.latitude;
  const longitude = activeAddress?.longitude;
  const hasCoordinates = typeof latitude === 'number'
    && Number.isFinite(latitude)
    && latitude >= -90
    && latitude <= 90
    && typeof longitude === 'number'
    && Number.isFinite(longitude)
    && longitude >= -180
    && longitude <= 180;
  const mapUrl = hasCoordinates
    ? `https://maps.google.com/?q=${latitude},${longitude}`
    : address
      ? `https://maps.google.com/?q=${encodeURIComponent(address)}`
      : null;
  const phone = merchant?.contactInfo?.phone?.trim();
  const email = merchant?.contactInfo?.email?.trim();
  const deliverySettings = merchant?.deliverySettings;
  const minimumOrder = asPositiveNumber(deliverySettings?.minimumOrderAmount)
    ?? asPositiveNumber(merchant?.min_order_amount);
  const estimatedMinutes = asPositiveNumber(deliverySettings?.estimatedDeliveryTimeMinutes)
    ?? asPositiveNumber(merchant?.avg_delivery_time_minutes);
  const maximumMinutes = asPositiveNumber(deliverySettings?.maxDeliveryTimeMinutes);
  const baseDeliveryFee = asPositiveNumber(deliverySettings?.deliveryFee)
    ?? asPositiveNumber(merchant?.delivery_fee_base);
  const deliveryFeePerKm = asPositiveNumber(merchant?.delivery_fee_per_km);
  const deliveryFeeText = baseDeliveryFee || deliveryFeePerKm
    ? [
        baseDeliveryFee ? `Base ${formatCurrency(baseDeliveryFee)}` : null,
        deliveryFeePerKm ? `${formatCurrency(deliveryFeePerKm)}/km` : null,
      ].filter(Boolean).join(' + ')
    : null;
  const freeDeliveryThreshold = asPositiveNumber(deliverySettings?.freeDeliveryThreshold)
    ?? asPositiveNumber(merchant?.free_delivery_threshold);
  const hasDeliveryInformation = merchant?.is_currently_delivering != null
    || minimumOrder !== null
    || estimatedMinutes !== null
    || deliveryFeeText !== null
    || freeDeliveryThreshold !== null;
  const description = merchant?.description?.trim() || merchant?.vendor?.description?.trim();
  const categoryNames = merchant?.merchant_categories
    ?.map(category => category.name?.trim())
    .filter((name): name is string => !!name);
  const upcomingSpecialHours = (merchant?.specialHours || [])
    .filter(exception => /^\d{4}-\d{2}-\d{2}$/.test(exception.date) && exception.date >= getTodayInTimezone(timezone))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const hasDeliveryHours = hasScheduledPeriods(merchant?.delivery_hours);
  const specialHoursCaption = (exception: NonNullable<Merchant['specialHours']>[number]) => {
    if (exception.isClosed) return exception.reason ? `Closed · ${exception.reason}` : 'Closed';
    const open = exception.openTime ? formatTime(exception.openTime) : null;
    const close = exception.closeTime ? formatTime(exception.closeTime) : null;
    const hours = open && close ? `${open}–${close}` : 'Special hours';
    return exception.reason ? `${hours} · ${exception.reason}` : hours;
  };
  const openExternalUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        'Unable to open link',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close merchant information"
        />
        <BottomSheet
          index={0}
          snapPoints={MERCHANT_INFO_SNAP_POINTS}
          enablePanDownToClose
          enableDynamicSizing={false}
          enableOverDrag={false}
          enableContentPanningGesture
          topInset={insets.top}
          onClose={onClose}
          backgroundStyle={[
            styles.sheetBackground,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          handleIndicatorStyle={[styles.handle, { backgroundColor: colors.border }]}
        >
          <BottomSheetView style={styles.sheetContent} accessibilityViewIsModal>
            <View style={styles.header}>
              {merchantLogoUrl ? (
                <Image
                  source={{ uri: merchantLogoUrl }}
                  style={styles.merchantLogo}
                  resizeMode="cover"
                  accessibilityLabel={`${merchant?.outletName || 'Merchant'} logo`}
                />
              ) : (
                <View style={[styles.merchantLogoPlaceholder, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="storefront-outline" size={22} color={colors.primary} />
                </View>
              )}
              <View style={styles.headerCopy}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Merchant information</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {merchant?.outletName || 'Details and store hours'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
                accessibilityRole="button"
                accessibilityLabel="Close merchant information"
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <BottomSheetScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) }]}
              showsVerticalScrollIndicator={false}
            >
              {!merchant ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Merchant information is not available yet. Please try again in a moment.
                </Text>
              ) : (
                <>
                <View
                  style={[
                    styles.statusCard,
                    {
                      backgroundColor: statusIsOpen ? '#ECFDF3' : '#FFF7E8',
                      borderColor: statusIsOpen ? '#B7E4C7' : '#F3D5A0',
                    },
                  ]}
                >
                  <View style={styles.statusHeading}>
                    <Ionicons
                      name={statusIsOpen ? 'checkmark-circle' : 'time-outline'}
                      size={20}
                      color={statusIsOpen ? '#16803C' : '#A65C00'}
                    />
                    <Text style={[styles.statusTitle, { color: statusIsOpen ? '#166534' : '#854D0E' }]}>
                      {statusLabel}
                    </Text>
                  </View>
                  <Text style={[styles.statusDescription, { color: statusIsOpen ? '#166534' : '#854D0E' }]}>
                    {unavailableMessage || 'Currently available according to the posted hours.'}
                  </Text>
                  <Text style={[styles.timezoneNote, { color: colors.textSecondary }]}>
                    All times shown in {timezone}.
                  </Text>
                </View>

                <Section title="Store hours" icon="time-outline" colors={colors}>
                  {STORE_HOURS_DAYS.map(({ key, label }) => (
                    <View key={key} style={styles.hoursRow}>
                      <Text style={[styles.hoursDay, { color: colors.text }]}>{label}</Text>
                      <Text style={[styles.hoursValue, { color: colors.textSecondary }]}>
                        {getScheduleText(merchant.operatingHours, key)}
                      </Text>
                    </View>
                  ))}
                  {hasDeliveryHours ? (
                    <>
                      <View style={[styles.subsectionDivider, { backgroundColor: colors.border }]} />
                      <Text style={[styles.subsectionTitle, { color: colors.text }]}>Delivery hours</Text>
                      <Text style={[styles.timezoneNote, { color: colors.textSecondary, marginBottom: 6 }]}>
                        These override store hours for order availability.
                      </Text>
                      {STORE_HOURS_DAYS.map(({ key, label }) => (
                        <View key={`delivery-${key}`} style={styles.hoursRow}>
                          <Text style={[styles.hoursDay, { color: colors.text }]}>{label}</Text>
                          <Text style={[styles.hoursValue, { color: colors.textSecondary }]}>
                            {getScheduleText(merchant.delivery_hours, key)}
                          </Text>
                        </View>
                      ))}
                    </>
                  ) : null}
                </Section>

                {upcomingSpecialHours.length > 0 ? (
                  <Section title="Upcoming special hours" icon="calendar-outline" colors={colors}>
                    {upcomingSpecialHours.map(exception => (
                      <View key={exception.date} style={styles.hoursRow}>
                        <Text style={[styles.hoursDay, { color: colors.text }]}>{formatDate(exception.date)}</Text>
                        <Text style={[styles.hoursValue, { color: colors.textSecondary }]}>
                          {specialHoursCaption(exception)}
                        </Text>
                      </View>
                    ))}
                  </Section>
                ) : null}

                {description || categoryNames?.length ? (
                  <Section title="About" icon="information-circle-outline" colors={colors}>
                    {merchant.vendor?.businessName ? (
                      <Text style={[styles.businessName, { color: colors.textSecondary }]}>
                        Part of {merchant.vendor.businessName}
                      </Text>
                    ) : null}
                    {description ? <Text style={[styles.description, { color: colors.text }]}>{description}</Text> : null}
                    {categoryNames?.length ? (
                      <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                        {categoryNames.join(' · ')}
                      </Text>
                    ) : null}
                  </Section>
                ) : null}

                {address || hasCoordinates || phone || email ? (
                  <Section title="Location and contact" icon="location-outline" colors={colors}>
                    {address || hasCoordinates ? (
                      <DetailRow
                        icon="map-outline"
                        label={address ? 'Address' : 'Map location'}
                        value={address || `${latitude}, ${longitude}`}
                        colors={colors}
                        onPress={mapUrl ? () => openExternalUrl(mapUrl) : undefined}
                      />
                    ) : null}
                    {phone ? (
                      <DetailRow
                        icon="call-outline"
                        label="Phone"
                        value={phone}
                        colors={colors}
                        onPress={() => openExternalUrl(`tel:${phone.replace(/[^\d+]/g, '')}`)}
                      />
                    ) : null}
                    {email ? (
                      <DetailRow
                        icon="mail-outline"
                        label="Email"
                        value={email}
                        colors={colors}
                        onPress={() => openExternalUrl(`mailto:${email}`)}
                      />
                    ) : null}
                  </Section>
                ) : null}

                {hasDeliveryInformation ? (
                  <Section title="Ordering and delivery" icon="bicycle-outline" colors={colors}>
                    {merchant.is_currently_delivering != null ? (
                      <DetailRow
                        icon={merchant.is_currently_delivering ? 'checkmark-circle-outline' : 'close-circle-outline'}
                        label="Delivery service"
                        value={merchant.is_currently_delivering ? 'Available' : 'Currently unavailable'}
                        colors={colors}
                      />
                    ) : null}
                    {minimumOrder ? (
                      <DetailRow icon="basket-outline" label="Minimum order" value={formatCurrency(minimumOrder)} colors={colors} />
                    ) : null}
                    {estimatedMinutes ? (
                      <DetailRow
                        icon="hourglass-outline"
                        label="Estimated delivery"
                        value={maximumMinutes && maximumMinutes > estimatedMinutes
                          ? `${estimatedMinutes}–${maximumMinutes} min`
                          : `About ${estimatedMinutes} min`}
                        colors={colors}
                      />
                    ) : null}
                    {deliveryFeeText ? (
                      <DetailRow
                        icon="cash-outline"
                        label="Delivery fee"
                        value={deliveryFeeText}
                        colors={colors}
                      />
                    ) : null}
                    {freeDeliveryThreshold ? (
                      <DetailRow
                        icon="pricetag-outline"
                        label="Free delivery"
                        value={`On orders over ${formatCurrency(freeDeliveryThreshold)}`}
                        colors={colors}
                      />
                    ) : null}
                  </Section>
                ) : null}

                {merchant.specialInstructions?.trim() ? (
                  <Section title="Ordering notes" icon="chatbox-ellipses-outline" colors={colors}>
                    <Text style={[styles.description, { color: colors.text }]}>
                      {merchant.specialInstructions.trim()}
                    </Text>
                  </Section>
                ) : null}
                </>
              )}
            </BottomSheetScrollView>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
  },
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sheetContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    gap: 12,
  },
  merchantLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  merchantLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  statusHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  timezoneNote: {
    fontSize: 11,
    marginTop: 7,
  },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  subsectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 5,
  },
  hoursDay: {
    fontSize: 13,
    fontWeight: '600',
    flex: 0.8,
  },
  hoursValue: {
    fontSize: 13,
    flex: 1.2,
    textAlign: 'right',
  },
  businessName: {
    fontSize: 12,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  categoryText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 6,
  },
  rowIcon: {
    marginRight: 11,
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    paddingVertical: 28,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
  },
});
