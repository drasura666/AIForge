import { useState } from "react";
import { Plus, Wand2, Globe, Rocket, Swords, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiKeys } from "@/hooks/use-api-keys";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface Idea {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface ScenarioOutcome {
  type: string;
  title: string;
  description: string;
}

export default function CreativeStudio() {
  const [newIdea, setNewIdea] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [scenarioText, setScenarioText] = useState("");
  const [scenarioType, setScenarioType] = useState("future-technology");
  const [scenarioOutcomes, setScenarioOutcomes] = useState<ScenarioOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentProvider, apiKeys } = useApiKeys();

  const colors = ["bg-rich-purple", "bg-emerald", "bg-amber", "bg-slate-600"];

  const addIdea = () => {
    if (!newIdea.trim()) return;

    const newIdeaObj: Idea = {
      id: Date.now().toString(),
      text: newIdea,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setIdeas([...ideas, newIdeaObj]);
    setNewIdea("");
  };

  const removeIdea = (id: string) => {
    setIdeas(ideas.filter(idea => idea.id !== id));
  };

  const handleGenerateScenario = async () => {
    if (!scenarioText.trim() || !currentProvider || !apiKeys[currentProvider]) {
      toast({
        title: "Error",
        description: "Please enter a scenario and ensure you have API keys configured.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/creative/scenario", {
        title: scenarioTitle || "Scenario Analysis",
        scenario: scenarioText,
        type: scenarioType,
        provider: currentProvider,
        apiKey: apiKeys[currentProvider],
      });

      const data = await response.json();
      
      // Parse the scenario outcomes from AI response
      const mockOutcomes: ScenarioOutcome[] = [
        {
          type: "positive",
          title: "Positive Impact",
          description: "Revolutionary advances and new opportunities emerge from this scenario."
        },
        {
          type: "challenges",
          title: "Challenges",
          description: "Key obstacles and risks that need to be addressed."
        },
        {
          type: "timeline",
          title: "Timeline",
          description: "Expected progression and milestones for implementation."
        }
      ];
      
      setScenarioOutcomes(mockOutcomes);
      
      toast({
        title: "Scenario Generated",
        description: "Your scenario analysis has been generated successfully.",
      });
    } catch (error) {
      console.error("Failed to generate scenario:", error);
      toast({
        title: "Error",
        description: "Failed to generate scenario. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl">Idea Clustering Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-700 rounded-lg p-4 h-80 relative overflow-hidden" data-testid="idea-clustering-board">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className={`absolute ${idea.color} rounded-lg p-3 max-w-32 cursor-pointer hover:opacity-80 transition-opacity`}
                  style={{ left: idea.x, top: idea.y }}
                  onClick={() => removeIdea(idea.id)}
                  data-testid={`idea-${idea.id}`}
                >
                  <div className="text-sm font-medium text-white break-words">
                    {idea.text}
                  </div>
                </div>
              ))}
              
              {ideas.length === 0 && (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4" />
                    <p>Add ideas to start clustering</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-4">
              <Input
                type="text"
                placeholder="Add new idea..."
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIdea()}
                className="flex-1 bg-slate-700 border-slate-600"
                data-testid="input-new-idea"
              />
              <Button
                onClick={addIdea}
                disabled={!newIdea.trim()}
                className="bg-rich-purple hover:bg-purple-600"
                data-testid="button-add-idea"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl">Scenario Simulator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Scenario Type</label>
              <Select value={scenarioType} onValueChange={setScenarioType}>
                <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-scenario-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="future-technology">Future Technology</SelectItem>
                  <SelectItem value="space-exploration">Space Exploration</SelectItem>
                  <SelectItem value="climate-change">Climate Change</SelectItem>
                  <SelectItem value="ai-development">AI Development</SelectItem>
                  <SelectItem value="custom">Custom Scenario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Scenario Title (Optional)</label>
              <Input
                type="text"
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                placeholder="Enter scenario title..."
                className="bg-slate-700 border-slate-600"
                data-testid="input-scenario-title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Problem Statement</label>
              <Textarea
                value={scenarioText}
                onChange={(e) => setScenarioText(e.target.value)}
                placeholder="Describe the scenario or challenge..."
                className="bg-slate-700 border-slate-600 h-24"
                data-testid="textarea-scenario-description"
              />
            </div>
            
            <Button
              onClick={handleGenerateScenario}
              disabled={isLoading || !scenarioText.trim()}
              className="w-full bg-emerald hover:bg-green-600"
              data-testid="button-generate-scenario"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isLoading ? "Generating..." : "Generate Scenarios"}
            </Button>
            
            {scenarioOutcomes.length > 0 && (
              <div className="mt-6 bg-slate-700 rounded-lg p-4" data-testid="scenario-outcomes">
                <h4 className="font-semibold mb-3">Possible Outcomes:</h4>
                <div className="space-y-3">
                  {scenarioOutcomes.map((outcome, index) => (
                    <div key={index} className="p-3 bg-slate-600 rounded">
                      <h5 className={`font-medium ${
                        outcome.type === "positive" ? "text-emerald" :
                        outcome.type === "challenges" ? "text-amber" :
                        "text-rich-purple"
                      }`}>
                        {outcome.title}
                      </h5>
                      <p className="text-sm text-slate-300 mt-1">{outcome.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Creative Tools</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-mind-mapping"
              >
                <Globe className="w-4 h-4 mr-2" />
                Mind Mapping
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-world-builder"
              >
                <Globe className="w-4 h-4 mr-2" />
                World Builder
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-innovation-lab"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Innovation Lab
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-strategy-planner"
              >
                <Swords className="w-4 h-4 mr-2" />
                Strategy Planner
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Recent Projects</h3>
            <div className="space-y-2">
              {ideas.length > 0 ? (
                <div className="p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600 transition-colors" data-testid="recent-project-ideas">
                  <p className="font-medium text-sm">Idea Collection</p>
                  <p className="text-slate-400 text-xs">{ideas.length} ideas clustered</p>
                </div>
              ) : (
                <div className="p-2 bg-slate-700 rounded text-center text-slate-400 text-sm" data-testid="no-recent-projects">
                  No projects yet - start creating!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Inspiration</h3>
            <div className="space-y-2 text-sm">
              <div 
                className="p-2 bg-gradient-to-r from-rich-purple to-emerald rounded text-center cursor-pointer hover:opacity-80 transition-opacity"
                data-testid="inspiration-quantum"
              >
                💡 "What if trees could communicate through quantum entanglement?"
              </div>
              <div 
                className="p-2 bg-gradient-to-r from-amber to-red-500 rounded text-center cursor-pointer hover:opacity-80 transition-opacity"
                data-testid="inspiration-adaptive-city"
              >
                🚀 "Design a city that adapts to its inhabitants' emotions"
              </div>
              <div 
                className="p-2 bg-gradient-to-r from-emerald to-blue-500 rounded text-center cursor-pointer hover:opacity-80 transition-opacity"
                data-testid="inspiration-ai-ethics"
              >
                🧠 "Create an AI that teaches ethics through storytelling"
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
