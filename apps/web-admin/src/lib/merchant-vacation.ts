export function isVacationModeActive(
  vacationMode: boolean | null | undefined,
  vacationModeEndsAt: string | null | undefined,
  now: number = Date.now(),
): boolean {
  if (vacationMode !== true) return false
  if (!vacationModeEndsAt) return true

  const endsAt = Date.parse(vacationModeEndsAt)
  return !Number.isFinite(endsAt) || endsAt > now
}
