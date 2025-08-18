import { HelpCircle } from "lucide-react";
import { useApiKeys } from "@/hooks/use-api-keys";

export default function StatusBar() {
  const { currentProvider } = useApiKeys();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 px-6 py-2 z-30">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" data-testid="status-indicator"></div>
            <span className="text-slate-400" data-testid="text-connection-status">
              Connected: {currentProvider || 'No provider selected'}
            </span>
          </div>
          <div className="text-slate-400" data-testid="text-token-usage">
            Tokens Used: 0 / ∞
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400" data-testid="text-last-sync">
            Ready
          </span>
          <button 
            className="text-slate-400 hover:text-white transition-colors"
            data-testid="button-help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
