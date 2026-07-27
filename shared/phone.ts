export const MAX_PHONE_DIGITS = 10;

export function phoneDigits(value: unknown): string {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

export function limitPhoneInput(value: string): string {
  return phoneDigits(value).slice(0, MAX_PHONE_DIGITS);
}

export function isTenDigitPhone(value: unknown): boolean {
  return phoneDigits(value).length === MAX_PHONE_DIGITS;
}

export function hasAtMostTenPhoneDigits(value: unknown): boolean {
  return phoneDigits(value).length <= MAX_PHONE_DIGITS;
}
