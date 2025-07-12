
import React, { useEffect } from "react";
import TranscriptStream from "./components/TranscriptStream";
import SalesProposalForm from "./components/SalesProposalForm";
import PrepWorkForm from "./components/PrepWorkForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";

function App() {
  useEffect(() => {
    window.zoomSdk?.config({});
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              🚀 Zoom Sales Assistant
            </h1>
            <p className="text-muted-foreground">
              AI-powered sales insights and preparation tools
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Live
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Live Transcription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📝 Live Transcription
              </CardTitle>
              <CardDescription>
                Real-time meeting transcript with AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TranscriptStream />
            </CardContent>
          </Card>

          {/* Sales Proposal Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Sales Proposal Generator
              </CardTitle>
              <CardDescription>
                Create professional sales proposals based on meeting insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesProposalForm />
            </CardContent>
          </Card>

          {/* Prep Work Assistant */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Prep Work Assistant
              </CardTitle>
              <CardDescription>
                Generate meeting preparation materials and talking points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrepWorkForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
