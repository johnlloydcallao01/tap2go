export type VacationModeFields = {
  vacationMode?: boolean | null
  vacationModeEndsAt?: string | Date | null
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
