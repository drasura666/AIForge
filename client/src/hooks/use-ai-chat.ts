import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatMessage, AIProvider } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  provider: AIProvider;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export function useAiChat(sessionId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const queryClient = useQueryClient();

  // Load chat sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/chat/sessions'],
    enabled: true,
  });

  // Load specific session messages
  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['/api/chat/sessions', currentSessionId],
    enabled: !!currentSessionId,
    select: (data: ChatSession) => data,
  });

  // Update messages when session data changes
  useEffect(() => {
    if (sessionData?.messages) {
      setMessages(sessionData.messages);
    }
  }, [sessionData]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      message,
      provider,
      model,
      apiKey,
    }: {
      message: string;
      provider: AIProvider;
      model: string;
      apiKey: string;
    }) => {
      const response = await apiRequest('POST', '/api/chat/message', {
        message,
        provider,
        model,
        apiKey,
        sessionId: currentSessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Update local messages state
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: data.userMessage || '',
        timestamp: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);

      // Invalidate sessions to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async ({
      title,
      provider,
      model,
    }: {
      title: string;
      provider: AIProvider;
      model: string;
    }) => {
      const response = await apiRequest('POST', '/api/chat/sessions', {
        title,
        messages: [],
        provider,
        model,
        userId: 'anonymous', // This will be set by the server
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.id);
      setMessages([]);
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
    },
    onError: (error) => {
      console.error('Failed to create session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat session.',
        variant: 'destructive',
      });
    },
  });

  const sendMessage = useCallback(
    async (message: string, provider: AIProvider, model: string, apiKey: string) => {
      if (!message.trim()) return;

      // Add user message immediately for better UX
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      // If no current session, create one
      if (!currentSessionId) {
        await createSessionMutation.mutateAsync({
          title: message.substring(0, 50) + '...',
          provider,
          model,
        });
      }

      // Send the message
      return sendMessageMutation.mutateAsync({
        message,
        provider,
        model,
        apiKey,
      });
    },
    [currentSessionId, createSessionMutation, sendMessageMutation]
  );

  const createNewSession = useCallback(
    (title: string, provider: AIProvider, model: string) => {
      return createSessionMutation.mutateAsync({ title, provider, model });
    },
    [createSessionMutation]
  );

  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setMessages([]);
  }, []);

  const clearCurrentSession = useCallback(() => {
    setCurrentSessionId(undefined);
    setMessages([]);
  }, []);

  return {
    // State
    messages,
    sessions,
    currentSessionId,
    isLoading: sendMessageMutation.isPending,
    isLoadingSessions: sessionsLoading,
    isLoadingSession: sessionLoading,

    // Actions
    sendMessage,
    createNewSession,
    switchSession,
    clearCurrentSession,

    // Mutation states
    isCreatingSession: createSessionMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
  };
}
