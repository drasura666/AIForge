import { type User, type InsertUser, type ChatSession, type InsertChatSession, type StemProblem, type InsertStemProblem, type CodeProject, type InsertCodeProject, type ResearchDocument, type InsertResearchDocument, type Quiz, type InsertQuiz, type CreativeProject, type InsertCreativeProject } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Chat session methods
  getChatSessions(userId: string): Promise<ChatSession[]>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, session: Partial<ChatSession>): Promise<ChatSession | undefined>;

  // STEM problem methods
  getStemProblems(userId: string): Promise<StemProblem[]>;
  createStemProblem(problem: InsertStemProblem): Promise<StemProblem>;

  // Code project methods
  getCodeProjects(userId: string): Promise<CodeProject[]>;
  createCodeProject(project: InsertCodeProject): Promise<CodeProject>;
  updateCodeProject(id: string, project: Partial<CodeProject>): Promise<CodeProject | undefined>;

  // Research document methods
  getResearchDocuments(userId: string): Promise<ResearchDocument[]>;
  createResearchDocument(document: InsertResearchDocument): Promise<ResearchDocument>;

  // Quiz methods
  getQuizzes(userId: string): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz | undefined>;

  // Creative project methods
  getCreativeProjects(userId: string): Promise<CreativeProject[]>;
  createCreativeProject(project: InsertCreativeProject): Promise<CreativeProject>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatSessions: Map<string, ChatSession>;
  private stemProblems: Map<string, StemProblem>;
  private codeProjects: Map<string, CodeProject>;
  private researchDocuments: Map<string, ResearchDocument>;
  private quizzes: Map<string, Quiz>;
  private creativeProjects: Map<string, CreativeProject>;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.stemProblems = new Map();
    this.codeProjects = new Map();
    this.researchDocuments = new Map();
    this.quizzes = new Map();
    this.creativeProjects = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getChatSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(
      session => session.userId === userId
    );
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      id,
      userId: insertSession.userId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date()
    };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getStemProblems(userId: string): Promise<StemProblem[]> {
    return Array.from(this.stemProblems.values()).filter(
      problem => problem.userId === userId
    );
  }

  async createStemProblem(insertProblem: InsertStemProblem): Promise<StemProblem> {
    const id = randomUUID();
    const problem: StemProblem = {
      ...insertProblem,
      id,
      userId: insertProblem.userId || null,
      createdAt: new Date()
    };
    this.stemProblems.set(id, problem);
    return problem;
  }

  async getCodeProjects(userId: string): Promise<CodeProject[]> {
    return Array.from(this.codeProjects.values()).filter(
      project => project.userId === userId
    );
  }

  async createCodeProject(insertProject: InsertCodeProject): Promise<CodeProject> {
    const id = randomUUID();
    const project: CodeProject = {
      ...insertProject,
      id,
      userId: insertProject.userId || null,
      createdAt: new Date()
    };
    this.codeProjects.set(id, project);
    return project;
  }

  async updateCodeProject(id: string, updates: Partial<CodeProject>): Promise<CodeProject | undefined> {
    const project = this.codeProjects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.codeProjects.set(id, updatedProject);
    return updatedProject;
  }

  async getResearchDocuments(userId: string): Promise<ResearchDocument[]> {
    return Array.from(this.researchDocuments.values()).filter(
      doc => doc.userId === userId
    );
  }

  async createResearchDocument(insertDocument: InsertResearchDocument): Promise<ResearchDocument> {
    const id = randomUUID();
    const document: ResearchDocument = {
      ...insertDocument,
      id,
      userId: insertDocument.userId || null,
      createdAt: new Date()
    };
    this.researchDocuments.set(id, document);
    return document;
  }

  async getQuizzes(userId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      quiz => quiz.userId === userId
    );
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = randomUUID();
    const quiz: Quiz = {
      ...insertQuiz,
      id,
      userId: insertQuiz.userId || null,
      createdAt: new Date()
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;
    
    const updatedQuiz = { ...quiz, ...updates };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  async getCreativeProjects(userId: string): Promise<CreativeProject[]> {
    return Array.from(this.creativeProjects.values()).filter(
      project => project.userId === userId
    );
  }

  async createCreativeProject(insertProject: InsertCreativeProject): Promise<CreativeProject> {
    const id = randomUUID();
    const project: CreativeProject = {
      ...insertProject,
      id,
      userId: insertProject.userId || null,
      createdAt: new Date()
    };
    this.creativeProjects.set(id, project);
    return project;
  }
}

export const storage = new MemStorage();
