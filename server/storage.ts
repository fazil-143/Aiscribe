import { users, User, InsertUser, aiTools, Tool, InsertTool, generations, Generation, InsertGeneration } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { hashPassword } from "@shared/utils";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPremium(id: number, premium: boolean): Promise<User | undefined>;
  incrementUserGenerations(id: number): Promise<User | undefined>;
  resetUserGenerations(id: number): Promise<User | undefined>;
  
  // AI Tool operations
  getTools(): Promise<Tool[]>;
  getTool(id: number): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  
  // Generation operations
  getGenerations(userId: number): Promise<Generation[]>;
  getGeneration(id: number): Promise<Generation | undefined>;
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  deleteGeneration(id: number): Promise<boolean>;

  // Session store
  sessionStore: any;

  // Password reset operations
  storeResetToken(username: string, token: string, expiry: Date): Promise<void>;
  verifyResetToken(token: string): Promise<{ valid: boolean; username?: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tools: Map<number, Tool>;
  private generations: Map<number, Generation>;
  private resetTokens: Map<string, { username: string; expiry: Date }>;
  private userIdCounter: number;
  private toolIdCounter: number;
  private generationIdCounter: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.tools = new Map();
    this.generations = new Map();
    this.resetTokens = new Map();
    this.userIdCounter = 1;
    this.toolIdCounter = 1;
    this.generationIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize with default AI tools
    this.initializeTools();
  }

  private initializeTools() {
    const defaultTools: InsertTool[] = [
      {
        name: "Blog Generator",
        description: "Generate full blog posts with sections, headings, and engaging content based on your topic.",
        icon: "edit_note",
        color: "primary",
      },
      {
        name: "Title Creator",
        description: "Generate attention-grabbing titles for blogs, articles, or social media posts in seconds.",
        icon: "title",
        color: "secondary",
      },
      {
        name: "Idea Summarizer",
        description: "Transform lengthy concepts into concise, impactful summaries without losing key information.",
        icon: "tips_and_updates",
        color: "accent",
      },
      {
        name: "Content Rewriter",
        description: "Rewrite existing content to improve readability, tone, or to create multiple variations.",
        icon: "cached",
        color: "primary",
      },
      {
        name: "Email Composer",
        description: "Create professional emails with appropriate tone and structure for any business context.",
        icon: "mail",
        color: "secondary",
      },
      {
        name: "Social Media Copy",
        description: "Create platform-specific content that engages followers and drives conversions.",
        icon: "share",
        color: "accent",
      },
    ];

    defaultTools.forEach(tool => this.createTool(tool));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      premium: false, 
      dailyGenerations: 0,
      lastGeneratedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPremium(id: number, premium: boolean): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, premium };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async incrementUserGenerations(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const now = new Date();
    const lastDate = user.lastGeneratedAt;
    
    // Reset counter if it's a new day
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

  async resetUserGenerations(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, dailyGenerations: 0 };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Tool operations
  async getTools(): Promise<Tool[]> {
    return Array.from(this.tools.values());
  }

  async getTool(id: number): Promise<Tool | undefined> {
    return this.tools.get(id);
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const id = this.toolIdCounter++;
    const tool: Tool = { ...insertTool, id };
    this.tools.set(id, tool);
    return tool;
  }

  // Generation operations
  async getGenerations(userId: number): Promise<Generation[]> {
    return Array.from(this.generations.values())
      .filter(gen => gen.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getGeneration(id: number): Promise<Generation | undefined> {
    return this.generations.get(id);
  }

  async createGeneration(insertGeneration: InsertGeneration): Promise<Generation> {
    const id = this.generationIdCounter++;
    const now = new Date();
    
    // Create a new object with the required structure to satisfy the Generation type
    const generation: Generation = {
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

  async deleteGeneration(id: number): Promise<boolean> {
    return this.generations.delete(id);
  }

  // Password reset operations
  async storeResetToken(username: string, token: string, expiry: Date): Promise<void> {
    this.resetTokens.set(token, { username, expiry });
  }

  async verifyResetToken(token: string): Promise<{ valid: boolean; username?: string }> {
    const resetData = this.resetTokens.get(token);
    if (!resetData) {
      return { valid: false };
    }

    if (resetData.expiry < new Date()) {
      this.resetTokens.delete(token);
      return { valid: false };
    }

    return { valid: true, username: resetData.username };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const resetData = this.resetTokens.get(token);
    if (!resetData) {
      return { success: false, message: 'Invalid or expired reset token' };
    }

    if (resetData.expiry < new Date()) {
      this.resetTokens.delete(token);
      return { success: false, message: 'Reset token has expired' };
    }

    const user = Array.from(this.users.values()).find(u => u.username === resetData.username);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Update the user's password
    const hashedPassword = await hashPassword(newPassword);
    this.users.set(user.id, { ...user, password: hashedPassword });

    // Remove the used token
    this.resetTokens.delete(token);

    return { success: true, message: 'Password reset successful' };
  }
}

export const storage = new MemStorage();
