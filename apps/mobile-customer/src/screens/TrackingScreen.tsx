import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { apiConfig } from '../config/environment';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GoMapView, IN_EXPO_GO, type GoMapMarker } from '../components/shared/GoMapView';

const CMS_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `users API-Key ${apiConfig.payloadApiKey}`,
};

type LatLng = {
  latitude: number;
  longitude: number;
};

type TrackedDriver = {
  driverId: string | null;
  name: string | null;
  phone: string | null;
  plateNumber: string | null;
  photoUrl: string | null;
  lat: number | null;
  lng: number | null;
  locationUpdatedAt: string | null;
};

type StopInfo = {
  lat: number | null;
  lng: number | null;
  address: string | null;
};

type TrackingData = {
  orderId: number;
  deliveryStatus: string;
  lalamoveRawStatus?: string | null;
  driver: TrackedDriver;
  pickup: StopInfo;
  dropoff: StopInfo;
  distanceMeters: number | null;
  shareLink: string | null;
};

type DeliveryRouteData = {
  coordinates: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
};

function statusLabel(status: string): string {
  switch (status) {
    case 'assigning_driver':
      return 'Finding your rider';
    case 'driver_assigned':
      return 'Rider is on the way to pickup';
    case 'picked_up':
      return 'Order picked up — heading to you';
    case 'completed':
      return 'Delivered';
    case 'canceled':
      return 'Cancelled';
    case 'expired':
      return 'Cancelled';
    case 'rejected':
      return 'Re-matching rider';
    default:
      return 'Preparing your delivery';
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'picked_up':
      return '#06b6d4';
    case 'completed':
      return '#10b981';
    case 'canceled':
    case 'expired':
      return '#ef4444';
    case 'driver_assigned':
      return '#f59e0b';
    default:
      return '#8b5cf6';
  }
}

function formatTimeAgo(iso?: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 15) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/** Compute a region that frames every given point (plus padding). */
function regionFraming(points: LatLng[], fallback: LatLng): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  const pts = points.filter(
    (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
  );
  if (pts.length === 0) {
    return {
      latitude: fallback.latitude,
      longitude: fallback.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }

  const lats = pts.map((p) => p.latitude);
  const lngs = pts.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (latSpan || 0.01) * 1.4,
    longitudeDelta: (lngSpan || 0.01) * 1.4,
  };
}

