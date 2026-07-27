import assert from "node:assert/strict";
import test from "node:test";
import {
  hasAtMostTenPhoneDigits,
  isTenDigitPhone,
  limitPhoneInput,
  phoneDigits,
} from "./phone";

test("phoneDigits removes formatting", () => {
  assert.equal(phoneDigits("(555) 123-4567"), "5551234567");
});

test("limitPhoneInput never returns more than ten digits", () => {
  assert.equal(limitPhoneInput("77154189808"), "7715418980");
  assert.equal(limitPhoneInput("(555) 123-4567"), "5551234567");
});

test("ten-digit validation rejects short and overlong numbers", () => {
  assert.equal(isTenDigitPhone("5551234567"), true);
  assert.equal(isTenDigitPhone("555123456"), false);
  assert.equal(isTenDigitPhone("77154189808"), false);
  assert.equal(hasAtMostTenPhoneDigits("77154189808"), false);
  assert.equal(hasAtMostTenPhoneDigits("(555) 123-4567"), true);
});
