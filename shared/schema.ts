import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { hasAtMostTenPhoneDigits } from "./phone";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Jobs table for route optimization
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  serviceType: text("service_type").notNull(),
  duration: integer("duration").notNull().default(30),
  status: text("status").notNull().default("unconfirmed"),
  scheduledDate: text("scheduled_date"),
  scheduledTime: text("scheduled_time"),
  technicianId: varchar("technician_id"),
  isRecurring: boolean("is_recurring").default(false),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// Routes table for optimized routes
export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  technicianId: varchar("technician_id"),
  date: text("date").notNull(),
  startAddress: text("start_address").notNull(),
  endAddress: text("end_address").notNull(),
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }),
  totalDuration: integer("total_duration"),
  jobOrder: text("job_order").array(),
  optimizedAt: timestamp("optimized_at").defaultNow(),
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  optimizedAt: true,
});

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;

// Customers table
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Services table (preset templates)
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull().default(30),
  isPreset: boolean("is_preset").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Invoices table
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  jobId: varchar("job_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentLink: text("payment_link"),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// User onboarding progress
export const onboardingProgress = pgTable("onboarding_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  step: integer("step").notNull().default(0),
  completed: boolean("completed").default(false),
  customerId: varchar("customer_id"),
  serviceId: varchar("service_id"),
  jobId: varchar("job_id"),
  invoiceId: varchar("invoice_id"),
  skippedAt: timestamp("skipped_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOnboardingProgressSchema = createInsertSchema(onboardingProgress).omit({
  id: true,
  createdAt: true,
});

export type InsertOnboardingProgress = z.infer<typeof insertOnboardingProgressSchema>;
export type OnboardingProgress = typeof onboardingProgress.$inferSelect;

// Feature usage tracking for guided tooltips
export const featureUsage = pgTable("feature_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  featureName: text("feature_name").notNull(),
  useCount: integer("use_count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
});

export const insertFeatureUsageSchema = createInsertSchema(featureUsage).omit({
  id: true,
});

export type InsertFeatureUsage = z.infer<typeof insertFeatureUsageSchema>;
export type FeatureUsage = typeof featureUsage.$inferSelect;

// Lead submissions from landing page (demo requests, newsletter signups)
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().default("demo"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyName: text("company_name"),
  website: text("website"),
  technicians: text("technicians"),
  routes: text("routes"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  // Quiz data
  routeAnswers: jsonb("route_answers"),
  quizAnswers: jsonb("quiz_answers"),
  quizRevenue: integer("quiz_revenue"),
  // Activation tracking
  customersImported: integer("customers_imported").default(0),
  activated: boolean("activated").default(false),
  // Durable MTA handoff state. A subscriber is not considered enrolled until
  // the explicit marketing-group request succeeds with drip campaigns enabled.
  mtaStatus: text("mta_status").notNull().default("not_requested"),
  mtaError: text("mta_error"),
  mtaAttempts: integer("mta_attempts").notNull().default(0),
  mtaSubscriberId: integer("mta_subscriber_id"),
  mtaE164Number: text("mta_e164_number"),
  mtaGroupIds: jsonb("mta_group_ids").$type<number[]>(),
  mtaSource: text("mta_source"),
  mtaLastAttemptAt: timestamp("mta_last_attempt_at"),
  mtaSyncedAt: timestamp("mta_synced_at"),
  mtaNextRetryAt: timestamp("mta_next_retry_at"),
});

export const insertSubmissionSchema = createInsertSchema(submissions)
  .omit({
    id: true,
    submittedAt: true,
    mtaStatus: true,
    mtaError: true,
    mtaAttempts: true,
    mtaSubscriberId: true,
    mtaE164Number: true,
    mtaGroupIds: true,
    mtaSource: true,
    mtaLastAttemptAt: true,
    mtaSyncedAt: true,
    mtaNextRetryAt: true,
  })
  .refine((submission) => hasAtMostTenPhoneDigits(submission.phone), {
    path: ["phone"],
    message: "Phone number cannot exceed 10 digits",
  });

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

// Canonical delivery ledger for the prospect list shown in app.pestflow.org/admin.
// A prospect can create many raw submissions, but has one durable Meta event ID
// and one delivery state. This makes the database—not the browser Pixel or
// PostHog session capture—the source of truth for conversion delivery.
export const metaProspectRegistrations = pgTable("meta_prospect_registrations", {
  prospectKeyHash: varchar("prospect_key_hash", { length: 64 }).primaryKey(),
  eventId: varchar("event_id", { length: 100 }).notNull(),
  firstSubmissionId: varchar("first_submission_id").notNull(),
  latestSubmissionId: varchar("latest_submission_id").notNull(),
  firstSubmittedAt: timestamp("first_submitted_at").notNull(),
  latestSubmittedAt: timestamp("latest_submitted_at").notNull(),
  eventTime: timestamp("event_time").notNull(),
  sourceType: text("source_type").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  eventSourceUrl: text("event_source_url"),
  clientIpAddress: text("client_ip_address"),
  clientUserAgent: text("client_user_agent"),
  fbc: text("fbc"),
  fbp: text("fbp"),
  status: text("status").notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  error: text("error"),
  eventsReceived: integer("events_received"),
  fbtraceId: text("fbtrace_id"),
  lastAttemptAt: timestamp("last_attempt_at"),
  nextRetryAt: timestamp("next_retry_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type MetaProspectRegistration =
  typeof metaProspectRegistrations.$inferSelect;
