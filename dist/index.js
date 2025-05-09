// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";

// shared/utils.ts
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// server/storage.ts
var MemoryStore = createMemoryStore(session);
var MemStorage = class {
  users;
  tools;
  generations;
  resetTokens;
  userIdCounter;
  toolIdCounter;
  generationIdCounter;
  sessionStore;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.tools = /* @__PURE__ */ new Map();
    this.generations = /* @__PURE__ */ new Map();
    this.resetTokens = /* @__PURE__ */ new Map();
    this.userIdCounter = 1;
    this.toolIdCounter = 1;
    this.generationIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
    });
    this.initializeTools();
  }
  initializeTools() {
    const defaultTools = [
      {
        name: "Blog Generator",
        description: "Generate full blog posts with sections, headings, and engaging content based on your topic.",
        icon: "edit_note",
        color: "primary"
      },
      {
        name: "Title Creator",
        description: "Generate attention-grabbing titles for blogs, articles, or social media posts in seconds.",
        icon: "title",
        color: "secondary"
      },
      {
        name: "Idea Summarizer",
        description: "Transform lengthy concepts into concise, impactful summaries without losing key information.",
        icon: "tips_and_updates",
        color: "accent"
      },
      {
        name: "Content Rewriter",
        description: "Rewrite existing content to improve readability, tone, or to create multiple variations.",
        icon: "cached",
        color: "primary"
      },
      {
        name: "Email Composer",
        description: "Create professional emails with appropriate tone and structure for any business context.",
        icon: "mail",
        color: "secondary"
      },
      {
        name: "Social Media Copy",
        description: "Create platform-specific content that engages followers and drives conversions.",
        icon: "share",
        color: "accent"
      }
    ];
    defaultTools.forEach((tool) => this.createTool(tool));
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const user = {
      ...insertUser,
      id,
      premium: false,
      dailyGenerations: 0,
      lastGeneratedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  async updateUserPremium(id, premium) {
    const user = await this.getUser(id);
    if (!user) return void 0;
    const updatedUser = { ...user, premium };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async incrementUserGenerations(id) {
    const user = await this.getUser(id);
    if (!user) return void 0;
    const now = /* @__PURE__ */ new Date();
    const lastDate = user.lastGeneratedAt;
    if (lastDate && lastDate.getDate() !== now.getDate()) {
      const updatedUser = {
        ...user,
        dailyGenerations: 1,
        lastGeneratedAt: now
      };
      this.users.set(id, updatedUser);
      return updatedUser;
    } else {
      const updatedUser = {
        ...user,
        dailyGenerations: user.dailyGenerations + 1,
        lastGeneratedAt: now
      };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
  }
  async resetUserGenerations(id) {
    const user = await this.getUser(id);
    if (!user) return void 0;
    const updatedUser = { ...user, dailyGenerations: 0 };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Tool operations
  async getTools() {
    return Array.from(this.tools.values());
  }
  async getTool(id) {
    return this.tools.get(id);
  }
  async createTool(insertTool) {
    const id = this.toolIdCounter++;
    const tool = { ...insertTool, id };
    this.tools.set(id, tool);
    return tool;
  }
  // Generation operations
  async getGenerations(userId) {
    return Array.from(this.generations.values()).filter((gen) => gen.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async getGeneration(id) {
    return this.generations.get(id);
  }
  async createGeneration(insertGeneration) {
    const id = this.generationIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const generation = {
      id,
      userId: insertGeneration.userId,
      toolId: insertGeneration.toolId,
      prompt: insertGeneration.prompt,
      output: insertGeneration.output,
      title: insertGeneration.title,
      tags: insertGeneration.tags || null,
      createdAt: now
    };
    this.generations.set(id, generation);
    return generation;
  }
  async deleteGeneration(id) {
    return this.generations.delete(id);
  }
  // Password reset operations
  async storeResetToken(username, token, expiry) {
    this.resetTokens.set(token, { username, expiry });
  }
  async verifyResetToken(token) {
    const resetData = this.resetTokens.get(token);
    if (!resetData) {
      return { valid: false };
    }
    if (resetData.expiry < /* @__PURE__ */ new Date()) {
      this.resetTokens.delete(token);
      return { valid: false };
    }
    return { valid: true, username: resetData.username };
  }
  async resetPassword(token, newPassword) {
    const resetData = this.resetTokens.get(token);
    if (!resetData) {
      return { success: false, message: "Invalid or expired reset token" };
    }
    if (resetData.expiry < /* @__PURE__ */ new Date()) {
      this.resetTokens.delete(token);
      return { success: false, message: "Reset token has expired" };
    }
    const user = Array.from(this.users.values()).find((u) => u.username === resetData.username);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const hashedPassword = await hashPassword(newPassword);
    this.users.set(user.id, { ...user, password: hashedPassword });
    this.resetTokens.delete(token);
    return { success: true, message: "Password reset successful" };
  }
};
var storage = new MemStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "aiscribe-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      secure: process.env.NODE_ENV === "production"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/routes.ts
import { z } from "zod";

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  premium: boolean("premium").default(false).notNull(),
  dailyGenerations: integer("daily_generations").default(0).notNull(),
  lastGeneratedAt: timestamp("last_generated_at")
});
var aiTools = pgTable("ai_tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull()
});
var generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  toolId: integer("tool_id").notNull(),
  prompt: text("prompt").notNull(),
  output: text("output").notNull(),
  title: text("title").notNull(),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertToolSchema = createInsertSchema(aiTools).pick({
  name: true,
  description: true,
  icon: true,
  color: true
});
var insertGenerationSchema = createInsertSchema(generations).pick({
  userId: true,
  toolId: true,
  prompt: true,
  output: true,
  title: true,
  tags: true
});

// server/openai.ts
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function generateContent(prompt, toolType, tone = "Professional", length = "Standard") {
  let systemPrompt = "";
  switch (toolType) {
    case "Blog Generator":
      systemPrompt = `You are a professional blog writer. Create a well-structured blog post with headings, paragraphs, and relevant content. The tone should be ${tone}. Length should be ${length}.`;
      break;
    case "Title Creator":
      systemPrompt = `You are a title generation expert. Create a list of 10 attention-grabbing, clickable titles for content. The tone should be ${tone}.`;
      break;
    case "Idea Summarizer":
      systemPrompt = `You are a summarization expert. Transform the given text into a concise, impactful summary that captures the key points. The tone should be ${tone}. Length should be ${length}.`;
      break;
    case "Content Rewriter":
      systemPrompt = `You are a content rewriting specialist. Rewrite the provided content while maintaining its meaning but improving its clarity, readability, and engagement. The tone should be ${tone}. Length should be ${length}.`;
      break;
    case "Email Composer":
      systemPrompt = `You are an email writing expert. Create a professional email that is clear, concise, and effective. The tone should be ${tone}. Length should be ${length}.`;
      break;
    case "Social Media Copy":
      systemPrompt = `You are a social media copywriter. Create engaging, platform-specific content that drives engagement. The tone should be ${tone}. Length should be ${length}.`;
      break;
    default:
      systemPrompt = `You are a professional content writer. Create high-quality content based on the given prompt. The tone should be ${tone}. Length should be ${length}.`;
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2e3
    });
    return response.choices[0].message.content || "Sorry, I couldn't generate content.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate content. Please try again later.");
  }
}

