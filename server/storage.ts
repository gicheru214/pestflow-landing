import { 
  type User, type InsertUser, 
  type Job, type InsertJob,
  type Route, type InsertRoute,
  type Customer, type InsertCustomer,
  type Service, type InsertService,
  type Invoice, type InsertInvoice,
  type OnboardingProgress, type InsertOnboardingProgress,
  type FeatureUsage, type InsertFeatureUsage,
  type Submission, type InsertSubmission,
  users, jobs, routes, customers, services, invoices, onboardingProgress, featureUsage, submissions 
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Jobs
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  getJobsByDate(date: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
  
  // Routes
  getRoutes(): Promise<Route[]>;
  getRoute(id: string): Promise<Route | undefined>;
  getRouteByDate(date: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: string, route: Partial<InsertRoute>): Promise<Route | undefined>;
  
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;
  
  // Services
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  getPresetServices(): Promise<Service[]>;
  
  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  
  // Onboarding
  getOnboardingProgress(userId?: string): Promise<OnboardingProgress | undefined>;
  createOnboardingProgress(progress: InsertOnboardingProgress): Promise<OnboardingProgress>;
  updateOnboardingProgress(id: string, progress: Partial<InsertOnboardingProgress>): Promise<OnboardingProgress | undefined>;
  
  // Feature Usage
  getFeatureUsage(userId: string, featureName: string): Promise<FeatureUsage | undefined>;
  incrementFeatureUsage(userId: string, featureName: string): Promise<FeatureUsage>;
  
  // Submissions
  getSubmissions(): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Jobs
  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs);
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobsByDate(date: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.scheduledDate, date));
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(insertJob).returning();
    return job;
  }

  async updateJob(id: string, jobUpdate: Partial<InsertJob>): Promise<Job | undefined> {
    const [job] = await db.update(jobs).set(jobUpdate).where(eq(jobs.id, id)).returning();
    return job;
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id)).returning();
    return result.length > 0;
  }

  // Routes
  async getRoutes(): Promise<Route[]> {
    return await db.select().from(routes);
  }

  async getRoute(id: string): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route;
  }

  async getRouteByDate(date: string): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.date, date));
    return route;
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const [route] = await db.insert(routes).values(insertRoute).returning();
    return route;
  }

  async updateRoute(id: string, routeUpdate: Partial<InsertRoute>): Promise<Route | undefined> {
    const [route] = await db.update(routes).set(routeUpdate).where(eq(routes.id, id)).returning();
    return route;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async updateCustomer(id: string, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db.update(customers).set(customerUpdate).where(eq(customers.id, id)).returning();
    return customer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id)).returning();
    return result.length > 0;
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async getPresetServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isPreset, true));
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices);
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(insertInvoice).returning();
    return invoice;
  }

  async updateInvoice(id: string, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db.update(invoices).set(invoiceUpdate).where(eq(invoices.id, id)).returning();
    return invoice;
  }

  // Onboarding
  async getOnboardingProgress(userId?: string): Promise<OnboardingProgress | undefined> {
    if (userId) {
      const [progress] = await db.select().from(onboardingProgress).where(eq(onboardingProgress.userId, userId));
      return progress;
    }
    const [progress] = await db.select().from(onboardingProgress);
    return progress;
  }

  async createOnboardingProgress(insertProgress: InsertOnboardingProgress): Promise<OnboardingProgress> {
    const [progress] = await db.insert(onboardingProgress).values(insertProgress).returning();
    return progress;
  }

  async updateOnboardingProgress(id: string, progressUpdate: Partial<InsertOnboardingProgress>): Promise<OnboardingProgress | undefined> {
    const [progress] = await db.update(onboardingProgress).set(progressUpdate).where(eq(onboardingProgress.id, id)).returning();
    return progress;
  }

  // Feature Usage
  async getFeatureUsage(userId: string, featureName: string): Promise<FeatureUsage | undefined> {
    const [usage] = await db.select().from(featureUsage).where(
      and(eq(featureUsage.userId, userId), eq(featureUsage.featureName, featureName))
    );
    return usage;
  }

  async incrementFeatureUsage(userId: string, featureName: string): Promise<FeatureUsage> {
    const existing = await this.getFeatureUsage(userId, featureName);
    if (existing) {
      const [updated] = await db.update(featureUsage)
        .set({ useCount: existing.useCount + 1, lastUsedAt: new Date() })
        .where(eq(featureUsage.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(featureUsage)
      .values({ userId, featureName, useCount: 1 })
      .returning();
    return created;
  }

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions);
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(insertSubmission).returning();
    return submission;
  }
}

export const storage = new DatabaseStorage();
