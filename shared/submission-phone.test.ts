import assert from "node:assert/strict";
import test from "node:test";
import { insertSubmissionSchema } from "./schema";

const popupSubmission = {
  type: "newsletter",
  firstName: "Jordan",
  lastName: "Owner",
  email: "jordan@example.net",
  companyName: "Guide Request",
};

test("popup submissions normalize +1 numbers to the admin's 10-digit contract", () => {
  const parsed = insertSubmissionSchema.parse({
    ...popupSubmission,
    phone: "+1 (212) 555-0199",
  });

  assert.equal(parsed.phone, "2125550199");
  assert.equal(parsed.type, "newsletter");
});

test("popup submissions reject invalid area codes and excess digits", () => {
  for (const phone of ["1125550199", "0125550199", "2115550199", "21255501990"]) {
    const result = insertSubmissionSchema.safeParse({ ...popupSubmission, phone });
    assert.equal(result.success, false, `${phone} should be rejected`);
  }
});

test("popup submissions reject invalid central-office codes", () => {
  for (const phone of ["2121550199", "2120110199", "2129110199"]) {
    const result = insertSubmissionSchema.safeParse({ ...popupSubmission, phone });
    assert.equal(result.success, false, `${phone} should be rejected`);
  }
});

test("email-only newsletter surfaces remain compatible", () => {
  const result = insertSubmissionSchema.safeParse(popupSubmission);
  assert.equal(result.success, true);
});

test("partial popup capture can omit an unfinished phone", () => {
  const result = insertSubmissionSchema.safeParse({
    ...popupSubmission,
    type: "popup_partial",
    phone: "21255",
  });
  assert.equal(result.success, true);
});

test("non-popup submission validation keeps its existing 10-digit contract", () => {
  const result = insertSubmissionSchema.safeParse({
    ...popupSubmission,
    type: "demo",
    phone: "(112) 555-0199",
  });
  assert.equal(result.success, true);
});