export default function TrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const mapBottomInset = useRef(new Animated.Value(0)).current;
  const collapsedOffset = useRef(0);
  const expandedMapBottom = useRef(0);
  const isCardMinimized = useRef(false);
  const [isCardMinimizedState, setIsCardMinimizedState] = useState(false);

  const animateCard = useCallback((minimized: boolean) => {
    isCardMinimized.current = minimized;
    setIsCardMinimizedState(minimized);
    const targetOffset = minimized ? collapsedOffset.current : 0;
    Animated.parallel([
      Animated.spring(cardTranslateY, {
        toValue: targetOffset,
        useNativeDriver: true,
        damping: 24,
        stiffness: 220,
        mass: 0.8,
      }),
      Animated.spring(mapBottomInset, {
        toValue: Math.max(0, expandedMapBottom.current - targetOffset),
        useNativeDriver: false,
        damping: 24,
        stiffness: 220,
        mass: 0.8,
      }),
    ]).start();
  }, [cardTranslateY, mapBottomInset]);

  const cardHandleResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        const startOffset = isCardMinimized.current ? collapsedOffset.current : 0;
        const maxOffset = collapsedOffset.current;
        const nextOffset = Math.max(0, Math.min(maxOffset, startOffset + gesture.dy));
        cardTranslateY.setValue(nextOffset);
        mapBottomInset.setValue(Math.max(0, expandedMapBottom.current - nextOffset));
      },
      onPanResponderRelease: (_, gesture) => {
        const startOffset = isCardMinimized.current ? collapsedOffset.current : 0;
        const endOffset = Math.max(
          0,
          Math.min(collapsedOffset.current, startOffset + gesture.dy),
        );
        const minimized = endOffset >= collapsedOffset.current / 2;
        animateCard(minimized);
      },
      onPanResponderTerminate: () => animateCard(isCardMinimized.current),
    }),
  ).current;

  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);

  const mounted = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nativeMapRef = useRef<MapView | null>(null);
  const latestDataRef = useRef(data);
  const latestRouteRef = useRef(routeCoordinates);

  const fitNativeMap = useCallback(() => {
    const currentData = latestDataRef.current;
    const points = [
      ...latestRouteRef.current,
      ...(currentData
        ? [
            { latitude: currentData.pickup.lat, longitude: currentData.pickup.lng },
            { latitude: currentData.dropoff.lat, longitude: currentData.dropoff.lng },
            ...(currentData.driver.lat != null && currentData.driver.lng != null
              ? [{
                  latitude: Number(currentData.driver.lat),
                  longitude: Number(currentData.driver.lng),
                }]
              : []),
          ].filter(
            (point): point is LatLng =>
              point.latitude != null &&
              point.longitude != null &&
              Number.isFinite(point.latitude) &&
              Number.isFinite(point.longitude),
          )
        : []),
    ];

    if (points.length > 1) {
      nativeMapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 72, right: 48, bottom: 260, left: 48 },
        animated: true,
      });
    }
  }, []);

  useEffect(() => {
    latestDataRef.current = data;
    latestRouteRef.current = routeCoordinates;
  }, [data, routeCoordinates]);

  const fetchTracking = useCallback(async () => {
    if (!id || !user?.id) return;
    try {
      const res = await fetch(
        `${apiConfig.baseUrl}/delivery/track?orderId=${encodeURIComponent(id)}`,
        { headers: CMS_HEADERS },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to load tracking');
      }
      const body = await res.json();
      if (mounted.current) {
        setData(body?.data || null);
        setError(null);
      }
    } catch (err: any) {
      if (mounted.current) {
        // Only surface errors on the very first load; subsequent poll failures
        // keep showing the last-good snapshot.
        setError((prev) => (prev === null ? (err?.message || 'Failed to load tracking') : prev));
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [id, user?.id]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  const hasTrackingData = data !== null;
  const pickupLat = data?.pickup.lat;
  const pickupLng = data?.pickup.lng;
  const dropoffLat = data?.dropoff.lat;
  const dropoffLng = data?.dropoff.lng;

  useEffect(() => {
    if (!hasTrackingData || !id || !user?.id) return;

    let active = true;
    setRouteCoordinates([]);

    if (pickupLat == null || pickupLng == null || dropoffLat == null || dropoffLng == null) {
      return () => {
        active = false;
      };
    }

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `${apiConfig.baseUrl}/delivery/route?orderId=${encodeURIComponent(id)}`,
          { headers: CMS_HEADERS },
        );
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body?.error || 'Failed to calculate the motorcycle route');
        }

        const route = body?.data as DeliveryRouteData | undefined;
        if (
          !Array.isArray(route?.coordinates) ||
          route.coordinates.length < 2 ||
          !route.coordinates.every(
            (point) =>
              Number.isFinite(point?.latitude) &&
              Number.isFinite(point?.longitude),
          )
        ) {
          throw new Error('Google did not return valid motorcycle route geometry');
        }

        if (active) {
          setRouteCoordinates(route.coordinates);
        }
      } catch (routeFetchError) {
        console.error('[TrackingScreen] Motorcycle route unavailable:', routeFetchError);
        if (active) {
          setRouteCoordinates([]);
        }
      }
    };

    void fetchRoute();
    return () => {
      active = false;
    };
  }, [
    hasTrackingData,
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    id,
    user?.id,
  ]);

  useEffect(() => {
    if (routeCoordinates.length >= 2) fitNativeMap();
  }, [fitNativeMap, routeCoordinates]);

  // Poll every 10s while active; stop when delivered/cancelled
  useEffect(() => {
    if (!id || !user?.id) return;

    const isTerminal = data?.deliveryStatus === 'completed'
      || data?.deliveryStatus === 'canceled'
      || data?.deliveryStatus === 'expired';

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isTerminal) {
      intervalRef.current = setInterval(() => {
        fetchTracking();
      }, 10000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [id, user?.id, data?.deliveryStatus, fetchTracking]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading your delivery…</Text>
        </View>
      );
    }

    if (error || !data) {
      return (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
          <Text style={styles.centerText}>
            {error || 'Tracking information is not available yet.'}
          </Text>
          <TouchableOpacity onPress={() => { setError(null); setLoading(true); fetchTracking(); }} style={{ marginTop: 12 }}>
            <Text style={{ color: '#f97316', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const driver = data.driver;
    const hasDriver = !!(driver?.lat && driver?.lng);
    const pickup = data.pickup;
    const dropoff = data.dropoff;

    const pts: LatLng[] = [];
    if (pickup.lat != null && pickup.lng != null) {
      pts.push({ latitude: pickup.lat, longitude: pickup.lng });
    }
    if (dropoff.lat != null && dropoff.lng != null) {
      pts.push({ latitude: dropoff.lat, longitude: dropoff.lng });
    }
    if (hasDriver) {
      pts.push({ latitude: Number(driver.lat), longitude: Number(driver.lng) });
    }

    const initialRegion = regionFraming(pts.length ? pts : [
      { latitude: 14.5995, longitude: 120.9842 },
    ], { latitude: 14.5995, longitude: 120.9842 });

    const goMarkers: GoMapMarker[] = [];
    if (pickup.lat != null && pickup.lng != null) {
      goMarkers.push({
        latitude: Number(pickup.lat),
        longitude: Number(pickup.lng),
        color: '#f97316',
        title: 'Restaurant',
      });
    }
    if (dropoff.lat != null && dropoff.lng != null) {
      goMarkers.push({
        latitude: Number(dropoff.lat),
        longitude: Number(dropoff.lng),
        color: '#3b82f6',
        title: 'Delivery',
      });
    }
    if (hasDriver) {
      goMarkers.push({
        latitude: Number(driver.lat),
        longitude: Number(driver.lng),
        color: '#111827',
        title: driver.name || 'Your rider',
      });
    }
    const goRoute = routeCoordinates;

    return (
      <View style={styles.mapContainer}>
        <Animated.View style={[styles.mapViewport, { bottom: mapBottomInset }]}>
          {IN_EXPO_GO ? (
            <GoMapView
              style={{ flex: 1 }}
              center={{ latitude: initialRegion.latitude, longitude: initialRegion.longitude }}
              latitudeDelta={initialRegion.latitudeDelta}
              interactive
              markers={goMarkers}
              polyline={goRoute}
              autoFit
              fitOnPolylineChange
            />
          ) : (
            <MapView
              style={{ flex: 1 }}
              ref={nativeMapRef}
              onMapReady={fitNativeMap}
              initialRegion={initialRegion}
              showsUserLocation={false}
              showsCompass
              showsScale
              loadingEnabled
              loadingBackgroundColor="#f9fafb"
              loadingIndicatorColor="#f97316"
            >
          {pickup.lat != null && pickup.lng != null && (
            <Marker
              coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
              title="Restaurant"
              description={pickup.address || 'Pickup'}
            >
              <View style={styles.stopMarker}>
                <Ionicons name="storefront" size={16} color="#fff" />
              </View>
            </Marker>
          )}

          {dropoff.lat != null && dropoff.lng != null && (
            <Marker
              coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
              title="Delivery"
              description={dropoff.address || 'Dropoff'}
            >
              <View style={[styles.stopMarker, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="home" size={16} color="#fff" />
              </View>
            </Marker>
          )}

          {hasDriver && (
            <Marker
              coordinate={{ latitude: Number(driver.lat), longitude: Number(driver.lng) }}
              title={driver.name || 'Your rider'}
              description={driver.plateNumber || undefined}
            >
              <View style={styles.driverMarker}>
                <Ionicons name="bicycle" size={18} color="#fff" />
              </View>
            </Marker>
          )}

          {routeCoordinates.length >= 2 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#f97316"
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          )}
            </MapView>
          )}

        {/* Status pill overlay */}
        <View style={styles.statusPillRow}>
          <View style={styles.statusPill}>
            <View style={[styles.statusPillDot, { backgroundColor: statusColor(data.deliveryStatus) }]} />
            <Text style={styles.statusPillText}>{statusLabel(data.deliveryStatus)}</Text>
          </View>
        </View>
        </Animated.View>

        {/* Bottom card */}
        <Animated.View
          {...cardHandleResponder.panHandlers}
          onLayout={(event) => {
            const height = event.nativeEvent.layout.height;
            collapsedOffset.current = Math.max(0, height - styles.cardHandleArea.height);
            expandedMapBottom.current = height + insets.bottom + 32;
            mapBottomInset.setValue(
              Math.max(
                0,
                expandedMapBottom.current -
                  (isCardMinimized.current ? collapsedOffset.current : 0),
              ),
            );
            if (isCardMinimized.current) {
              cardTranslateY.setValue(collapsedOffset.current);
            }
          }}
          style={[
            styles.bottomCard,
            {
              bottom: insets.bottom + 24,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardHandleArea}
            activeOpacity={0.7}
            onPress={() => animateCard(!isCardMinimized.current)}
            accessibilityRole="button"
            accessibilityLabel={isCardMinimizedState ? 'Expand delivery details' : 'Minimize delivery details'}
            accessibilityHint={isCardMinimizedState ? 'Swipe up to show rider and address details' : 'Swipe down to focus on the map'}
          >
            <Ionicons
              name={isCardMinimizedState ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#9ca3af"
            />
            <View style={styles.cardHandle} />
          </TouchableOpacity>
          {hasDriver ? (
            <>
              <View style={styles.driverRow}>
                {driver.photoUrl ? (
                  <Image source={{ uri: driver.photoUrl }} style={styles.driverAvatar} />
                ) : (
                  <View style={styles.driverAvatarPlaceholder}>
                    <Ionicons name="person" size={22} color="#9ca3af" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{driver.name || 'Your rider'}</Text>
                  {driver.plateNumber ? (
                    <Text style={styles.driverPlate}>{driver.plateNumber}</Text>
                  ) : null}
                  {driver.locationUpdatedAt ? (
                    <Text style={styles.updatedAt}>
                      Updated {formatTimeAgo(driver.locationUpdatedAt)}
                    </Text>
                  ) : null}
                </View>
                {driver.phone ? (
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => Linking.openURL(`tel:${driver.phone}`)}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.callBtnText}>Call</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </>
          ) : (
            <View style={styles.noDriverRow}>
              <Ionicons name="search" size={20} color="#8b5cf6" />
              <Text style={styles.noDriverText}>Looking for a rider…</Text>
              <ActivityIndicator size="small" color="#8b5cf6" style={{ marginLeft: 8 }} />
            </View>
          )}

          {(data.distanceMeters != null && data.distanceMeters > 0) && (
            <Text style={styles.distanceText}>
              {(data.distanceMeters / 1000).toFixed(1)} km delivery
            </Text>
          )}

          <View style={styles.addressBlock}>
            <View style={styles.addressRow}>
              <View style={[styles.addressDot, { backgroundColor: '#f97316' }]} />
              <Text style={styles.addressText} numberOfLines={1}>
                {pickup.address || 'Restaurant'}
              </Text>
            </View>
            <View style={styles.addressRow}>
              <View style={[styles.addressDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.addressText} numberOfLines={1}>
                {dropoff.address || 'Your location'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Delivery</Text>
          <View style={{ width: 32 }} />
        </View>
      </SafeAreaView>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, padding: 24 },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 15 },
  centerText: { marginTop: 12, color: '#6b7280', fontSize: 16, textAlign: 'center' as const, lineHeight: 23 },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: { flex: 1, textAlign: 'center' as const, fontSize: 16, fontWeight: '600' as const, color: '#111827' },
  mapContainer: { flex: 1, position: 'relative' as const },
  mapViewport: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden' as const,
  },
  stopMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f97316',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: '#fff',
  },
  driverMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111827',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusPillRow: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 2,
  },
  statusPill: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statusPillText: { fontSize: 14, fontWeight: '600' as const, color: '#111827' },
  statusPillDot: { width: 8, height: 8, borderRadius: 4 },
  bottomCard: {
    position: 'absolute' as const,
    left: 12,
    right: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  cardHandleArea: {
    height: 30,
    marginTop: -8,
    marginBottom: 4,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 1,
  },
  cardHandle: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  driverRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 },
  driverAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6' },
  driverAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  driverName: { fontSize: 16, fontWeight: '600' as const, color: '#111827' },
  driverPlate: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  updatedAt: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  callBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f97316',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  callBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' as const },
  noDriverRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  noDriverText: { fontSize: 15, color: '#6b7280', flex: 1 },
  distanceText: { fontSize: 13, color: '#6b7280', marginTop: 10 },
  addressBlock: { marginTop: 12, gap: 6 },
  addressRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  addressDot: { width: 8, height: 8, borderRadius: 4 },
  addressText: { fontSize: 13, color: '#6b7280', flex: 1 },
});