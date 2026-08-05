import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isLandingExperimentStagingHost,
  isLandingExperimentVariant,
  LANDING_EXPERIMENT_KEY,
  normalizeLandingExperimentVariant,
} from "../client/src/lib/landingExperiment";
import { shouldSuppressMetaLead } from "../client/src/lib/metaLeadEvent";
import { isStagingExperimentPreviewRequest } from "./staging-preview";

const STAGING_HOST =
  "pestflow-landing-conversion-staging.up.railway.app";

test("the landing experiment is impossible to evaluate on production", () => {
  assert.equal(isLandingExperimentStagingHost("pestflow.org"), false);
  assert.equal(isLandingExperimentStagingHost("www.pestflow.org"), false);
  assert.equal(isLandingExperimentStagingHost(STAGING_HOST), true);
  assert.equal(LANDING_EXPERIMENT_KEY, "pestflow-landing-playbook-gate-staging-v1");
  assert.equal(isLandingExperimentVariant("control"), true);
  assert.equal(isLandingExperimentVariant("no_playbook"), true);
  assert.equal(isLandingExperimentVariant("test"), false);
  assert.equal(normalizeLandingExperimentVariant("control"), "control");
  assert.equal(normalizeLandingExperimentVariant("test"), "no_playbook");
  assert.equal(normalizeLandingExperimentVariant("no_playbook"), "no_playbook");
  assert.equal(normalizeLandingExperimentVariant(false), null);
});

test("staging lead bypass requires both the exact host and private marker", () => {
  assert.equal(
    isStagingExperimentPreviewRequest(STAGING_HOST, "staging-experiment"),
    true,
  );
  assert.equal(
    isStagingExperimentPreviewRequest(`${STAGING_HOST}:443`, "staging-experiment"),
    true,
  );
  assert.equal(
    isStagingExperimentPreviewRequest("pestflow.org", "staging-experiment"),
    false,
  );
  assert.equal(isStagingExperimentPreviewRequest(STAGING_HOST, undefined), false);
});

test("Meta Lead is suppressed on staging but remains enabled on production", () => {
  assert.equal(shouldSuppressMetaLead(STAGING_HOST), true);
  assert.equal(shouldSuppressMetaLead("localhost"), true);
  assert.equal(shouldSuppressMetaLead("pestflow.org"), false);
});

test("both variants emit the same qualified-action metric", () => {
  const control = readFileSync(
    "client/src/components/home/playbook-activation-popup.tsx",
    "utf8",
  );
  const treatment = readFileSync(
    "client/src/components/home/direct-intent-popup.tsx",
    "utf8",
  );
  const wrapper = readFileSync(
    "client/src/components/home/landing-funnel-experiment.tsx",
    "utf8",
  );

  assert.match(control, /Qualified Funnel Action/);
  assert.match(treatment, /Qualified Funnel Action/);
  assert.match(treatment, /action: "calendar_booked"/);
  assert.match(treatment, /action: "workflow_selected"/);
  assert.equal((treatment.match(/fireMetaLeadOnce\(beginMetaLeadEvent\(\)\)/g) || []).length, 2);
  assert.match(treatment, /pestflow_popup_seen_workflow_v3/);
  assert.match(treatment, /pestflow_popup_submitted_workflow_v3/);
  assert.match(treatment, /isLandingExperimentStagingHost\(\).*next\.set\("internal", "1"\)/);
  assert.match(wrapper, /source: "production_failsafe"/);
  assert.match(wrapper, /finish\("control", "timeout"\)/);
});
