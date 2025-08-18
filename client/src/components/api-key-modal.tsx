import { useState } from "react";
import { Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApiKeys } from "@/hooks/use-api-keys";
import { toast } from "@/hooks/use-toast";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { apiKeys, saveApiKey, currentProvider, setCurrentProvider } = useApiKeys();
  const [keys, setKeys] = useState({
    groq: apiKeys.groq || "",
    huggingface: apiKeys.huggingface || "",
    openrouter: apiKeys.openrouter || "",
    cohere: apiKeys.cohere || "",
    gemini: apiKeys.gemini || "",
  });

  const handleSave = () => {
    try {
      Object.entries(keys).forEach(([provider, key]) => {
        if (key.trim()) {
          saveApiKey(provider as any, key.trim());
        }
      });
      
      // Set default provider if none selected
      if (!currentProvider && keys.groq) {
        setCurrentProvider("groq");
      }
      
      toast({
        title: "API Keys Saved",
        description: "Your API keys have been encrypted and stored locally.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Setup Your AI Keys
          </DialogTitle>
          <p className="text-slate-300 text-center">
            Bring Your Own API Key (BYOK) - Your keys stay private and encrypted
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="groq-key" className="text-sm font-medium">
              Groq API Key
            </Label>
            <Input
              id="groq-key"
              type="password"
              value={keys.groq}
              onChange={(e) => setKeys({ ...keys, groq: e.target.value })}
              placeholder="gsk_..."
              className="bg-slate-700 border-slate-600"
              data-testid="input-groq-key"
            />
          </div>
          
          <div>
            <Label htmlFor="hf-key" className="text-sm font-medium">
              Hugging Face Token
            </Label>
            <Input
              id="hf-key"
              type="password"
              value={keys.huggingface}
              onChange={(e) => setKeys({ ...keys, huggingface: e.target.value })}
              placeholder="hf_..."
              className="bg-slate-700 border-slate-600"
              data-testid="input-huggingface-key"
            />
          </div>
          
          <div>
            <Label htmlFor="openrouter-key" className="text-sm font-medium">
              OpenRouter Key (Optional)
            </Label>
            <Input
              id="openrouter-key"
              type="password"
              value={keys.openrouter}
              onChange={(e) => setKeys({ ...keys, openrouter: e.target.value })}
              placeholder="sk-or-..."
              className="bg-slate-700 border-slate-600"
              data-testid="input-openrouter-key"
            />
          </div>
          
          <div>
            <Label htmlFor="cohere-key" className="text-sm font-medium">
              Cohere API Key (Optional)
            </Label>
            <Input
              id="cohere-key"
              type="password"
              value={keys.cohere}
              onChange={(e) => setKeys({ ...keys, cohere: e.target.value })}
              placeholder="..."
              className="bg-slate-700 border-slate-600"
              data-testid="input-cohere-key"
            />
          </div>
          
          <div>
            <Label htmlFor="gemini-key" className="text-sm font-medium">
              Gemini API Key (Optional)
            </Label>
            <Input
              id="gemini-key"
              type="password"
              value={keys.gemini}
              onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
              placeholder="..."
              className="bg-slate-700 border-slate-600"
              data-testid="input-gemini-key"
            />
          </div>
        </div>
        
        <div className="flex items-center mt-6 text-sm text-slate-400">
          <Lock className="w-4 h-4 mr-2" />
          Keys are encrypted and stored locally - never sent to our servers
        </div>
        
        <div className="flex gap-3 mt-8">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 bg-rich-purple hover:bg-purple-600"
            data-testid="button-save-keys"
          >
            Save Keys
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
