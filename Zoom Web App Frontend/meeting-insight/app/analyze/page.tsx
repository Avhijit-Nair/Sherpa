"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Brain, Download, Loader2, Share2, Sparkles, Zap, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import axios from "axios"

// Default prompt template
const DEFAULT_PROMPT = `You are a sales coach analyzing a collection of meeting transcripts.
The given collection of transcripts is from sales calls through the different stages of the sales funnel.
Your task here is to analyze the transcript and provide insights, what went well, what could be improved, and what the next steps should be.

Please provide your analysis in the following format:
- **Insights**: Key observations and patterns
- **Areas for Improvement**: Specific recommendations for enhancement
- **Summary**: Overall assessment of the sales process
- **Next Steps**: Actionable recommendations for moving forward

Transcript content will be provided below:`

type FileData = {
  id: string
  name: string
  uploadDate: string
  size: string
  analyzed: boolean
  type: string
  mimeType?: string
  downloadUrl?: string  // For Google Drive files
  content?: string      // For text files or base64 content
  file?: File          // For actual File objects
} | File 

// Function to extract sections from the insights text
const extractSections = (text: string) => {
  const insightsMatch = text.match(/\*\*Insights\*\*([\s\S]*?)(?=\*\*Areas for Improvement|\*\*Summary)/)
  const summaryMatch = text.match(/\*\*Summary\*\*([\s\S]*?)(?=\*\*Next Steps)/)
  const nextStepsMatch = text.match(/\*\*Next Steps\*\*([\s\S]*?)$/)
  const areasForImprovementMatch = text.match(/\*\*Areas for Improvement:\*\*([\s\S]*?)(?=\*\*Summary)/)

  return {
    insights: insightsMatch ? insightsMatch[1] : "",
    summary: summaryMatch ? summaryMatch[1] : "",
    nextSteps: nextStepsMatch ? nextStepsMatch[1] : "",
    areasForImprovement: areasForImprovementMatch ? areasForImprovementMatch[1] : "",
  }
}

// Convert markdown to HTML
const markdownToHtml = (markdown: string) => {
  const html = markdown
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\* (.*?)(?=\n|$)/g, "<li>$1</li>")
    .replace(/<li>(.*?)(?=<li>|$)/gs, "<ul><li>$1</ul>")
    .replace(/(\d+)\. (.*?)(?=\n|$)/g, "<li>$2</li>")
    .replace(/<li>(.*?)(?=<li>|$)/gs, "<ol><li>$1</ol>")
    .replace(/([^\n<>]+)(?=\n|$)/g, "<p>$1</p>")
    .replace(/<p><p>/g, "<p>")
    .replace(/<\/p><\/p>/g, "</p>")
    .replace(/<\/ul><ul>/g, "")
    .replace(/<\/ol><ol>/g, "")

  return html
}

export default function AnalyzePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [stage, setStage] = useState<"setup" | "analyzing" | "results">("setup")
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Preparing analysis...")
  const [error, setError] = useState<string | null>(null)
  const [insightsData, setInsightsData] = useState<any>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([])
  const fileUrls: String[] = []

  useEffect(() => {
    // Get selected files from sessionStorage
    const storedFiles = sessionStorage.getItem("selectedFiles")
    if (storedFiles) {
      try {
        const files = JSON.parse(storedFiles)
        setSelectedFiles(files)
      } catch (error) {
        console.error("Failed to parse stored files:", error)
        setError("Failed to load file data. Please go back and select files again.")
      }
    } else {
      setError("No files selected. Please go back and select files to analyze.")
    }
  }, [])

