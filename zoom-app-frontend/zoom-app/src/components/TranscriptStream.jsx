
import React from "react";
import { useEffect, useState } from "react";
import { sendTranscriptLine } from "../api";
import { Badge } from "./ui/badge";

export default function TranscriptStream() {
  const [lines, setLines] = useState([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    async function initTranscriptionListener() {
      const sdk = window.zoomSdk;
      await sdk.config({});
      setIsListening(true);
      
      sdk.addEventListener("onTranscriptionMessageReceived", async (event) => {
        const line = event.payload;
        setLines((prev) => [...prev, line]);
        await sendTranscriptLine(line);
      });
    }
    initTranscriptionListener();
  }, []);

  return (
    <div className="space-y-4">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span className="text-sm text-muted-foreground">
          {isListening ? 'Listening...' : 'Connecting...'}
        </span>
        <Badge variant={isListening ? "default" : "secondary"} className="ml-auto">
          {lines.length} messages
        </Badge>
      </div>

      {/* Transcript Display */}
      <div className="h-48 overflow-y-auto rounded-md border bg-muted/30 p-4 space-y-2">
        {lines.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl mb-2">🎤</div>
              <p className="text-sm">Waiting for transcription...</p>
            </div>
          </div>
        ) : (
          lines.map((line, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-background border transition-all hover:shadow-sm"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {line.speakerName?.charAt(0) || '?'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {line.speakerName || 'Unknown Speaker'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {line.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setLines([])}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear transcript
        </button>
        <button
          onClick={() => {
            const text = lines.map(line => `${line.speakerName}: ${line.text}`).join('\n');
            navigator.clipboard.writeText(text);
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Copy all
        </button>
      </div>
    </div>
  );
}
