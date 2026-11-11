export interface MerchantAvailabilityFields {
  isActive?: boolean | null;
  isAcceptingOrders?: boolean | null;
  vacationMode?: boolean | null;
  vacationModeEndsAt?: string | Date | null;
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
  return null;
}