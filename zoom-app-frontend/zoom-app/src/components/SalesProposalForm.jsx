import React from "react";
import { useState } from "react";
import { generateProposal } from "../api";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function SalesProposalForm() {
  const [prompt, setPrompt] = useState("");
  const [fileId, setFileId] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await generateProposal(prompt, fileId);
      setResult(res.proposal || res.error);
    } catch (error) {
      setResult("Error generating proposal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Form Controls */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Proposal Requirements
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the sales proposal you need (e.g., 'Create a proposal for a software solution for a mid-size company')"
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Google Drive File ID (Optional)
          </label>
          <input
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="Enter Google Drive file ID for additional context"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating...
            </div>
          ) : (
            "Generate Proposal"
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Generated Proposal</Badge>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Copy to clipboard
            </button>
          </div>
          
          <div className="rounded-md border bg-muted/30 p-4">
            <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {result}
            </pre>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 text-sm">💡</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Pro Tips:</p>
            <ul className="text-xs space-y-1">
              <li>• Be specific about your target audience and value proposition</li>
              <li>• Include budget constraints or pricing requirements</li>
              <li>• Mention any specific features or services needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
