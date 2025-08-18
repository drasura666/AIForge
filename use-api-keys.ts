import { useState, useEffect } from 'react';
import { AIProvider } from '@shared/schema';
import { secureStorage } from '@/lib/crypto';
import { validateApiKey, getAvailableProviders } from '@/lib/ai-providers';

interface ApiKeys {
  groq?: string;
  huggingface?: string;
  openrouter?: string;
  cohere?: string;
  gemini?: string;
}

const API_KEYS_STORAGE_KEY = 'ai-platform-api-keys';
const CURRENT_PROVIDER_KEY = 'ai-platform-current-provider';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [currentProvider, setCurrentProvider] = useState<AIProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load API keys from secure storage on mount
  useEffect(() => {
    loadApiKeys();
    loadCurrentProvider();
  }, []);

  const loadApiKeys = () => {
    try {
      setIsLoading(true);
      const storedKeys = secureStorage.getItem(API_KEYS_STORAGE_KEY);
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys) as ApiKeys;
        setApiKeys(parsedKeys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
      // Clear corrupted data
      secureStorage.removeItem(API_KEYS_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentProvider = () => {
    try {
      const provider = localStorage.getItem(CURRENT_PROVIDER_KEY) as AIProvider;
      if (provider && getAvailableProviders().includes(provider)) {
        setCurrentProvider(provider);
      }
    } catch (error) {
      console.error('Failed to load current provider:', error);
    }
  };

  const saveApiKey = (provider: AIProvider, apiKey: string): boolean => {
    try {
      // Validate the API key format
      if (!validateApiKey(provider, apiKey)) {
        throw new Error(`Invalid API key format for ${provider}`);
      }

      const updatedKeys = { ...apiKeys, [provider]: apiKey };
      setApiKeys(updatedKeys);
      
      // Save to secure storage
      secureStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(updatedKeys));
      
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw error;
    }
  };

  const removeApiKey = (provider: AIProvider): void => {
    try {
      const updatedKeys = { ...apiKeys };
      delete updatedKeys[provider];
      setApiKeys(updatedKeys);
      
      // Update secure storage
      secureStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(updatedKeys));
      
      // Clear current provider if it was removed
      if (currentProvider === provider) {
        setCurrentProvider(null);
        localStorage.removeItem(CURRENT_PROVIDER_KEY);
      }
    } catch (error) {
      console.error('Failed to remove API key:', error);
      throw error;
    }
  };

  const updateCurrentProvider = (provider: AIProvider | null): void => {
    try {
      setCurrentProvider(provider);
      
      if (provider) {
        localStorage.setItem(CURRENT_PROVIDER_KEY, provider);
      } else {
        localStorage.removeItem(CURRENT_PROVIDER_KEY);
      }
    } catch (error) {
      console.error('Failed to update current provider:', error);
      throw error;
    }
  };

  const clearAllApiKeys = (): void => {
    try {
      setApiKeys({});
      setCurrentProvider(null);
      secureStorage.removeItem(API_KEYS_STORAGE_KEY);
      localStorage.removeItem(CURRENT_PROVIDER_KEY);
    } catch (error) {
      console.error('Failed to clear API keys:', error);
      throw error;
    }
  };

  const hasApiKey = (provider: AIProvider): boolean => {
    return !!apiKeys[provider];
  };

  const getConfiguredProviders = (): AIProvider[] => {
    return Object.keys(apiKeys).filter(provider => 
      apiKeys[provider as AIProvider]
    ) as AIProvider[];
  };

  const isProviderReady = (provider: AIProvider): boolean => {
    return hasApiKey(provider) && validateApiKey(provider, apiKeys[provider]!);
  };

  const getCurrentProviderKey = (): string | undefined => {
    return currentProvider ? apiKeys[currentProvider] : undefined;
  };

  return {
    apiKeys,
    currentProvider,
    isLoading,
    saveApiKey,
    removeApiKey,
    setCurrentProvider: updateCurrentProvider,
    clearAllApiKeys,
    hasApiKey,
    getConfiguredProviders,
    isProviderReady,
    getCurrentProviderKey,
    loadApiKeys,
  };
}
