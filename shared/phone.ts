export const MAX_PHONE_DIGITS = 10;
export const NANP_COUNTRY_CODE = "+1";

export type NanpPhoneValidationIssue =
  | "length"
  | "area_code"
  | "exchange";

export function phoneDigits(value: unknown): string {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

export function nanpNationalDigits(value: unknown): string {
  const digits = phoneDigits(value);
  return digits.length === MAX_PHONE_DIGITS + 1 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
}

export function limitPhoneInput(value: string): string {
  const digits = phoneDigits(value);
  const nationalDigits = digits.length > MAX_PHONE_DIGITS && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
  return nationalDigits.slice(0, MAX_PHONE_DIGITS);
}

export function isTenDigitPhone(value: unknown): boolean {
  return nanpNationalDigits(value).length === MAX_PHONE_DIGITS;
}

export function hasAtMostTenPhoneDigits(value: unknown): boolean {
  return phoneDigits(value).length <= MAX_PHONE_DIGITS;
}

function isN11Code(value: string): boolean {
  return value.length === 3 && value[1] === "1" && value[2] === "1";
}

export function nanpPhoneValidationIssue(
  value: unknown,
): NanpPhoneValidationIssue | null {
  const digits = nanpNationalDigits(value);
  if (digits.length !== MAX_PHONE_DIGITS) return "length";

  const areaCode = digits.slice(0, 3);
  if (!/^[2-9]\d{2}$/.test(areaCode) || isN11Code(areaCode)) {
    return "area_code";
  }

  const exchange = digits.slice(3, 6);
  if (!/^[2-9]\d{2}$/.test(exchange) || isN11Code(exchange)) {
    return "exchange";
  }

  return null;
}

export function isValidNanpPhone(value: unknown): boolean {
  return nanpPhoneValidationIssue(value) === null;
}

export function nanpPhoneErrorMessage(value: unknown): string | null {
  const issue = nanpPhoneValidationIssue(value);
  if (issue === "length") return "Enter the 10 digits after +1";
  if (issue === "area_code") {
    return "Enter a valid area code—it cannot start with 0 or 1";
  }
  if (issue === "exchange") return "Enter a valid phone number";
  return null;
}
