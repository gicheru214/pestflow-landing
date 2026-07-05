import { defineConfig } from "checkly";
import { Frequency } from "checkly/constructs";

export default defineConfig({
  projectName: "PestFlow Landing",
  logicalId: "pestflow-landing-production",
  repoUrl: "https://github.com/gicheru214/pestflow-landing",
  checks: {
    activated: true,
    muted: false,
    runtimeId: "2025.04",
    frequency: Frequency.EVERY_24H,
    locations: ["us-east-1"],
    tags: ["pestflow", "landing", "blog"],
  },
  cli: {
    runLocation: "us-east-1",
    retries: 1,
  },
});
