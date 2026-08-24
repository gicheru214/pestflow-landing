import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./__checks__",
  testMatch: "signup-success-platform-routing.spec.ts",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 402, height: 692 },
  },
  webServer: {
    command: "npm run build && REPLAY_SOURCE_SHA=9f9a2772f85ed88787278930ae8d209fee9413a6 node __checks__/serve-built-client.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
