export interface MerchantAvailabilityFields {
  isActive?: boolean | null;
  isAcceptingOrders?: boolean | null;
  vacationMode?: boolean | null;
  vacationModeEndsAt?: string | Date | null;
  isOpenNow?: boolean | null;
  storeHoursStatus?: {
    isOpen: boolean;
    reason: string;
    nextOpeningAt?: string | null;
  } | null;
  nextOpeningAt?: string | null;
  timezone?: string | null;
}

function formatNextOpening(merchant: MerchantAvailabilityFields): string | null {
  const value = merchant.storeHoursStatus?.nextOpeningAt ?? merchant.nextOpeningAt;
  if (!value) return null;

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: merchant.timezone || 'Asia/Manila',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  };
  try {
    return new Intl.DateTimeFormat('en-PH', options).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-PH', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }
}

export function isMerchantClosedByStoreHours(
  merchant: MerchantAvailabilityFields | null | undefined,
): boolean {
  return merchant?.isOpenNow === false || merchant?.storeHoursStatus?.isOpen === false;
}

export function isMerchantVacationActive(
  merchant: MerchantAvailabilityFields | null | undefined,
  now: Date = new Date(),
): boolean {
  if (merchant?.vacationMode !== true) return false;
  if (merchant.vacationModeEndsAt == null || merchant.vacationModeEndsAt === '') return true;

  const endsAt = merchant.vacationModeEndsAt instanceof Date
    ? merchant.vacationModeEndsAt.getTime()
    : Date.parse(merchant.vacationModeEndsAt);
  return !Number.isFinite(endsAt) || endsAt > now.getTime();
}

export function getMerchantOrderUnavailableMessage(
  merchant: MerchantAvailabilityFields | null | undefined,
): string | null {
  if (isMerchantVacationActive(merchant)) {
    return 'This merchant is on vacation and is not accepting new orders.';
  }
  if (!merchant || merchant.isActive === false || merchant.isAcceptingOrders === false) {
    return 'This merchant is not currently accepting orders.';
  }
  if (isMerchantClosedByStoreHours(merchant)) {
    if (merchant.storeHoursStatus?.reason === 'no-hours') {
      return 'This merchant has not set store hours and is not accepting orders.';
    }
    const nextOpening = formatNextOpening(merchant);
    return nextOpening
      ? `This merchant is currently closed. Opens ${nextOpening}.`
      : 'This merchant is currently closed and is not accepting new orders.';
  }
  return null;
}