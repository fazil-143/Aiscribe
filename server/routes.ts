import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertGenerationSchema } from "@shared/schema";
import { generateContent } from "./openai";
import { sendPasswordResetEmail, verifyResetToken, resetPassword } from './email';

// Rate limiting middleware
const rateLimitMiddleware = async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return next();
  }

  const user = req.user;
  
  // Check if free user has reached daily limit
  if (!user.premium && user.dailyGenerations >= 3) {
    return res.status(403).json({ 
      message: "Daily generation limit reached",
      generationsLeft: 0
    });
  }

  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Apply rate limiting to all tool-related routes
  app.use("/api/tools", rateLimitMiddleware);
  app.use("/api/generate", rateLimitMiddleware);
  app.use("/api/generations", rateLimitMiddleware);

  // Get all AI tools
  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await storage.getTools();
      res.status(200).json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  // Get a specific AI tool
  app.get("/api/tools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tool ID" });
      }
      
      const tool = await storage.getTool(id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      res.status(200).json(tool);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  // Generate content using OpenAI
  app.post("/api/generate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { prompt, toolId, tone, length } = req.body;

      if (!prompt || !toolId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = req.user;
      const tool = await storage.getTool(parseInt(toolId));

      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }

      // Check if free user has reached daily limit
      if (!user.premium && user.dailyGenerations >= 3) {
        return res.status(403).json({ message: "Daily generation limit reached" });
      }

      // Generate content
      const content = await generateContent(prompt, tool.name, tone, length);

      // Increment user's generation count
      await storage.incrementUserGenerations(user.id);

      const generationsLeft = user?.premium ? "∞" : user?.dailyGenerations ? 3 - user.dailyGenerations : 3;

      res.status(200).json({ content, generationsLeft });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Save a generation
  app.post("/api/generations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user;
      
      // Only premium users can save generations
      if (!user.premium) {
        return res.status(403).json({ message: "Premium subscription required to save generations" });
      }

      const validationSchema = insertGenerationSchema.extend({
        toolId: z.number(),
        userId: z.number().default(user.id),
      });

      const validatedData = validationSchema.parse({
        ...req.body,
        userId: user.id
      });

      const generation = await storage.createGeneration(validatedData);
      res.status(201).json(generation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save generation" });
    }
  });

  // Get user's generations
  app.get("/api/generations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user;
      
      // Only premium users can retrieve saved generations
      if (!user.premium) {
        return res.status(403).json({ message: "Premium subscription required to retrieve saved generations" });
      }

      const generations = await storage.getGenerations(user.id);
      res.status(200).json(generations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });

  // Delete a generation
  app.delete("/api/generations/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid generation ID" });
      }
      
      const generation = await storage.getGeneration(id);
      
      if (!generation) {
        return res.status(404).json({ message: "Generation not found" });
      }
      
      // Check if the generation belongs to the user
      if (generation.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this generation" });
      }
      
      await storage.deleteGeneration(id);
      res.status(200).json({ message: "Generation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete generation" });
    }
  });

  // Upgrade to premium
  app.post("/api/upgrade", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // In a real app, this would involve payment processing
      // For this demo, we're just upgrading the user directly
      
      const user = await storage.updateUserPremium(req.user.id, true);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ message: "Upgrade successful", user });
    } catch (error) {
      res.status(500).json({ message: "Failed to process upgrade" });
    }
  });

  // Request password reset
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: 'Username is required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        // Don't reveal if user exists or not
        return res.status(200).json({ message: 'If an account exists with that username, a password reset email has been sent' });
      }

      const result = await sendPasswordResetEmail(user.email, user.username);
      if (!result.success) {
        return res.status(500).json({ message: result.message });
      }

      res.status(200).json({ message: 'If an account exists with that username, a password reset email has been sent' });
    } catch (error) {
      console.error('Error in forgot-password:', error);
      res.status(500).json({ message: 'An error occurred while processing your request' });
    }
  });

  // Verify reset token
  app.get('/api/auth/verify-reset-token', async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Invalid token' });
      }

      const result = await verifyResetToken(token);
      if (!result.valid) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      res.status(200).json({ valid: true });
    } catch (error) {
      console.error('Error in verify-reset-token:', error);
      res.status(500).json({ message: 'An error occurred while verifying the token' });
    }
  });

  // Reset password
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }

      const result = await resetPassword(token, newPassword);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Error in reset-password:', error);
      res.status(500).json({ message: 'An error occurred while resetting your password' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
