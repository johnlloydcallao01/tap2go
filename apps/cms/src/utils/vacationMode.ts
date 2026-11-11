export type VacationModeFields = {
  vacationMode?: boolean | null
  vacationModeEndsAt?: string | Date | null
  isActive?: boolean | null
  isAcceptingOrders?: boolean | null
}

export function getMerchantOrderUnavailableMessage(
  merchant: VacationModeFields | null | undefined,
  now: Date = new Date(),
): string | null {
  if (merchant && isMerchantOnVacation(merchant, now)) {
    return 'This merchant is on vacation and is not accepting new orders.'
  }
  if (!merchant || merchant.isActive === false || merchant.isAcceptingOrders === false) {
    return 'This merchant is not currently accepting orders.'
  }
  return null
}

export function isMerchantOnVacation(
  merchant: VacationModeFields,
  now: Date = new Date(),
): boolean {
  if (merchant.vacationMode !== true) return false
  if (merchant.vacationModeEndsAt == null || merchant.vacationModeEndsAt === '') return true

  const endsAt = merchant.vacationModeEndsAt instanceof Date
    ? merchant.vacationModeEndsAt.getTime()
    : Date.parse(merchant.vacationModeEndsAt)

  return !Number.isFinite(endsAt) || endsAt > now.getTime()
}