const handleStartAnalysis = async () => {
  if (selectedFiles.length === 0) {
    setError("No files available for analysis.")
    return
  }

  setStage("analyzing")
  setError(null)
  setProgress(0)

  try {
    // Start progress simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1

        if (newProgress <= 20) {
          setStatus("Preparing files...")
        } else if (newProgress <= 40) {
          setStatus("Uploading files to server...")
        } else if (newProgress <= 60) {
          setStatus("Sending to Gemini AI...")
        } else if (newProgress <= 80) {
          setStatus("Analyzing content with AI...")
        } else if (newProgress < 95) {
          setStatus("Generating insights...")
        }

        return Math.min(newProgress, 95)
      })
    }, 200)

    

    // Process each selected file
    for (let i = 0; i < selectedFiles.length; i++) {
      const fileData = selectedFiles[i]
      fileUrls.push(fileData.downloadUrl)
      console.log(fileData.downloadUrl, "fileUrl")
      
    }
    // console.log("FormData prepared with files:", fileUrls)
    setStatus("Sending files to AI for analysis...")
    // Send FormData to backend
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/analyze`,
      // "https://zoom-transcript-analyzer.uc.r.appspot.com/api/analyze",
     JSON.stringify({
      'prompt': prompt,
      'files': fileUrls
     }),
      {
        headers: {
          // Don't set Content-Type header - let browser set it with boundary for FormData
          'Content-Type': 'application/json',
        },
        timeout: 300000, // 5 minutes timeout for file processing
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const uploadProgress = Math.round((progressEvent.loaded * 50) / progressEvent.total)
            setProgress(Math.min(50 + uploadProgress, 90))
          }
        }
      }
    )

    // Clear progress interval
    clearInterval(progressInterval)
    setProgress(100)
    setStatus("Analysis complete!")

    // Process the response (rest of the code remains the same)
    if (response.data && response.data.analysis) {
      const analysisText = response.data.analysis

      try {
        const sections = extractSections(analysisText)

        if (sections.summary || sections.insights || sections.nextSteps) {
          setInsightsData({
            summary: markdownToHtml(sections.summary),
            insights: markdownToHtml(sections.insights + sections.areasForImprovement),
            suggestions: markdownToHtml(sections.nextSteps),
            rawData: analysisText,
          })
        } else {
          setInsightsData({
            summary: markdownToHtml(analysisText),
            insights: markdownToHtml(analysisText),
            suggestions: markdownToHtml("Please refer to the summary for actionable insights."),
            rawData: analysisText,
          })
        }
      } catch (extractionError) {
        console.error("Failed to extract sections:", extractionError)
        setInsightsData({
          summary: markdownToHtml(analysisText),
          insights: markdownToHtml(analysisText),
          suggestions: markdownToHtml("Please refer to the summary for actionable insights."),
          rawData: analysisText,
        })
      }

      // Mark files as analyzed in localStorage
      const storedFiles = localStorage.getItem("uploadedFiles")
      if (storedFiles) {
        try {
          const allFiles = JSON.parse(storedFiles)
          const updatedFiles = allFiles.map((file: FileData) => {
            if (selectedFiles.some((selected) => selected.id === file.id)) {
              return { ...file, analyzed: true }
            }
            return file
          })
          localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles))
        } catch (error) {
          console.error("Failed to update file status:", error)
        }
      }

      setStage("results")
    } else {
      throw new Error("Invalid response format from API")
    }
  } catch (err: any) {
    console.error("Analysis failed:", err)

    let errorMessage = "Failed to analyze files. Please try again."

    if (err.code === "ECONNABORTED") {
      errorMessage = "Request timed out. The analysis is taking longer than expected. Please try again."
    } else if (err.response) {
      errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`
    } else if (err.request) {
      errorMessage = "Unable to connect to the analysis service. Please check your connection and try again."
    }

    setError(errorMessage)
    setStage("setup")
  }
}



  const handleDownloadWord = async () => {
    if (!insightsData) return

    setIsDownloading(true)
    try {
      const content = insightsData.rawData
      const blob = new Blob([content], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `file-insights-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Failed to download file. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-yellow-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="h-6 w-6 text-yellow-500" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-black animate-pulse" />
            </div>
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-black to-yellow-500 bg-clip-text text-transparent"
            >
              Sherpa.AI
            </Link>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors"
            >
              Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/analyze"
             className="text-sm font-medium text-yellow-500 relative group"
            >
              Analyze
               <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/sales-prep"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors"
            >
              Sales Prep
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/sales-proposal"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors"
            >
              Sales Proposal
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
             <button
              onClick={() => {
                logout()
                window.location.assign("/")
              }}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors"
            >
              Logout ({user?.username})
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full hover:cursor-pointer"></span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 max-w-6xl mx-auto">
            <Button variant="ghost" size="sm" asChild className="mb-4 hover:bg-yellow-50 transition-colors">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-yellow-500 text-sm font-medium">
                <Zap className="h-4 w-4" />
                AI Analysis
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-yellow-500 to-black bg-clip-text text-transparent">
                {stage === "setup"
                  ? "Configure Analysis"
                  : stage === "analyzing"
                    ? "Analyzing Files"
                    : "Analysis Results"}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {stage === "setup"
                  ? `Analyzing ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} with AI`
                  : stage === "analyzing"
                    ? "AI is processing your files"
                    : "Review your AI-generated insights"}
              </p>
            </div>
          </div>

          {/* Show selected files info */}
          {selectedFiles.length > 0 && stage === "setup" && (
            <Card className="mx-auto max-w-4xl mb-8 border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Selected Files for Analysis</h3>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {selectedFiles.map((file, index) => (
                    <div key={file.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span className="truncate">{file.name}</span>
                      <span className="text-gray-500">({file.size})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="mx-auto max-w-4xl mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-900">Analysis Error</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stage === "setup" && (
            <Card className="mx-auto max-w-5xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Analysis Configuration</CardTitle>
              <CardDescription className="text-lg">
                  {user?.isAdmin
                    ? "Customize the AI prompt to focus on specific aspects of your files"
                    : "AI will analyze your files using our optimized prompt"}
                </CardDescription>
              </CardHeader>
             <CardContent className="space-y-8">
                {user?.isAdmin && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="prompt" className="text-base font-medium">
                        Analysis Prompt
                      </Label>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        Admin Only
                      </Badge>
                    </div>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={15}
                      className="font-mono text-sm border-2 focus:border-yellow-500 transition-all duration-200 bg-gray-50"
                      placeholder="Enter your custom prompt here..."
                    />
                    <p className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      💡 <strong>Admin Tip:</strong> Modify this prompt to focus on specific aspects like sales
                      techniques, customer objections, or team performance. The more specific your prompt, the more
                      targeted your insights will be.
                    </p>
                  </div>
                )}

               <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4">
                  {user?.isAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => setPrompt(DEFAULT_PROMPT)}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      Reset to Default
                    </Button>
                  )}
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-black hover:from-yellow-600 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl px-8 text-white"
                    onClick={handleStartAnalysis}
                    disabled={selectedFiles.length === 0}
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Start AI Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {stage === "analyzing" && (
            <Card className="mx-auto max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-yellow-100 to-gray-100">
                  <Brain className="h-10 w-10 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl">Generating AI Insights</CardTitle>
                <CardDescription className="text-lg">
                  Gemini AI is analyzing your files to identify patterns and extract valuable insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-700">{status}</span>
                    <span className="text-yellow-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-gray-200" />
                </div>

                <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-gray-50 border border-yellow-200 p-6 text-sm">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                    <span className="text-gray-800">
                      Processing {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} with Gemini AI. This
                      may take a few moments...
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stage === "results" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 p-6 bg-white rounded-xl shadow-sm border">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Analysis Complete</h2>
                  <p className="text-gray-600">AI-powered insights generated from your files</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleDownloadWord}
                    disabled={isDownloading}
                    className="hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? "Downloading..." : "Download Report"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">AI-Generated Insights</CardTitle>
                  <CardDescription className="text-lg">
                    Analysis and insights generated from your files using Gemini AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-100 rounded-xl">
                      <TabsTrigger
                        value="summary"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Summary
                      </TabsTrigger>
                      <TabsTrigger
                        value="insights"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Insights
                      </TabsTrigger>
                      <TabsTrigger
                        value="suggestions"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Suggestions
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="mt-8">
                      <div className="prose max-w-none">
                        <div
                          className="bg-gray-50 p-6 rounded-xl border leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: insightsData?.summary }}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="insights" className="mt-8">
                      <div className="prose max-w-none">
                        <div
                          className="bg-gray-50 p-6 rounded-xl border leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: insightsData?.insights }}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="suggestions" className="mt-8">
                      <div className="prose max-w-none">
                        <div
                          className="bg-gray-50 p-6 rounded-xl border leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: insightsData?.suggestions }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
