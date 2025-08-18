import { useState } from "react";
import { Play, Bug, Zap, FileCode, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiKeys } from "@/hooks/use-api-keys";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function CodeLab() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(`def fibonacci(n):
    # Generate Fibonacci sequence up to n terms
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    else:
        sequence = [0, 1]
        for i in range(2, n):
            sequence.append(sequence[i-1] + sequence[i-2])
        return sequence

# Test the function
print(fibonacci(10))`);
  const [output, setOutput] = useState("[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentProvider, apiKeys } = useApiKeys();

  const handleGenerateCode = async () => {
    if (!prompt.trim() || !currentProvider || !apiKeys[currentProvider]) {
      toast({
        title: "Error",
        description: "Please enter a prompt and ensure you have API keys configured.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/code/generate", {
        prompt,
        language,
        provider: currentProvider,
        apiKey: apiKeys[currentProvider],
      });

      const data = await response.json();
      setCode(data.code || "// No code generated");
      setPrompt("");
      
      toast({
        title: "Code Generated",
        description: "Your code has been generated successfully.",
      });
    } catch (error) {
      console.error("Failed to generate code:", error);
      toast({
        title: "Error",
        description: "Failed to generate code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugCode = async () => {
    if (!code.trim() || !currentProvider || !apiKeys[currentProvider]) {
      toast({
        title: "Error",
        description: "Please ensure you have code and API keys configured.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/code/debug", {
        code,
        language,
        provider: currentProvider,
        apiKey: apiKeys[currentProvider],
      });

      const data = await response.json();
      
      toast({
        title: "Code Analyzed",
        description: data.suggestions || "Code analysis completed.",
      });
    } catch (error) {
      console.error("Failed to debug code:", error);
      toast({
        title: "Error",
        description: "Failed to analyze code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Code Editor</CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 w-40" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  className="bg-emerald hover:bg-green-600"
                  data-testid="button-run-code"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Run
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm h-80 overflow-y-auto code-editor">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent text-white resize-none outline-none"
                data-testid="textarea-code-editor"
              />
            </div>
            
            <div className="mt-4 bg-slate-700 rounded-lg p-3">
              <h4 className="font-medium mb-2">Output:</h4>
              <div className="font-mono text-sm text-emerald" data-testid="text-code-output">
                {output}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Ask me to generate code, debug, or explain algorithms..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-slate-700 border-slate-600"
              data-testid="input-code-prompt"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateCode}
                disabled={isLoading}
                className="bg-rich-purple hover:bg-purple-600"
                data-testid="button-generate-code"
              >
                Generate
              </Button>
              <Button
                onClick={handleDebugCode}
                disabled={isLoading}
                className="bg-amber hover:bg-yellow-600"
                data-testid="button-debug-code"
              >
                <Bug className="w-4 h-4 mr-1" />
                Debug
              </Button>
              <Button
                disabled={isLoading}
                className="bg-emerald hover:bg-green-600"
                data-testid="button-optimize-code"
              >
                <Zap className="w-4 h-4 mr-1" />
                Optimize
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                data-testid="button-explain-code"
              >
                Explain
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">File Explorer</h3>
            <div className="space-y-1">
              <div 
                className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded cursor-pointer"
                data-testid="file-fibonacci"
              >
                <FileCode className="w-4 h-4 text-emerald" />
                <span className="text-sm">fibonacci.py</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-3"
              data-testid="button-new-file"
            >
              <Plus className="w-4 h-4 mr-2" />
              New File
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">AI Suggestions</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600" data-testid="suggestion-1">
                <p className="font-medium">Add error handling</p>
                <p className="text-slate-400 text-xs">Consider input validation</p>
              </div>
              <div className="p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600" data-testid="suggestion-2">
                <p className="font-medium">Optimize performance</p>
                <p className="text-slate-400 text-xs">Use memoization for better speed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
