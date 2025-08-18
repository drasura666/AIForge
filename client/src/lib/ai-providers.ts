import { AIProvider } from "@shared/schema";

export interface AIProviderConfig {
  name: string;
  displayName: string;
  baseUrl: string;
  defaultModel: string;
  supportedModels: string[];
  keyPrefix: string;
  description: string;
  freeModels?: string[];
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  groq: {
    name: "groq",
    displayName: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama3-8b-8192",
    supportedModels: [
      "llama3-8b-8192",
      "llama3-70b-8192",
      "mixtral-8x7b-32768",
      "gemma-7b-it",
    ],
    keyPrefix: "gsk_",
    description: "Ultra-fast inference with LPU technology",
  },
  huggingface: {
    name: "huggingface",
    displayName: "Hugging Face",
    baseUrl: "https://api-inference.huggingface.co/models",
    defaultModel: "microsoft/DialoGPT-medium",
    supportedModels: [
      "microsoft/DialoGPT-medium",
      "microsoft/DialoGPT-large",
      "facebook/blenderbot-400M-distill",
      "mistralai/Mistral-7B-Instruct-v0.1",
    ],
    keyPrefix: "hf_",
    description: "Access to thousands of open-source models",
  },
  openrouter: {
    name: "openrouter",
    displayName: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "meta-llama/llama-3.1-8b-instruct:free",
    supportedModels: [
      "meta-llama/llama-3.1-8b-instruct:free",
      "meta-llama/llama-3.1-70b-instruct:free",
      "deepseek/deepseek-chat-v3-0324:free",
      "google/gemma-7b-it:free",
      "nvidia/llama-3.1-nemotron-70b-instruct:free",
    ],
    keyPrefix: "sk-or-",
    description: "Unified API for 300+ AI models",
    freeModels: [
      "meta-llama/llama-3.1-8b-instruct:free",
      "deepseek/deepseek-chat-v3-0324:free",
    ],
  },
  cohere: {
    name: "cohere",
    displayName: "Cohere",
    baseUrl: "https://api.cohere.ai/v1",
    defaultModel: "command-r-plus",
    supportedModels: [
      "command-r-plus",
      "command-r",
      "command",
      "command-nightly",
    ],
    keyPrefix: "",
    description: "Advanced language models for enterprise",
  },
  gemini: {
    name: "gemini",
    displayName: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-pro",
    supportedModels: [
      "gemini-pro",
      "gemini-pro-vision",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
    ],
    keyPrefix: "AIza",
    description: "Google's most capable AI model",
  },
};

export function getProviderConfig(provider: AIProvider): AIProviderConfig {
  return AI_PROVIDERS[provider];
}

export function validateApiKey(provider: AIProvider, apiKey: string): boolean {
  const config = getProviderConfig(provider);
  if (!config.keyPrefix) return apiKey.length > 10; // Basic validation
  return apiKey.startsWith(config.keyPrefix) && apiKey.length > config.keyPrefix.length + 10;
}

export function getAvailableProviders(): AIProvider[] {
  return Object.keys(AI_PROVIDERS) as AIProvider[];
}

export function getProviderDisplayName(provider: AIProvider): string {
  return AI_PROVIDERS[provider]?.displayName || provider;
}

export function getDefaultModel(provider: AIProvider): string {
  return AI_PROVIDERS[provider]?.defaultModel || "";
}

export function getSupportedModels(provider: AIProvider): string[] {
  return AI_PROVIDERS[provider]?.supportedModels || [];
}

export function getFreeModels(provider: AIProvider): string[] {
  return AI_PROVIDERS[provider]?.freeModels || [];
}

export function isModelFree(provider: AIProvider, model: string): boolean {
  const freeModels = getFreeModels(provider);
  return freeModels.includes(model);
}
