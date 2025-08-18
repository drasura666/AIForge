import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  messages: jsonb("messages").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stemProblems = pgTable("stem_problems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const codeProjects = pgTable("code_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  language: text("language").notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const researchDocuments = pgTable("research_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content"),
  summary: text("summary"),
  citations: jsonb("citations"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  difficulty: text("difficulty").notNull(),
  questions: jsonb("questions").notNull(),
  score: text("score"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creativeProjects = pgTable("creative_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  type: text("type").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStemProblemSchema = createInsertSchema(stemProblems).omit({
  id: true,
  createdAt: true,
});

export const insertCodeProjectSchema = createInsertSchema(codeProjects).omit({
  id: true,
  createdAt: true,
});

export const insertResearchDocumentSchema = createInsertSchema(researchDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertCreativeProjectSchema = createInsertSchema(creativeProjects).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type StemProblem = typeof stemProblems.$inferSelect;
export type InsertStemProblem = z.infer<typeof insertStemProblemSchema>;
export type CodeProject = typeof codeProjects.$inferSelect;
export type InsertCodeProject = z.infer<typeof insertCodeProjectSchema>;
export type ResearchDocument = typeof researchDocuments.$inferSelect;
export type InsertResearchDocument = z.infer<typeof insertResearchDocumentSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type CreativeProject = typeof creativeProjects.$inferSelect;
export type InsertCreativeProject = z.infer<typeof insertCreativeProjectSchema>;

// AI Provider types
export const aiProviders = z.enum(["groq", "huggingface", "openrouter", "cohere", "gemini"]);
export type AIProvider = z.infer<typeof aiProviders>;

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
