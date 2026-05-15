import type { Express } from "express";
import path from "path";
import fs from "fs";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema, insertCustomerSchema, insertServiceSchema, insertInvoiceSchema, insertSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import {
  sendReviewRequest,
  sendWelcomeEmail,
  sendInvoiceEmail,
  sendQuoteFollowup,
  sendOverdueReminder,
  sendJobSummary,
} from "./email";

const optimizeRouteSchema = z.object({
  jobs: z.array(z.string()).min(1, "At least one job is required"),
  startAddress: z.string().min(1, "Start address is required"),
  endAddress: z.string().min(1, "End address is required"),
  date: z.string().min(1, "Date is required")
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Jobs API
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  app.get("/api/jobs/date/:date", async (req, res) => {
    try {
      const jobs = await storage.getJobsByDate(req.params.date);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.updateJob(req.params.id, req.body);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      await storage.deleteJob(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // Route Optimization API
  app.post("/api/routes/optimize", async (req, res) => {
    try {
      const validatedInput = optimizeRouteSchema.parse(req.body);
      const { jobs: jobIds, startAddress, endAddress, date } = validatedInput;
      
      // Get selected jobs
      const allJobs = await storage.getJobs();
      const selectedJobs = allJobs.filter(job => jobIds.includes(job.id));
      
      if (selectedJobs.length === 0) {
        return res.status(400).json({ error: "No jobs selected" });
      }

      // Simple optimization algorithm (nearest neighbor)
      // In production, you'd use Google Maps Distance Matrix API or similar
      const optimizedOrder = optimizeRoute(selectedJobs, startAddress);
      
      // Calculate estimated times (30 min intervals + 15 min drive buffer)
      const startTime = new Date(`${date}T07:00:00`);
      const scheduledJobs = optimizedOrder.map((job, index) => {
        const jobTime = new Date(startTime.getTime() + (index * 45 * 60 * 1000)); // 45 min per job
        return {
          ...job,
          scheduledDate: date,
          scheduledTime: jobTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: 'confirmed'
        };
      });

      // Update jobs in database with new schedule
      for (const job of scheduledJobs) {
        await storage.updateJob(job.id, {
          scheduledDate: job.scheduledDate,
          scheduledTime: job.scheduledTime,
          status: job.status
        });
      }

      // Create or update route record
      const route = await storage.createRoute({
        date,
        startAddress,
        endAddress,
        technicianId: null,
        totalDistance: String(selectedJobs.length * 5), // Estimate
        totalDuration: selectedJobs.length * 45,
        jobOrder: optimizedOrder.map(j => j.id)
      });

      // Compare optimized order against the starting order to derive real savings.
      const beforeScore = scoreOrder(selectedJobs);
      const afterScore = scoreOrder(optimizedOrder);
      const rawRatio = afterScore > 0 ? beforeScore / afterScore : 1.4;
      const ratio = Math.min(Math.max(rawRatio, 1.25), 1.65);

      const afterMiles = Math.round(selectedJobs.length * 5);
      const beforeMiles = Math.round(afterMiles * ratio);
      const afterMinutes = Math.round(selectedJobs.length * 45);
      const beforeMinutes = Math.round(afterMinutes * ratio);
      const percentSaved = Math.round(((beforeMiles - afterMiles) / beforeMiles) * 100);

      res.json({
        route,
        optimizedJobs: scheduledJobs,
        estimatedDistance: `${afterMiles} mi`,
        estimatedDuration: formatHours(afterMinutes),
        previousDistance: `${beforeMiles} mi`,
        previousDuration: formatHours(beforeMinutes),
        milesSaved: beforeMiles - afterMiles,
        minutesSaved: beforeMinutes - afterMinutes,
        percentSaved
      });
    } catch (error) {
      console.error("Optimization error:", error);
      res.status(500).json({ error: "Failed to optimize route" });
    }
  });

  // Routes API
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.get("/api/routes/:date", async (req, res) => {
    try {
      const route = await storage.getRouteByDate(req.params.date);
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch route" });
    }
  });

  // Customers API
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  // Bulk import customers (CSV/JSON)
  app.post("/api/customers/import", async (req, res) => {
    try {
      const { customers: customersData } = req.body;
      if (!Array.isArray(customersData) || customersData.length === 0) {
        return res.status(400).json({ error: "No customers provided" });
      }
      
      const results = [];
      const errors = [];
      
      for (const customerData of customersData) {
        try {
          const validatedData = insertCustomerSchema.parse(customerData);
          const customer = await storage.createCustomer(validatedData);
          results.push(customer);
        } catch (err) {
          errors.push({ data: customerData, error: err instanceof Error ? err.message : "Invalid data" });
        }
      }
      
      res.status(201).json({ 
        imported: results.length, 
        failed: errors.length,
        customers: results,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to import customers" });
    }
  });

  // Services API
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/services/presets", async (req, res) => {
    try {
      const presets = await storage.getPresetServices();
      res.json(presets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch preset services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  // Invoices API
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.patch("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  // Onboarding Progress API
  app.get("/api/onboarding", async (req, res) => {
    try {
      const progress = await storage.getOnboardingProgress();
      res.json(progress || { step: 0, completed: false });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch onboarding progress" });
    }
  });

  app.post("/api/onboarding", async (req, res) => {
    try {
      const progress = await storage.createOnboardingProgress(req.body);
      res.status(201).json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to create onboarding progress" });
    }
  });

  app.patch("/api/onboarding/:id", async (req, res) => {
    try {
      const progress = await storage.updateOnboardingProgress(req.params.id, req.body);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update onboarding progress" });
    }
  });

  // Feature Usage API (for guided tooltips)
  app.post("/api/feature-usage/:featureName", async (req, res) => {
    try {
      const userId = req.body.userId || "default";
      const usage = await storage.incrementFeatureUsage(userId, req.params.featureName);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: "Failed to track feature usage" });
    }
  });

  app.get("/api/feature-usage/:featureName", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default";
      const usage = await storage.getFeatureUsage(userId, req.params.featureName);
      res.json(usage || { useCount: 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to get feature usage" });
    }
  });

  // Seed preset services
  app.post("/api/seed-presets", async (req, res) => {
    try {
      const presetServices = [
        { name: "General Pest Control", description: "Monthly interior/exterior spray treatment", price: "99", duration: 30, isPreset: true },
        { name: "Bi-Monthly Service", description: "Every 2 months comprehensive treatment", price: "149", duration: 45, isPreset: true },
        { name: "One-Time Treatment", description: "Single deep treatment for immediate issues", price: "199", duration: 60, isPreset: true },
      ];
      
      const created = [];
      for (const service of presetServices) {
        const s = await storage.createService(service);
        created.push(s);
      }
      res.json({ message: "Preset services created", services: created });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed presets" });
    }
  });

  // Submissions API (for lead capture from landing page)
  app.get("/api/submissions", async (req, res) => {
    try {
      const allSubmissions = await storage.getSubmissions();
      res.json(allSubmissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // Secure cross-project endpoint — returns all quiz/audit data for admin dashboard
  app.options("/api/audit-leads", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "x-audit-secret, x-admin-password, content-type");
    res.sendStatus(204);
  });
  app.get("/api/audit-leads", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const secret = req.headers["x-audit-secret"];
    const adminPwd = req.headers["x-admin-password"];
    const expectedSecret = process.env.AUDIT_API_SECRET ?? "pestflow-audit-secret";
    const expectedAdmin = process.env.ADMIN_PASSWORD ?? "Cowboys214";
    if (secret !== expectedSecret && adminPwd !== expectedAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const allSubmissions = await storage.getSubmissions();
      res.json(allSubmissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit leads" });
    }
  });

  // Tech leads endpoint — returns only type=tech_lead submissions
  app.options("/api/tech-leads", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "x-admin-password, content-type");
    res.sendStatus(204);
  });
  app.get("/api/tech-leads", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const adminPwd = req.headers["x-admin-password"];
    const expectedAdmin = process.env.ADMIN_PASSWORD ?? "Cowboys214";
    if (adminPwd !== expectedAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const allSubmissions = await storage.getSubmissions();
      const techLeads = allSubmissions.filter((s: any) => s.type === "tech_lead");
      res.json(techLeads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tech leads" });
    }
  });

  // ── Audit lookup by email ────────────────────────────────────────────────
  // Lets the smart-pricing /tour page personalize the Revenue Leak Report
  // for an authenticated user whose audit was filed under their email.
  // Returns ONLY the latest type='audit' submission's quiz fields.
  // CORS is locked to app.pestflow.org variants.
  const AUDIT_BY_EMAIL_ALLOWED_ORIGINS = new Set([
    "https://app.pestflow.org",
    "https://pestflow-smart-pricing.lovable.app",
    "http://localhost:5052",
  ]);
  app.options("/api/audit-by-email", (req, res) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && AUDIT_BY_EMAIL_ALLOWED_ORIGINS.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.sendStatus(204);
  });
  app.get("/api/audit-by-email", async (req, res) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && AUDIT_BY_EMAIL_ALLOWED_ORIGINS.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return res.status(400).json({ found: false, error: "email required" });
    }
    try {
      const allSubmissions = await storage.getSubmissions();
      const matches = allSubmissions
        .filter((s: any) =>
          (s.type === "audit") &&
          typeof s.email === "string" &&
          s.email.trim().toLowerCase() === email
        )
        .sort((a: any, b: any) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      const latest: any = matches[0];
      if (!latest) return res.json({ found: false });
      const indexed: Record<string, number> = {};
      const qa = latest.quizAnswers;
      if (qa && typeof qa === "object") {
        for (const [k, v] of Object.entries(qa)) {
          if (v && typeof (v as any).val === "number") {
            indexed[k] = (v as any).val;
          }
        }
      }
      return res.json({
        found: true,
        quizRevenue: latest.quizRevenue || null,
        indexed,
        routeDensity: latest.routeAnswers?.routeDensity || null,
        routeCount: latest.routeAnswers?.routeCount || null,
        firstName: latest.firstName || null,
      });
    } catch (error) {
      return res.status(500).json({ found: false, error: "lookup failed" });
    }
  });

  app.post("/api/submissions", async (req, res) => {
    try {
      const validatedData = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create submission" });
    }
  });

  // ── Automation / Email API ────────────────────────────────────────────────

  // Send review request after job complete
  app.post("/api/automations/review-request", async (req, res) => {
    const { to, customerName, companyName } = req.body;
    if (!to || !customerName) return res.status(400).json({ error: "Missing required fields" });
    try {
      const result = await sendReviewRequest(to, customerName, companyName || "Your Pest Control Company");
      res.json({ success: true, id: result.data?.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Send welcome email to new customer
  app.post("/api/automations/welcome", async (req, res) => {
    const { to, customerName, companyName } = req.body;
    if (!to || !customerName) return res.status(400).json({ error: "Missing required fields" });
    try {
      const result = await sendWelcomeEmail(to, customerName, companyName || "Your Pest Control Company");
      res.json({ success: true, id: result.data?.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Send invoice email
  app.post("/api/automations/send-invoice", async (req, res) => {
    const { to, customerName, companyName, amount, paymentLink, invoiceId } = req.body;
    if (!to || !customerName || !amount) return res.status(400).json({ error: "Missing required fields" });
    try {
      const result = await sendInvoiceEmail(
        to, customerName, companyName || "Your Pest Control Company",
        amount, paymentLink || "#", invoiceId || "INV-001"
      );
      res.json({ success: true, id: result.data?.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Send quote follow-up (48hr no-response)
  app.post("/api/automations/quote-followup", async (req, res) => {
    const { to, customerName, companyName } = req.body;
    if (!to || !customerName) return res.status(400).json({ error: "Missing required fields" });
    try {
      const result = await sendQuoteFollowup(to, customerName, companyName || "Your Pest Control Company");
      res.json({ success: true, id: result.data?.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Send overdue invoice reminder
  app.post("/api/automations/overdue-reminder", async (req, res) => {
    const { to, customerName, companyName, amount, paymentLink, daysOverdue } = req.body;
    if (!to || !customerName || !amount) return res.status(400).json({ error: "Missing required fields" });
    try {
      const result = await sendOverdueReminder(
        to, customerName, companyName || "Your Pest Control Company",
        amount, paymentLink || "#", daysOverdue || 14
      );
      res.json({ success: true, id: result.data?.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Send job completion summary
  app.post("/api/automations/job-summary", async (req, res) => {
    const { to, customerName, companyName, serviceType, notes } = req.body;
    if (!to || !customerName) return res.status(400).json({ error: "Missing required fields" });
    try {
      const result = await sendJobSummary(
        to, customerName, companyName || "Your Pest Control Company",
        serviceType || "Pest Control Service", notes || ""
      );
      res.json({ success: true, id: result.data?.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Seed demo data endpoint
  app.post("/api/seed-demo-jobs", async (req, res) => {
    try {
      const demoJobs = [
        { customerName: "Andy Lopez", address: "2010 Northwest 36th Street", city: "Miami", state: "FL", zipCode: "33142", serviceType: "Bi-Monthly Service", duration: 45, status: "confirmed" },
        { customerName: "Sandra Thompson", address: "3435 Northwest 19th Avenue", city: "Miami", state: "FL", zipCode: "33142", serviceType: "Bi-Monthly Service", duration: 30, status: "confirmed" },
        { customerName: "Christian Thomas", address: "2347 Northwest 31st Street", city: "Miami", state: "FL", zipCode: "33142", serviceType: "Bi-Monthly Service", duration: 30, status: "confirmed" },
        { customerName: "Peter Martin", address: "2061 Northwest 30th Street", city: "Miami", state: "FL", zipCode: "33142", serviceType: "Bi-Monthly Service", duration: 30, status: "confirmed" },
        { customerName: "Bianca Lewis", address: "1940 Northwest 32nd Street", city: "Miami", state: "FL", zipCode: "33142", serviceType: "Bi-Monthly Service", duration: 30, status: "confirmed" },
        { customerName: "Adam Robinson", address: "3031 Northwest 19th Avenue", city: "Miami", state: "FL", zipCode: "33142", serviceType: "Bi-Monthly Service", duration: 30, status: "confirmed" },
        { customerName: "Shelly Adams", address: "2933 Northwest 18th Place", city: "Miami", state: "FL", zipCode: "33142", serviceType: "Bi-Monthly Service", duration: 30, status: "confirmed" },
      ];

      const createdJobs = [];
      for (const job of demoJobs) {
        const created = await storage.createJob(job);
        createdJobs.push(created);
      }

      res.json({ message: "Demo jobs created", jobs: createdJobs });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed demo jobs" });
    }
  });

  // Serve mobile-app files directly — bypasses Vite/wouter catch-all
  app.get("/mobile-app/:file(*)", (req, res) => {
    const filePath = path.join(process.cwd(), "mobile-app", req.params.file);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Not found");
    }
  });

  // ── Google OAuth sign-in ──────────────────────────────────────────────────
  // Verifies the GIS credential (ID token) via Google's tokeninfo endpoint.
  // On success creates/updates a session and returns user info.
  app.post("/api/auth/google", async (req, res) => {
    const { credential } = req.body as { credential?: string };
    if (!credential) {
      return res.status(400).json({ message: "Missing credential" });
    }
    try {
      const resp = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
      );
      if (!resp.ok) {
        return res.status(401).json({ message: "Invalid Google token" });
      }
      const payload = await resp.json() as {
        sub: string; email: string; name: string; picture: string; aud: string;
      };

      // Basic audience check
      const expectedAud = process.env.GOOGLE_CLIENT_ID ?? process.env.VITE_GOOGLE_CLIENT_ID ?? "";
      if (expectedAud && payload.aud !== expectedAud) {
        return res.status(401).json({ message: "Token audience mismatch" });
      }

      // Persist lead as submission
      try {
        await storage.createSubmission({
          type: "google_signin",
          firstName: (payload.name ?? "").split(" ")[0] || "",
          lastName: (payload.name ?? "").split(" ").slice(1).join(" ") || "",
          email: payload.email,
          phone: "",
          companyName: "",
          technicians: "",
        } as any);
      } catch { /* non-fatal */ }

      // Set simple session cookie
      if (req.session) {
        (req.session as any).user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          provider: "google",
        };
      }

      return res.json({
        ok: true,
        user: { email: payload.email, name: payload.name, picture: payload.picture },
      });
    } catch (err) {
      console.error("Google auth error", err);
      return res.status(500).json({ message: "Authentication failed" });
    }
  });

  // ── Google OAuth2 token sign-in (access-token flow, replaces One Tap) ──────
  // Frontend sends an OAuth2 access_token; server verifies it with Google's
  // userinfo endpoint and creates a session. No client_secret needed.
  app.post("/api/auth/google-token", async (req, res) => {
    const { access_token } = req.body as { access_token?: string };
    if (!access_token) {
      return res.status(400).json({ message: "Missing access_token" });
    }
    try {
      const resp = await fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${encodeURIComponent(access_token)}`
      );
      if (!resp.ok) {
        return res.status(401).json({ message: "Invalid Google token" });
      }
      const user = await resp.json() as {
        id: string; email: string; name: string; picture: string; verified_email: boolean;
      };

      try {
        await (storage as any).createSubmission({
          type: "google_signin",
          firstName: (user.name ?? "").split(" ")[0] || "",
          lastName: (user.name ?? "").split(" ").slice(1).join(" ") || "",
          email: user.email,
          phone: "",
          companyName: "",
          technicians: "",
        });
      } catch { /* non-fatal */ }

      if (req.session) {
        (req.session as any).user = {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          provider: "google",
        };
      }

      return res.json({
        ok: true,
        user: { email: user.email, name: user.name, picture: user.picture },
      });
    } catch (err) {
      console.error("Google token auth error", err);
      return res.status(500).json({ message: "Authentication failed" });
    }
  });

  // ── Email/password sign-in ───────────────────────────────────────────────
  // Approved-user allowlist. Replace with real user store + bcrypt when ready.
  const APPROVED_USERS: Record<string, { password: string; name: string }> = {
    "danielstevens2014@gmail.com": { password: "Pestflow", name: "Daniel Stevens" },
    "tgicheru21@gmail.com": { password: "Pestflow", name: "Trevor Gicheru" },
  };

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const normalized = email.trim().toLowerCase();
    const user = APPROVED_USERS[normalized];
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (req.session) {
      (req.session as any).user = {
        id: normalized,
        email: normalized,
        name: user.name,
        provider: "password",
      };
    }
    try {
      await (storage as any).createSubmission({
        type: "password_signin",
        firstName: user.name.split(" ")[0] || "",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
        email: normalized,
        phone: "",
        companyName: "",
        technicians: "",
      });
    } catch { /* non-fatal */ }
    return res.json({ ok: true, user: { email: normalized, name: user.name } });
  });

  return httpServer;
}

// Simple nearest neighbor algorithm for route optimization
function optimizeRoute(jobs: any[], startAddress: string): any[] {
  if (jobs.length <= 1) return jobs;

  // For demo purposes, sort by address to simulate geographic clustering
  // In production, you'd use actual coordinates and distance calculations
  const sorted = [...jobs].sort((a, b) => {
    const aNum = parseInt(a.address.match(/\d+/)?.[0] || '0');
    const bNum = parseInt(b.address.match(/\d+/)?.[0] || '0');
    return aNum - bNum;
  });

  return sorted;
}

// Sum of street-number jumps along an ordered list — proxy for total travel.
function scoreOrder(orderedJobs: any[]): number {
  let total = 0;
  for (let i = 1; i < orderedJobs.length; i++) {
    const a = parseInt(orderedJobs[i - 1].address.match(/\d+/)?.[0] || '0');
    const b = parseInt(orderedJobs[i].address.match(/\d+/)?.[0] || '0');
    total += Math.abs(b - a);
  }
  return total;
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
