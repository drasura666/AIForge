import { useState } from "react";
import { Send, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useApiKeys } from "@/hooks/use-api-keys";
import { ChatMessage, AIProvider } from "@shared/schema";

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [mentorMode, setMentorMode] = useState("teacher");
  const { sendMessage, isLoading, messages } = useAiChat();
  const { currentProvider, setCurrentProvider, apiKeys } = useApiKeys();

  const handleSendMessage = async () => {
    if (!message.trim() || !currentProvider || !apiKeys[currentProvider]) {
      return;
    }

    try {
      await sendMessage(message, currentProvider, "default", apiKeys[currentProvider]);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <Card className="bg-slate-800 border-slate-700 h-96">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4" data-testid="chat-messages">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 mt-20">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-rich-purple" />
                  <p>Welcome! I'm your AI assistant. Ask me anything about STEM, coding, research, or get creative!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-3 chat-message">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user" 
                        ? "bg-rich-purple" 
                        : "ai-gradient"
                    }`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className="bg-slate-700 rounded-2xl px-4 py-2 max-w-4xl">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 ai-gradient rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-700 rounded-2xl px-4 py-2 ai-thinking">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <Input
                type="text"
                placeholder="Ask me anything about STEM, coding, research, or get creative..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-slate-700 border-slate-600"
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim() || !currentProvider}
                className="bg-rich-purple hover:bg-purple-600"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">AI Provider</h3>
            <Select value={currentProvider || ""} onValueChange={(value) => setCurrentProvider(value as AIProvider)}>
              <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-ai-provider">
                <SelectValue placeholder="Select AI Provider" />
              </SelectTrigger>
              <SelectContent>
                {apiKeys.groq && <SelectItem value="groq">Groq - Llama 3.1 (Fast)</SelectItem>}
                {apiKeys.huggingface && <SelectItem value="huggingface">HF - Mistral 7B</SelectItem>}
                {apiKeys.openrouter && <SelectItem value="openrouter">OpenRouter - GPT-4</SelectItem>}
                {apiKeys.cohere && <SelectItem value="cohere">Cohere - Command R+</SelectItem>}
                {apiKeys.gemini && <SelectItem value="gemini">Gemini Pro</SelectItem>}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Mentor Mode</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="mentor"
                  value="teacher"
                  checked={mentorMode === "teacher"}
                  onChange={(e) => setMentorMode(e.target.value)}
                  className="text-rich-purple"
                  data-testid="radio-mentor-teacher"
                />
                <span className="text-sm">Encouraging Teacher</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="mentor"
                  value="researcher"
                  checked={mentorMode === "researcher"}
                  onChange={(e) => setMentorMode(e.target.value)}
                  className="text-rich-purple"
                  data-testid="radio-mentor-researcher"
                />
                <span className="text-sm">Research Assistant</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="mentor"
                  value="creative"
                  checked={mentorMode === "creative"}
                  onChange={(e) => setMentorMode(e.target.value)}
                  className="text-rich-purple"
                  data-testid="radio-mentor-creative"
                />
                <span className="text-sm">Creative Partner</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
