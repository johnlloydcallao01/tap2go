import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapLayer, MapTypeControl } from './MapTypeControl';
import {
  ReverseGeocodeDetails,
  reverseGeocode,
} from '../../services/geocoding';

interface AddressEditViewProps {
  address: any;
  initialLat?: number | null;
  initialLng?: number | null;
  isSaving?: boolean;
  fullBleed?: boolean;
  onChangeCoords: (lat: number, lng: number) => void;
  onAddressDetails?: (details: ReverseGeocodeDetails | null) => void;
  onSave: () => void;
  onCancel: () => void;
}

const DEFAULTS = { latitude: 14.5995, longitude: 120.9842 };
const PIN_SIZE = 48;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MIN = 200;
const SHEET_MAX = Math.min(SCREEN_HEIGHT * 0.75, 620);
const SHEET_INITIAL = Math.min(SCREEN_HEIGHT * 0.34, 300);
const MIN_MAP_HEIGHT = 380;

// Longer settle window: absorbs chained drags so we only geocode once the user
// has actually stopped moving the pin.
const GEOCODE_DEBOUNCE_MS = 800;
// Drags shorter than this are treated as a no-op — the address can't change.
const GEOCODE_MIN_CHANGE_M = 12;

/** Approximate geodesic distance between two coordinates, in meters (haversine). */
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function AddressEditView({
  address,
  initialLat,
  initialLng,
  isSaving,
  fullBleed = false,
  onChangeCoords,
  onAddressDetails,
  onSave,
  onCancel,
}: AddressEditViewProps) {
  const lat = typeof initialLat === 'number' && !Number.isNaN(initialLat)
    ? initialLat
    : DEFAULTS.latitude;
  const lng = typeof initialLng === 'number' && !Number.isNaN(initialLng)
    ? initialLng
    : DEFAULTS.longitude;

  const initialRegion = useMemo(
    () => ({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }),
    [lat, lng],
  );

  const handleRegionChangeComplete = (region: Region) => {
    onChangeCoords(region.latitude, region.longitude);
    resolveAddress(region.latitude, region.longitude);
  };

  // ── Reverse geocode the new pin position ─────────────────────────────────────
  const [resolvedAddress, setResolvedAddress] =
    useState<string>(address?.formatted_address || address?.formattedAddress || '');
  const [mapLayer, setMapLayer] = useState<MapLayer>('standard');

  const reverseGeocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  // The pin position we've already geocoded (or already know from the address
  // prop). Lets us skip right past "settles" that haven't actually changed.
  const lastGeocodedRef = useRef<{ lat: number; lng: number } | null>(null);

  const hasKnownAddress = Boolean(address?.formatted_address || address?.formattedAddress);

  useEffect(() => {
    // We already know this pin's address. Seeding here means the very first
    // settle on open (same coords as initialRegion) is a no-change, so we don't
    // spend a paid geocode telling the user the address they already had.
    if (hasKnownAddress && Number.isFinite(lat) && Number.isFinite(lng)) {
      lastGeocodedRef.current = { lat, lng };
    }

    // Cleanup when the editor unmounts: never geocode after the user leaves.
    return () => {
      if (reverseGeocodeTimer.current) {
        clearTimeout(reverseGeocodeTimer.current);
        reverseGeocodeTimer.current = null;
      }
      abortControllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveAddress = (lat: number, lng: number) => {
    // Skip when we've already resolved this exact spot. Covers the initial
    // settle and micro-drags that land within a few meters of the last pin.
    const last = lastGeocodedRef.current;
    if (last && distanceMeters(last.lat, last.lng, lat, lng) < GEOCODE_MIN_CHANGE_M) {
      return;
    }
    lastGeocodedRef.current = { lat, lng };

    // Cancel any stale in-flight geocode so a slow response can't overwrite a
    // newer pin, and tag our own request so it can't win a race either.
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const myRequestId = ++requestIdRef.current;

    // Debounce so we don't hit Google for every frame of a drag; resolve on settle.
    if (reverseGeocodeTimer.current) {
      clearTimeout(reverseGeocodeTimer.current);
    }
    reverseGeocodeTimer.current = setTimeout(async () => {
      const details = await reverseGeocode(lat, lng, { signal: controller.signal });
      if (controller.signal.aborted || myRequestId !== requestIdRef.current) return;
      if (details) {
        setResolvedAddress(details.formatted_address);
        onAddressDetails?.(details);
      } else {
        onAddressDetails?.(null);
      }
    }, GEOCODE_DEBOUNCE_MS);
  };

  const handleCancel = () => {
    // Drop any pending work the moment the user leaves, so we never fire a
    // request we no longer care about.
    if (reverseGeocodeTimer.current) {
      clearTimeout(reverseGeocodeTimer.current);
      reverseGeocodeTimer.current = null;
    }
    abortControllerRef.current?.abort();
    onCancel();
  };

  // ── Draggable bottom sheet height ───────────────────────────────────────────
  const sheetHeight = useRef(new Animated.Value(SHEET_INITIAL)).current;
  const currentHeight = useRef(SHEET_INITIAL);
  const startY = useRef(0);
  const startHeight = useRef(SHEET_INITIAL);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => {
          startY.current = g.dy;
          startHeight.current = currentHeight.current;
          return Math.abs(g.dy) > 4;
        },
        onPanResponderMove: (_, g) => {
          const delta = g.dy - startY.current;
          const next = Math.max(SHEET_MIN, Math.min(SHEET_MAX, startHeight.current - delta));
          currentHeight.current = next;
          sheetHeight.setValue(next);
        },
        onPanResponderRelease: () => {},
        onPanResponderTerminate: () => {},
      }),
    [sheetHeight],
  );

  const addressText =
    resolvedAddress || address?.formatted_address || address?.formattedAddress || 'Address';

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* ── Map fills the visible area above the sheet ── */}
      <Animated.View style={[styles.mapWrap, { bottom: sheetHeight }]}>
        <MapView
          style={StyleSheet.absoluteFill}
          mapType={mapLayer}
          initialRegion={initialRegion}
          scrollEnabled
          zoomEnabled
          pitchEnabled={false}
          rotateEnabled={false}
          showsScale
          loadingEnabled
          loadingBackgroundColor="#F9FAFB"
          onRegionChangeComplete={handleRegionChangeComplete}
        />

        {/* Center marker */}
        <View style={styles.markerWrap} pointerEvents="none">
          <View style={styles.pinBox}>
            <Ionicons name="location" size={PIN_SIZE} color="#EF4444" />
          </View>
        </View>

        <MapTypeControl value={mapLayer} onChange={setMapLayer} />
      </Animated.View>

      <View style={styles.mapHint} pointerEvents="none">
        <Ionicons name="finger-print-outline" size={14} color="#fff" />
        <Ionicons name="swap-horizontal" size={14} color="#fff" />
        <Ionicons name="location" size={13} color="#fff" />
      </View>

{/* Floating back button (top-left, over the map) */}
      <TouchableOpacity
        style={[
          styles.backButton,
          fullBleed && { top: insets.top + 12 },
        ]}
        onPress={handleCancel}
        disabled={isSaving}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={22} color="#111827" />
      </TouchableOpacity>

      {/* ── Draggable bottom sheet ── */}
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
        <View style={styles.sheetHandle} {...panResponder.panHandlers}>
          <View style={styles.handleBar} />
        </View>

        <ScrollView
          style={styles.sheetBody}
          contentContainerStyle={styles.sheetBodyContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.editLabel}>Edit your address</Text>

          <Text style={styles.addressText} numberOfLines={3}>
            {addressText}
          </Text>

          <Text style={styles.hint}>Drag the map to fine-tune the exact pin location.</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: MIN_MAP_HEIGHT,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  mapWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  markerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBox: {
    transform: [{ translateY: -(PIN_SIZE / 2) }],
  },
  mapHint: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
  },
  sheetHandle: {
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  sheetBody: {
    flex: 1,
  },
  sheetBodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});