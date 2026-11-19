import { createHash } from 'crypto'
import type { Payload, PayloadRequest, Where } from 'payload'

const MIN_LOCATION_SAMPLE_DISTANCE_METERS = 12

type LocationSample = {
  orderId: number
  driverId: string
  latitude: number
  longitude: number
  providerUpdatedAt: string | null
  observedAt: string
}

type StoredLocationSample = {
  driver_id?: string | null
  latitude?: number | null
  longitude?: number | null
  provider_updated_at?: string | null
  observed_at?: string | null
}

function distanceBetweenPoints(
  first: Pick<LocationSample, 'latitude' | 'longitude'>,
  second: Pick<LocationSample, 'latitude' | 'longitude'>,
): number {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180)
  const latitudeDelta = toRadians(second.latitude - first.latitude)
  const longitudeDelta = toRadians(second.longitude - first.longitude)
  const firstLatitude = toRadians(first.latitude)
  const secondLatitude = toRadians(second.latitude)
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2
  const boundedHaversine = Math.min(1, Math.max(0, haversine))
  return 6_371_000 * 2 * Math.atan2(
    Math.sqrt(boundedHaversine),
    Math.sqrt(1 - boundedHaversine),
  )
}

function parseTimestamp(value: string | null | undefined): number | null {
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

export function shouldAppendLocationSample(
  current: LocationSample,
  previous: StoredLocationSample | undefined,
): boolean {
  if (!previous) return true

  const currentProviderTime = parseTimestamp(current.providerUpdatedAt)
  const previousProviderTime = parseTimestamp(previous.provider_updated_at)
  if (
    currentProviderTime !== null &&
    previousProviderTime !== null &&
    currentProviderTime <= previousProviderTime
  ) {
    return false
  }

  if (
    currentProviderTime === null ||
    previousProviderTime === null
  ) {
    const currentObservedTime = parseTimestamp(current.observedAt)
    const previousObservedTime = parseTimestamp(previous.observed_at)
    if (
      currentObservedTime === null ||
      previousObservedTime === null ||
      currentObservedTime <= previousObservedTime
    ) {
      return false
    }
  }

  const previousLatitude = Number(previous.latitude)
  const previousLongitude = Number(previous.longitude)
  if (
    !Number.isFinite(previousLatitude) ||
    !Number.isFinite(previousLongitude)
  ) {
    return true
  }

  return distanceBetweenPoints(
    { latitude: previousLatitude, longitude: previousLongitude },
    { latitude: current.latitude, longitude: current.longitude },
  ) >= MIN_LOCATION_SAMPLE_DISTANCE_METERS
}

function createDedupeKey(sample: LocationSample): string {
  const providerTime = parseTimestamp(sample.providerUpdatedAt)
  const observedTime = parseTimestamp(sample.observedAt) ?? Date.now()
  const timeKey = providerTime ?? Math.floor(observedTime / 10_000)
  const value = [
    sample.orderId,
    sample.driverId,
    timeKey,
    sample.latitude.toFixed(5),
    sample.longitude.toFixed(5),
  ].join(':')
  return createHash('sha256').update(value).digest('hex')
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  )
}

export async function recordDriverLocationSample(
  payload: Payload,
  sample: LocationSample,
  req: PayloadRequest,
): Promise<void> {
  const where: Where = {
    and: [
      { order: { equals: sample.orderId } },
      { driver_id: { equals: sample.driverId } },
    ],
  }
  const latest = await payload.find({
    collection: 'delivery-location-history',
    where,
    sort: '-observed_at',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })

  if (!shouldAppendLocationSample(sample, latest.docs[0] as StoredLocationSample | undefined)) {
    return
  }

  const dedupeKey = createDedupeKey(sample)
  const duplicate = await payload.find({
    collection: 'delivery-location-history',
    where: { dedupe_key: { equals: dedupeKey } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (duplicate.docs.length > 0) return

  try {
    await payload.create({
      collection: 'delivery-location-history',
      data: {
        order: sample.orderId,
        driver_id: sample.driverId,
        latitude: sample.latitude,
        longitude: sample.longitude,
        provider_updated_at: sample.providerUpdatedAt || undefined,
        observed_at: sample.observedAt,
        dedupe_key: dedupeKey,
      },
      overrideAccess: true,
      req,
    })
  } catch (error) {
    if (!isUniqueConstraintViolation(error)) throw error
  }
}

export async function getDriverLocationTrail(
  payload: Payload,
  orderId: number,
  driverId: string | null,
  req: PayloadRequest,
): Promise<Array<{ latitude: number; longitude: number }>> {
  let selectedDriverId = driverId

  if (!selectedDriverId) {
    const latest = await payload.find({
      collection: 'delivery-location-history',
      where: { order: { equals: orderId } },
      sort: '-observed_at',
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    selectedDriverId = String(
      (latest.docs[0] as StoredLocationSample | undefined)?.driver_id || '',
    )
  }

  if (!selectedDriverId) return []

  const history = await payload.find({
    collection: 'delivery-location-history',
    where: {
      and: [
        { order: { equals: orderId } },
        { driver_id: { equals: selectedDriverId } },
      ],
    },
    sort: '-observed_at',
    limit: 2000,
    depth: 0,
    overrideAccess: true,
    req,
  })

  return history.docs
    .reverse()
    .map((sample) => ({
      latitude: Number((sample as StoredLocationSample).latitude),
      longitude: Number((sample as StoredLocationSample).longitude),
    }))
    .filter((point) =>
      Number.isFinite(point.latitude) &&
      Number.isFinite(point.longitude) &&
      point.latitude >= -90 &&
      point.latitude <= 90 &&
      point.longitude >= -180 &&
      point.longitude <= 180,
    )
}
