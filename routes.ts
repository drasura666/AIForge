import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/ai-service";
import { insertChatSessionSchema, insertStemProblemSchema, insertCodeProjectSchema, insertResearchDocumentSchema, insertQuizSchema, insertCreativeProjectSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat API routes
  app.get("/api/chat/sessions", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const sessionData = insertChatSessionSchema.parse({
        ...req.body,
        userId
      });
      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const { message, provider, model, apiKey, sessionId } = req.body;
      
      if (!message || !provider || !apiKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const response = await aiService.sendMessage(message, provider, model, apiKey);
      
      if (sessionId) {
        const session = await storage.getChatSession(sessionId);
        if (session) {
          const messages = Array.isArray(session.messages) ? session.messages : [];
          messages.push(
            { id: Date.now().toString(), role: "user", content: message, timestamp: new Date().toISOString() },
            { id: (Date.now() + 1).toString(), role: "assistant", content: response, timestamp: new Date().toISOString() }
          );
          await storage.updateChatSession(sessionId, { messages });
        }
      }

      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // STEM Lab routes
  app.get("/api/stem/problems", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const problems = await storage.getStemProblems(userId);
      res.json(problems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch STEM problems" });
    }
  });

  app.post("/api/stem/solve", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const { subject, problem, provider, apiKey } = req.body;
      
      if (!problem || !provider || !apiKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const solution = await aiService.solveStemProblem(problem, subject, provider, apiKey);
      
      const problemData = insertStemProblemSchema.parse({
        userId,
        subject: subject || 'General',
        problem,
        solution
      });
      
      const savedProblem = await storage.createStemProblem(problemData);
      res.json(savedProblem);
    } catch (error) {
      console.error("STEM solve error:", error);
      res.status(500).json({ error: "Failed to solve problem" });
    }
  });

  // Code Lab routes
  app.get("/api/code/projects", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const projects = await storage.getCodeProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch code projects" });
    }
  });

  app.post("/api/code/generate", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const { prompt, language, provider, apiKey } = req.body;
      
      if (!prompt || !provider || !apiKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const code = await aiService.generateCode(prompt, language, provider, apiKey);
      
      const projectData = insertCodeProjectSchema.parse({
        userId,
        name: prompt.substring(0, 50) + '...',
        language: language || 'python',
        code
      });
      
      const project = await storage.createCodeProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Code generation error:", error);
      res.status(500).json({ error: "Failed to generate code" });
    }
  });

  app.post("/api/code/debug", async (req, res) => {
    try {
      const { code, language, provider, apiKey } = req.body;
      
      if (!code || !provider || !apiKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const suggestions = await aiService.debugCode(code, language, provider, apiKey);
      res.json({ suggestions });
    } catch (error) {
      console.error("Code debug error:", error);
      res.status(500).json({ error: "Failed to debug code" });
    }
  });

  // Research Hub routes
  app.get("/api/research/documents", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const documents = await storage.getResearchDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch research documents" });
    }
  });

  app.post("/api/research/upload", upload.single('file'), async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const { provider, apiKey } = req.body;
      
      if (!req.file || !provider || !apiKey) {
        return res.status(400).json({ error: "Missing file or API credentials" });
      }

      const content = req.file.buffer.toString('utf-8');
      const summary = await aiService.analyzeDocument(content, provider, apiKey);
      
      const documentData = insertResearchDocumentSchema.parse({
        userId,
        title: req.file.originalname,
        content,
        summary
      });
      
      const document = await storage.createResearchDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ error: "Failed to process document" });
    }
  });

  app.post("/api/research/generate", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const { title, notes, citationStyle, length, provider, apiKey } = req.body;
      
      if (!title || !provider || !apiKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const paper = await aiService.generatePaper(title, notes, citationStyle, length, provider, apiKey);
      
      const documentData = insertResearchDocumentSchema.parse({
        userId,
        title,
        content: paper,
        summary: `Generated ${citationStyle} paper on ${title}`
      });
      
      const document = await storage.createResearchDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Paper generation error:", error);
      res.status(500).json({ error: "Failed to generate paper" });
    }
  });

  // Exam Prep routes
  app.get("/api/exam/quizzes", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const quizzes = await storage.getQuizzes(userId);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  });

  app.post("/api/exam/generate", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const { subject, difficulty, questionCount, provider, apiKey } = req.body;
      
      if (!subject || !provider || !apiKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const questions = await aiService.generateQuiz(subject, difficulty, questionCount, provider, apiKey);
      
      const quizData = insertQuizSchema.parse({
        userId,
        subject,
        difficulty: difficulty || 'medium',
        questions
      });
      
      const quiz = await storage.createQuiz(quizData);
      res.json(quiz);
    } catch (error) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  // Creative Studio routes
  app.get("/api/creative/projects", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const projects = await storage.getCreativeProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch creative projects" });
    }
  });

  app.post("/api/creative/scenario", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const { title, scenario, type, provider, apiKey } = req.body;
      
      if (!scenario || !provider || !apiKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const outcomes = await aiService.generateScenario(scenario, type, provider, apiKey);
      
      const projectData = insertCreativeProjectSchema.parse({
        userId,
        title: title || 'Scenario Analysis',
        type: type || 'scenario',
        data: { scenario, outcomes }
      });
      
      const project = await storage.createCreativeProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Scenario generation error:", error);
      res.status(500).json({ error: "Failed to generate scenario" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