// server/email.ts
import nodemailer from "nodemailer";
import { randomBytes as randomBytes2 } from "crypto";
import dotenv2 from "dotenv";
dotenv2.config();
var transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
function generateToken() {
  return randomBytes2(32).toString("hex");
}
async function sendPasswordResetEmail(email, username) {
  try {
    const resetToken = generateToken();
    const resetExpiry = new Date(Date.now() + 36e5);
    await storage.storeResetToken(username, resetToken, resetExpiry);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello ${username},</p>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
      `
    };
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Password reset email sent successfully" };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, message: "Failed to send password reset email" };
  }
}
async function verifyResetToken(token) {
  try {
    const result = await storage.verifyResetToken(token);
    return result;
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return { valid: false };
  }
}
async function resetPassword(token, newPassword) {
  try {
    const result = await storage.resetPassword(token, newPassword);
    return result;
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, message: "Failed to reset password" };
  }
}

// server/routes.ts
var rateLimitMiddleware = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  const user = req.user;
  if (!user.premium && user.dailyGenerations >= 3) {
    return res.status(403).json({
      message: "Daily generation limit reached",
      generationsLeft: 0
    });
  }
  next();
};
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.use("/api/tools", rateLimitMiddleware);
  app2.use("/api/generate", rateLimitMiddleware);
  app2.use("/api/generations", rateLimitMiddleware);
  app2.get("/api/tools", async (req, res) => {
    try {
      const tools = await storage.getTools();
      res.status(200).json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });
  app2.get("/api/tools/:id", async (req, res) => {
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
  app2.post("/api/generate", async (req, res) => {
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
      if (!user.premium && user.dailyGenerations >= 3) {
        return res.status(403).json({ message: "Daily generation limit reached" });
      }
      const content = await generateContent(prompt, tool.name, tone, length);
      await storage.incrementUserGenerations(user.id);
      const generationsLeft = user?.premium ? "\u221E" : user?.dailyGenerations ? 3 - user.dailyGenerations : 3;
      res.status(200).json({ content, generationsLeft });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate content" });
    }
  });
  app2.post("/api/generations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = req.user;
      if (!user.premium) {
        return res.status(403).json({ message: "Premium subscription required to save generations" });
      }
      const validationSchema = insertGenerationSchema.extend({
        toolId: z.number(),
        userId: z.number().default(user.id)
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
  app2.get("/api/generations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = req.user;
      if (!user.premium) {
        return res.status(403).json({ message: "Premium subscription required to retrieve saved generations" });
      }
      const generations2 = await storage.getGenerations(user.id);
      res.status(200).json(generations2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });
  app2.delete("/api/generations/:id", async (req, res) => {
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
      if (generation.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this generation" });
      }
      await storage.deleteGeneration(id);
      res.status(200).json({ message: "Generation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete generation" });
    }
  });
  app2.post("/api/upgrade", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.updateUserPremium(req.user.id, true);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "Upgrade successful", user });
    } catch (error) {
      res.status(500).json({ message: "Failed to process upgrade" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(200).json({ message: "If an account exists with that username, a password reset email has been sent" });
      }
      const result = await sendPasswordResetEmail(user.email, user.username);
      if (!result.success) {
        return res.status(500).json({ message: result.message });
      }
      res.status(200).json({ message: "If an account exists with that username, a password reset email has been sent" });
    } catch (error) {
      console.error("Error in forgot-password:", error);
      res.status(500).json({ message: "An error occurred while processing your request" });
    }
  });
  app2.get("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid token" });
      }
      const result = await verifyResetToken(token);
      if (!result.valid) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      res.status(200).json({ valid: true });
    } catch (error) {
      console.error("Error in verify-reset-token:", error);
      res.status(500).json({ message: "An error occurred while verifying the token" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      const result = await resetPassword(token, newPassword);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Error in reset-password:", error);
      res.status(500).json({ message: "An error occurred while resetting your password" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  base: "./",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
