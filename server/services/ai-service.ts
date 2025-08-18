import { AIProvider } from "@shared/schema";

interface AIResponse {
  content: string;
  model?: string;
}

class AIService {
  async sendMessage(message: string, provider: AIProvider, model: string, apiKey: string): Promise<string> {
    switch (provider) {
      case "groq":
        return this.callGroq(message, model, apiKey);
      case "huggingface":
        return this.callHuggingFace(message, model, apiKey);
      case "openrouter":
        return this.callOpenRouter(message, model, apiKey);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async solveStemProblem(problem: string, subject: string, provider: AIProvider, apiKey: string): Promise<string> {
    const prompt = `As an expert in ${subject}, solve this problem step by step with clear explanations:

Problem: ${problem}

Please provide:
1. Given information
2. Step-by-step solution
3. Final answer
4. Key concepts used`;

    return this.sendMessage(prompt, provider, "default", apiKey);
  }

  async generateCode(prompt: string, language: string, provider: AIProvider, apiKey: string): Promise<string> {
    const codePrompt = `Generate ${language} code for the following request. Provide clean, well-commented code:

Request: ${prompt}

Language: ${language}

Please include comments explaining the logic.`;

    return this.sendMessage(codePrompt, provider, "default", apiKey);
  }

  async debugCode(code: string, language: string, provider: AIProvider, apiKey: string): Promise<string> {
    const debugPrompt = `Analyze this ${language} code and provide debugging suggestions:

Code:
${code}

Please identify:
1. Potential bugs or errors
2. Performance improvements
3. Code quality suggestions
4. Best practices recommendations`;

    return this.sendMessage(debugPrompt, provider, "default", apiKey);
  }

  async analyzeDocument(content: string, provider: AIProvider, apiKey: string): Promise<string> {
    const analysisPrompt = `Analyze this document and provide a comprehensive summary:

Document:
${content.substring(0, 8000)}

Please provide:
1. Main topics and themes
2. Key findings or arguments
3. Important citations or references
4. Summary of conclusions`;

    return this.sendMessage(analysisPrompt, provider, "default", apiKey);
  }

  async generatePaper(title: string, notes: string, citationStyle: string, length: string, provider: AIProvider, apiKey: string): Promise<string> {
    const paperPrompt = `Generate an academic paper with the following specifications:

Title: ${title}
Citation Style: ${citationStyle}
Length: ${length}
Research Notes: ${notes}

Please create a well-structured academic paper with:
1. Abstract
2. Introduction
3. Literature Review
4. Methodology (if applicable)
5. Results/Discussion
6. Conclusion
7. References (properly formatted in ${citationStyle} style)`;

    return this.sendMessage(paperPrompt, provider, "default", apiKey);
  }

  async generateQuiz(subject: string, difficulty: string, questionCount: number, provider: AIProvider, apiKey: string): Promise<any[]> {
    const quizPrompt = `Generate ${questionCount} multiple choice questions for ${subject} at ${difficulty} difficulty level.

Format each question as JSON with this structure:
{
  "question": "Question text",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correct": 0,
  "explanation": "Why this answer is correct"
}

Return an array of questions in valid JSON format.`;

    const response = await this.sendMessage(quizPrompt, provider, "default", apiKey);
    
    try {
      // Try to parse the response as JSON
      const questions = JSON.parse(response);
      return Array.isArray(questions) ? questions : [questions];
    } catch {
      // If parsing fails, create a single question with the response
      return [{
        question: response.substring(0, 200),
        options: ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        correct: 0,
        explanation: "Generated from AI response"
      }];
    }
  }

  async generateScenario(scenario: string, type: string, provider: AIProvider, apiKey: string): Promise<any> {
    const scenarioPrompt = `Analyze this ${type} scenario and generate possible outcomes:

Scenario: ${scenario}

Please provide:
1. Positive impacts/opportunities
2. Challenges and risks
3. Timeline predictions
4. Strategic recommendations
5. Alternative scenarios

Format as a structured analysis with clear sections.`;

    const response = await this.sendMessage(scenarioPrompt, provider, "default", apiKey);
    
    return {
      analysis: response,
      scenarios: [
        { type: "optimistic", description: "Best case scenario outcomes" },
        { type: "realistic", description: "Most likely outcomes" },
        { type: "pessimistic", description: "Worst case scenario outcomes" }
      ]
    };
  }

  private async callGroq(message: string, model: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "llama3-8b-8192",
          messages: [{ role: "user", content: message }],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "No response from Groq";
    } catch (error) {
      console.error("Groq API error:", error);
      throw new Error("Failed to get response from Groq");
    }
  }

  private async callHuggingFace(message: string, model: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model || "microsoft/DialoGPT-medium"}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_length: 2048,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data[0]?.generated_text || data.generated_text || "No response from HuggingFace";
    } catch (error) {
      console.error("HuggingFace API error:", error);
      throw new Error("Failed to get response from HuggingFace");
    }
  }

  private async callOpenRouter(message: string, model: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.REPLIT_DOMAINS || "http://localhost:5000",
          "X-Title": "AI Platform",
        },
        body: JSON.stringify({
          model: model || "meta-llama/llama-3.1-8b-instruct:free",
          messages: [{ role: "user", content: message }],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "No response from OpenRouter";
    } catch (error) {
      console.error("OpenRouter API error:", error);
      throw new Error("Failed to get response from OpenRouter");
    }
  }
}

export const aiService = new AIService();
