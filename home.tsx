import { useState, useEffect } from "react";
import Header from "@/components/header";
import StatusBar from "@/components/status-bar";
import ApiKeyModal from "@/components/api-key-modal";
import ChatInterface from "@/components/chat-interface";
import StemLab from "@/components/stem-lab";
import CodeLab from "@/components/code-lab";
import ResearchHub from "@/components/research-hub";
import ExamPrep from "@/components/exam-prep";
import CreativeStudio from "@/components/creative-studio";
import { Brain, MessageCircle, Atom, Code, GraduationCap, ClipboardCheck, Lightbulb } from "lucide-react";

type Tab = "chat" | "stem" | "code" | "research" | "exam" | "creative";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

const tabs: TabConfig[] = [
  { id: "chat", label: "Chat", icon: <MessageCircle className="w-4 h-4" />, component: ChatInterface },
  { id: "stem", label: "STEM Lab", icon: <Atom className="w-4 h-4" />, component: StemLab },
  { id: "code", label: "Code Lab", icon: <Code className="w-4 h-4" />, component: CodeLab },
  { id: "research", label: "Research Hub", icon: <GraduationCap className="w-4 h-4" />, component: ResearchHub },
  { id: "exam", label: "Exam Prep", icon: <ClipboardCheck className="w-4 h-4" />, component: ExamPrep },
  { id: "creative", label: "Creative Studio", icon: <Lightbulb className="w-4 h-4" />, component: CreativeStudio },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    // Set default dark theme
    document.documentElement.classList.add('dark');
  }, []);

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ChatInterface;

  return (
    <div className="min-h-screen bg-dark-navy text-white font-inter overflow-x-hidden">
      <Header onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-slate-800 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`tab-button flex-1 px-4 py-3 text-center rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "active bg-rich-purple text-white"
                    : "text-slate-400 hover:bg-slate-700"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          <ActiveComponent />
        </div>
      </div>

      <StatusBar />
      
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
      />
    </div>
  );
}
