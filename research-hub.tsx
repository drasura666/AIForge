import { useState } from "react";
import { Upload, FileText, Search, Quote, BarChart, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiKeys } from "@/hooks/use-api-keys";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function ResearchHub() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [citationStyle, setCitationStyle] = useState("ieee");
  const [paperLength, setPaperLength] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const { currentProvider, apiKeys } = useApiKeys();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentProvider || !apiKeys[currentProvider]) {
      toast({
        title: "Error",
        description: "Please select a file and ensure you have API keys configured.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('provider', currentProvider);
    formData.append('apiKey', apiKeys[currentProvider]);

    setIsLoading(true);
    try {
      const response = await fetch("/api/research/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePaper = async () => {
    if (!title.trim() || !currentProvider || !apiKeys[currentProvider]) {
      toast({
        title: "Error",
        description: "Please enter a title and ensure you have API keys configured.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/research/generate", {
        title,
        notes,
        citationStyle,
        length: paperLength,
        provider: currentProvider,
        apiKey: apiKeys[currentProvider],
      });

      const data = await response.json();
      
      toast({
        title: "Paper Generated",
        description: "Your research paper has been generated successfully.",
      });
    } catch (error) {
      console.error("Failed to generate paper:", error);
      toast({
        title: "Error",
        description: "Failed to generate paper. Please try again.",
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
            <CardTitle className="text-xl">Document Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium mb-2">Upload Research Papers</p>
              <p className="text-slate-400 mb-4">PDF, DOCX, or TXT files supported</p>
              <label htmlFor="file-upload">
                <Button 
                  className="bg-rich-purple hover:bg-purple-600 cursor-pointer"
                  disabled={isLoading}
                  data-testid="button-upload-file"
                >
                  {isLoading ? "Processing..." : "Choose Files"}
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-file-upload"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl">Paper Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Paper Title</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your research topic..."
                className="bg-slate-700 border-slate-600"
                data-testid="input-paper-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Citation Style</label>
                <Select value={citationStyle} onValueChange={setCitationStyle}>
                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-citation-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ieee">IEEE</SelectItem>
                    <SelectItem value="apa">APA</SelectItem>
                    <SelectItem value="mla">MLA</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Paper Length</label>
                <Select value={paperLength} onValueChange={setPaperLength}>
                  <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-paper-length">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (3-5 pages)</SelectItem>
                    <SelectItem value="medium">Medium (6-10 pages)</SelectItem>
                    <SelectItem value="long">Long (10+ pages)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Research Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your research notes, key points, or outline here..."
                className="bg-slate-700 border-slate-600 h-32"
                data-testid="textarea-research-notes"
              />
            </div>
            <Button
              onClick={handleGeneratePaper}
              disabled={isLoading || !title.trim()}
              className="w-full bg-emerald hover:bg-green-600"
              data-testid="button-generate-paper"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isLoading ? "Generating..." : "Generate Paper Draft"}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Recent Uploads</h3>
            <div className="space-y-2">
              <div className="p-2 bg-slate-700 rounded text-center text-slate-400 text-sm" data-testid="recent-uploads">
                No documents uploaded yet
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Research Tools</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-literature-search"
              >
                <Search className="w-4 h-4 mr-2" />
                Literature Search
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-citation-generator"
              >
                <Quote className="w-4 h-4 mr-2" />
                Citation Generator
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-data-analysis"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Data Analysis
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-grammar-check"
              >
                <Languages className="w-4 h-4 mr-2" />
                Grammar Check
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="text-sm space-y-2">
              <div className="p-2 bg-slate-700 rounded text-center text-slate-400" data-testid="research-summary">
                Upload documents to see analysis summaries
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
