import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { ensureMtaEnrollmentSchema, startMtaEnrollmentWorker } from "./mta-enrollment";
import {
  ensureMetaProspectSchema,
  reconcileAllProspectRegistrations,
  startMetaProspectWorker,
} from "./meta-prospect-registration";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Serve mobile-app wireframes/preview as static files
app.use("/mobile-app", express.static(path.join(process.cwd(), "mobile-app")));

// Remove restrictive COOP/COEP headers that break Meta Pixel detection
// This fixes the "no pixel detected" error in Meta Events Manager
app.use((_req, res, next) => {
  // Explicitly remove or set permissive COOP header
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');
  // Set permissive values if needed for some browsers
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const containsLeadPii =
    path === "/api/submissions"
    || path === "/api/audit-leads"
    || path === "/api/tech-leads";
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && !containsLeadPii) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await ensureMtaEnrollmentSchema();
  await ensureMetaProspectSchema();
  const prospectSummary = await reconcileAllProspectRegistrations();
  log(
    `prospect tracking ledger: ${prospectSummary.total} total, `
    + `${prospectSummary.sent} sent, ${prospectSummary.queued} queued, `
    + `${prospectSummary.expired} historical`,
    "meta-prospect",
  );
  await registerRoutes(httpServer, app);
  const stopMtaEnrollmentWorker = startMtaEnrollmentWorker();
  const stopMetaProspectWorker = startMetaProspectWorker();
  httpServer.once("close", stopMtaEnrollmentWorker);
  httpServer.once("close", stopMetaProspectWorker);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
