import React from "react";
import { useState } from "react";
import { generatePrepWork } from "../api";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function PrepWorkForm() {
  const [prompt, setPrompt] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [fileId, setFileId] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await generatePrepWork(prompt, linkedinUrl, [fileId]);
      setResult(res.prepWork || res.error);
    } catch (error) {
      setResult("Error generating prep work. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Controls */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Meeting Preparation Requirements
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you need to prepare for (e.g., 'Prepare talking points for a sales call with a tech startup CEO')"
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            LinkedIn Profile URL (Optional)
          </label>
          <input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Presentation File ID (Optional)
          </label>
          <input
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="Google Drive file ID"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={isLoading || !prompt.trim()}
        className="w-full md:w-auto"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Preparing...
          </div>
        ) : (
          "Generate Prep Work"
        )}
      </Button>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Generated Prep Work</Badge>
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
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md bg-green-50 border border-green-200 p-3">
          <div className="flex items-start gap-2">
            <div className="text-green-600 text-sm">🎯</div>
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Preparation Tips:</p>
              <ul className="text-xs space-y-1">
                <li>• Include the prospect's role and company</li>
                <li>• Mention specific pain points to address</li>
                <li>• Include any previous interactions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-purple-50 border border-purple-200 p-3">
          <div className="flex items-start gap-2">
            <div className="text-purple-600 text-sm">💼</div>
            <div className="text-sm text-purple-800">
              <p className="font-medium mb-1">LinkedIn Integration:</p>
              <ul className="text-xs space-y-1">
                <li>• Provides company insights</li>
                <li>• Identifies mutual connections</li>
                <li>• Reveals career background</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
