import { useState } from "react";
import { Calculator, SquareRadical, TrendingUp, Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiKeys } from "@/hooks/use-api-keys";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function StemLab() {
  const [subject, setSubject] = useState("physics");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentProvider, apiKeys } = useApiKeys();

  const handleSolveProblem = async () => {
    if (!problem.trim() || !currentProvider || !apiKeys[currentProvider]) {
      toast({
        title: "Error",
        description: "Please enter a problem and ensure you have API keys configured.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/stem/solve", {
        subject,
        problem,
        provider: currentProvider,
        apiKey: apiKeys[currentProvider],
      });

      const data = await response.json();
      setSolution(data.solution || "No solution provided.");
      
      toast({
        title: "Problem Solved",
        description: "Your STEM problem has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Failed to solve problem:", error);
      toast({
        title: "Error",
        description: "Failed to solve the problem. Please try again.",
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
            <CardTitle className="text-xl">Problem Solver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject Area</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-stem-subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics - Quantum Mechanics</SelectItem>
                  <SelectItem value="mathematics">Mathematics - Calculus</SelectItem>
                  <SelectItem value="chemistry">Chemistry - Organic</SelectItem>
                  <SelectItem value="engineering">Engineering - Structural</SelectItem>
                  <SelectItem value="biology">Biology - Molecular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Problem Description</label>
              <Textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="bg-slate-700 border-slate-600 h-32"
                placeholder="Describe your problem or paste equations here..."
                data-testid="textarea-stem-problem"
              />
            </div>
            <Button
              onClick={handleSolveProblem}
              disabled={isLoading || !problem.trim()}
              className="w-full bg-emerald hover:bg-green-600"
              data-testid="button-solve-problem"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {isLoading ? "Solving..." : "Solve Problem"}
            </Button>
          </CardContent>
        </Card>
        
        {solution && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl">Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="space-y-3 whitespace-pre-wrap" data-testid="text-solution">
                  {solution}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Quick Tools</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-equation-solver"
              >
                <SquareRadical className="w-4 h-4 mr-2" />
                Equation Solver
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-graph-plotter"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Graph Plotter
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-molecular-viewer"
              >
                <Atom className="w-4 h-4 mr-2" />
                Molecular Viewer
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Recent Problems</h3>
            <div className="space-y-2 text-sm">
              <div 
                className="p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600 transition-colors"
                data-testid="recent-problem-1"
              >
                <p className="font-medium">No problems solved yet</p>
                <p className="text-slate-400 text-xs">Start solving problems to see history</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
