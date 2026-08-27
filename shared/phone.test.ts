import assert from "node:assert/strict";
import test from "node:test";
import {
  hasAtMostTenPhoneDigits,
  isValidNanpPhone,
  isTenDigitPhone,
  limitPhoneInput,
  nanpNationalDigits,
  nanpPhoneErrorMessage,
  nanpPhoneValidationIssue,
  phoneDigits,
} from "./phone";

test("phoneDigits removes formatting", () => {
  assert.equal(phoneDigits("(555) 123-4567"), "5551234567");
});

test("normalizes an optional +1 country code to national digits", () => {
  assert.equal(nanpNationalDigits("+1 (212) 555-0199"), "2125550199");
  assert.equal(nanpNationalDigits("2125550199"), "2125550199");
});

test("limitPhoneInput never returns more than ten national digits", () => {
  assert.equal(limitPhoneInput("77154189808"), "7715418980");
  assert.equal(limitPhoneInput("(555) 123-4567"), "5551234567");
  assert.equal(limitPhoneInput("+1 (212) 555-0199"), "2125550199");
  assert.equal(limitPhoneInput("212555019912345"), "2125550199");
});

test("ten-digit validation rejects short and overlong numbers", () => {
  assert.equal(isTenDigitPhone("5551234567"), true);
  assert.equal(isTenDigitPhone("+1 5551234567"), true);
  assert.equal(isTenDigitPhone("555123456"), false);
  assert.equal(isTenDigitPhone("77154189808"), false);
  assert.equal(hasAtMostTenPhoneDigits("77154189808"), false);
  assert.equal(hasAtMostTenPhoneDigits("(555) 123-4567"), true);
});

test("NANP validation rejects impossible area and exchange codes", () => {
  assert.equal(isValidNanpPhone("2125550199"), true);
  assert.equal(isValidNanpPhone("+1 (416) 555-0199"), true);

  assert.equal(nanpPhoneValidationIssue("1125550199"), "area_code");
  assert.equal(nanpPhoneValidationIssue("0125550199"), "area_code");
  assert.equal(nanpPhoneValidationIssue("2115550199"), "area_code");
  assert.equal(nanpPhoneValidationIssue("2121550199"), "exchange");
  assert.equal(nanpPhoneValidationIssue("2129110199"), "exchange");
  assert.equal(nanpPhoneValidationIssue("212555019"), "length");
  assert.equal(nanpPhoneValidationIssue("22125550199"), "length");
});

test("NANP validation returns actionable popup errors", () => {
  assert.equal(nanpPhoneErrorMessage("212555019"), "Enter the 10 digits after +1");
  assert.equal(
    nanpPhoneErrorMessage("1125550199"),
    "Enter a valid area code—it cannot start with 0 or 1",
  );
  assert.equal(nanpPhoneErrorMessage("2121550199"), "Enter a valid phone number");
  assert.equal(nanpPhoneErrorMessage("2125550199"), null);
});
