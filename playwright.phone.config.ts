import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./__checks__",
  testMatch: "landing-phone-validation.spec.ts",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:4174",
    viewport: { width: 402, height: 760 },
  },
  webServer: {
    command: "npm run build && PORT=4174 REPLAY_SOURCE_SHA=070854186bdc0917d62ea2307714b4f411bf3932 node __checks__/serve-built-client.mjs",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
