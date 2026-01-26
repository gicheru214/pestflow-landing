import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";

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

      res.json({
        route,
        optimizedJobs: scheduledJobs,
        estimatedDistance: `${selectedJobs.length * 5} miles`,
        estimatedDuration: `${Math.floor(selectedJobs.length * 0.75)} hours`
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
