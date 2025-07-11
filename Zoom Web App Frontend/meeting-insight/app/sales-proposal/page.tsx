"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Upload,
  Target,
  Loader2,
  Download,
  Share2,
  Sparkles,
  FileIcon,
  FileText,
  AlertCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useGoogleDrivePicker } from "@/hooks/use-google-drive-picker"
import { LogoutButton } from "@/components/logout-button"
import axios from "axios"

// Default sales proposal prompt
const DEFAULT_SALES_PROPOSAL_PROMPT = `You are a sales proposal expert analyzing a sales transcript.

Your task is to:
1. Analyze the sales conversation to understand the prospect's needs, pain points, and requirements
2. Identify key decision factors and buying signals
3. Create a comprehensive sales proposal that addresses their specific needs

Please provide your proposal in the following format:
- **Executive Summary**: Brief overview of the prospect's needs and our solution
- **Proposed Solution**: Detailed solution addressing their pain points
- **Value Proposition**: Clear benefits and ROI for the prospect
- **Implementation Plan**: Step-by-step approach to deployment
- **Investment & Timeline**: Pricing structure and project timeline
- **Next Steps**: Recommended actions to move forward

Sales transcript content will be provided below:`

type SalesTranscriptFile = {
  id: string
  name: string
  uploadDate: string
  size: string
  type: string
  mimeType?: string
  downloadUrl?: string
}

// Function to extract sections from the proposal text
const extractSections = (text: string) => {
  const executiveSummaryMatch = text.match(
    /\*\*Executive Summary\*\*([\s\S]*?)(?=\*\*Proposed Solution|\*\*Value Proposition)/,
  )
  const proposedSolutionMatch = text.match(
    /\*\*Proposed Solution\*\*([\s\S]*?)(?=\*\*Value Proposition|\*\*Implementation Plan)/,
  )
  const valuePropositionMatch = text.match(
    /\*\*Value Proposition\*\*([\s\S]*?)(?=\*\*Implementation Plan|\*\*Investment)/,
  )
  const implementationPlanMatch = text.match(/\*\*Implementation Plan\*\*([\s\S]*?)(?=\*\*Investment|\*\*Next Steps)/)
  const investmentTimelineMatch = text.match(/\*\*Investment & Timeline\*\*([\s\S]*?)(?=\*\*Next Steps)/)
  const nextStepsMatch = text.match(/\*\*Next Steps\*\*([\s\S]*?)$/)

  return {
    executiveSummary: executiveSummaryMatch ? executiveSummaryMatch[1] : "",
    proposedSolution: proposedSolutionMatch ? proposedSolutionMatch[1] : "",
    valueProposition: valuePropositionMatch ? valuePropositionMatch[1] : "",
    implementationPlan: implementationPlanMatch ? implementationPlanMatch[1] : "",
    investmentTimeline: investmentTimelineMatch ? investmentTimelineMatch[1] : "",
    nextSteps: nextStepsMatch ? nextStepsMatch[1] : "",
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

export default function SalesProposalPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading ,logout} = useAuth()
  const { openPicker, isSignedIn, timeRemaining } = useGoogleDrivePicker({
    multiselect: false,
    showUploadView: true,
  })

  const [selectedFile, setSelectedFile] = useState<SalesTranscriptFile | null>(null)
  const [prompt, setPrompt] = useState(DEFAULT_SALES_PROPOSAL_PROMPT)
  const [stage, setStage] = useState<"setup" | "generating" | "results">("setup")
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Preparing analysis...")
  const [error, setError] = useState<string | null>(null)
  const [proposalData, setProposalData] = useState<any>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/")
      return
    }
  }, [isAuthenticated, authLoading, router])

  const handleFileSelect = () => {
    openPicker((data) => {
      if (data.action === "picked" && data.docs.length > 0) {
        setIsUploading(true)
        setUploadProgress(0)
        setError(null)

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval)
              return 100
            }
            return prev + 10
          })
        }, 200)

        const doc = data.docs[0]
        const file: SalesTranscriptFile = {
          id: doc.id,
          name: doc.name,
          uploadDate: new Date().toLocaleDateString(),
          size: doc.sizeBytes ? `${(doc.sizeBytes / 1024).toFixed(1)} KB` : "Unknown",
          type: doc.name.split(".").pop()?.toLowerCase() || "txt",
          mimeType: doc.mimeType
        }

        setTimeout(() => {
          setSelectedFile(file)
          setIsUploading(false)
          setUploadProgress(0)
        }, 2000)
      }
    })
  }

  const handleGenerateProposal = async () => {
    if (!selectedFile) {
      setError("Please select a sales transcript file.")
      return
    }

    setStage("generating")
    setError(null)
    setProgress(0)

    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 2

          if (newProgress <= 20) {
            setStatus("Processing transcript...")
          } else if (newProgress <= 40) {
            setStatus("Analyzing sales conversation...")
          } else if (newProgress <= 60) {
            setStatus("Identifying key requirements...")
          } else if (newProgress <= 80) {
            setStatus("Generating proposal sections...")
          } else if (newProgress < 95) {
            setStatus("Finalizing proposal...")
          }

          return Math.min(newProgress, 95)
        })
      }, 150)

      // Send to backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/salesproposal`,
        {
          prompt: prompt,
          fileId: selectedFile.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 120000,
        },
      )

      clearInterval(progressInterval)
      setProgress(100)
      setStatus("Proposal generated successfully!")

      if (response.data) {
        const proposalText =
          typeof response.data === "string" ? response.data : response.data.proposal || JSON.stringify(response.data)

        // try {
        //   const sections = extractSections(proposalText)

        //   setProposalData({
        //     executiveSummary: markdownToHtml(sections.executiveSummary),
        //     proposedSolution: markdownToHtml(sections.proposedSolution),
        //     valueProposition: markdownToHtml(sections.valueProposition),
        //     implementationPlan: markdownToHtml(sections.implementationPlan),
        //     investmentTimeline: markdownToHtml(sections.investmentTimeline),
        //     nextSteps: markdownToHtml(sections.nextSteps),
        //     rawData: proposalText,
        //   })
        // } catch (extractionError) {
        //   console.error("Failed to extract sections:", extractionError)
          setProposalData({
            executiveSummary: markdownToHtml(proposalText),
            proposedSolution: markdownToHtml(
              "Please refer to the executive summary for detailed solution information.",
            ),
            valueProposition: markdownToHtml("Please refer to the executive summary for value proposition details."),
            implementationPlan: markdownToHtml("Please refer to the executive summary for implementation details."),
            investmentTimeline: markdownToHtml(
              "Please refer to the executive summary for investment and timeline information.",
            ),
            nextSteps: markdownToHtml("Please refer to the executive summary for next steps."),
            rawData: proposalText,
          })
        // }

        setStage("results")
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (err: any) {
      console.error("Sales proposal generation failed:", err)
      let errorMessage = "Failed to generate sales proposal. Please try again."

      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again."
      } else if (err.response) {
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`
      }

      setError(errorMessage)
      setStage("setup")
    }
  }

  const handleDownloadProposal = () => {
    if (!proposalData) return

    setIsDownloading(true)
    try {
      const content = proposalData.rawData
      const blob = new Blob([content], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sales-proposal-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Failed to download proposal. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileIcon className="h-8 w-8 text-red-500" />
      case "docx":
      case "doc":
        return <FileIcon className="h-8 w-8 text-blue-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-yellow-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Target className="h-6 w-6 text-yellow-500" />
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
              Transcript Analyzer
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/sales-prep"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors"
            >
              Sales Prep
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/sales-proposal" className="text-sm font-medium text-yellow-500 relative group">
              Sales Proposal
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
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
                Back to Transcript Analyzer
              </Link>
            </Button>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-yellow-500 text-sm font-medium">
                <Target className="h-4 w-4" />
                Sales Proposal Generator
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-yellow-500 to-black bg-clip-text text-transparent hover:cursor-pointer">
                {stage === "setup"
                  ? "Generate Sales Proposal"
                  : stage === "generating"
                    ? "Creating Your Proposal"
                    : "Sales Proposal Ready"}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {stage === "setup"
                  ? "Upload a sales transcript and generate a comprehensive proposal"
                  : stage === "generating"
                    ? "AI is analyzing your transcript and creating a tailored proposal"
                    : "Your AI-generated sales proposal is ready for review"}
              </p>
            </div>
          </div>

          {/* Google Drive Session Status
          {isSignedIn && timeRemaining > 0 && (
            <Card className="mx-auto max-w-4xl mb-6 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">
                    Google Drive session active - {Math.floor(timeRemaining / 60)}:
                    {(timeRemaining % 60).toString().padStart(2, "0")} remaining
                  </span>
                </div>
              </CardContent>
            </Card>
          )} */}

          {error && (
            <Card className="mx-auto max-w-4xl mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stage === "setup" && (
            <Card className="mx-auto max-w-5xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Sales Proposal Configuration</CardTitle>
                <CardDescription className="text-lg">
                  Upload the files and click on 'Generate Sales Proposal' button to generate a comprehensive proposal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Sales Transcript File <span className="text-red-500">*</span></Label>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          onClick={handleFileSelect}
                          disabled={isUploading}
                          className="w-full h-12 border-2 border-dashed hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 cursor-pointer"
                        >
                          <Upload className="mr-2 h-5 w-5" />
                          {isUploading ? "Processing..." : "Select Sales Transcript"}
                        </Button>
                        <p className="text-sm text-gray-500">
                          Choose a sales transcript file from your computer or Google Drive
                        </p>

                        {isUploading && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-200 border-t-yellow-600"></div>
                              <span className="text-sm text-yellow-500 font-medium">Processing file...</span>
                            </div>
                            <div className="max-w-xs mx-auto">
                              <Progress value={uploadProgress} className="h-2" />
                              <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
                            </div>
                          </div>
                        )}

                        {/* Selected File Display */}
                        {selectedFile && (
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-3">
                              {getFileIcon(selectedFile.type)}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-yellow-900">Selected File</h4>
                                <p className="text-sm text-yellow-700 truncate">{selectedFile.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                                    {selectedFile.type.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-yellow-600">{selectedFile.size}</span>
                                  <div className="flex items-center gap-1 text-xs text-yellow-600">
                                    <Clock className="h-3 w-3" />
                                    {selectedFile.uploadDate}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">What you'll get:</h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Executive Summary",
                          description: "High-level overview of prospect needs and proposed solution",
                          color: "blue",
                        },
                        {
                          title: "Detailed Solution",
                          description: "Comprehensive solution addressing specific pain points",
                          color: "green",
                        },
                        {
                          title: "Value Proposition",
                          description: "Clear ROI and benefits for the prospect",
                          color: "yellow",
                        },
                        {
                          title: "Implementation Plan",
                          description: "Step-by-step deployment approach and timeline",
                          color: "purple",
                        },
                      ].map((feature, index) => (
                        <div
                          key={feature.title}
                          className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="rounded-full p-3 flex-shrink-0 bg-yellow-100">
                            <Target className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Prompt Section - Only for Admin Users */}
                {user?.isAdmin && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="proposal-prompt" className="text-base font-medium">
                        Proposal Generation Prompt
                      </Label>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        Admin Only
                      </Badge>
                    </div>
                    <Textarea
                      id="proposal-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={12}
                      className="font-mono text-sm border-2 focus:border-yellow-500 transition-all duration-200 bg-gray-50"
                      placeholder="Enter your custom prompt here..."
                    />
                    <p className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      💡 <strong>Admin Tip:</strong> Customize this prompt to focus on specific proposal elements like
                      pricing strategy, implementation timeline, or industry-specific requirements.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4">
                  {user?.isAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => setPrompt(DEFAULT_SALES_PROPOSAL_PROMPT)}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      Reset to Default
                    </Button>
                  )}
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-black hover:from-yellow-600 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl px-8 text-white cursor-pointer"
                    onClick={handleGenerateProposal}
                    disabled={!selectedFile}
                  >
                    <Target className="mr-2 h-5 w-5" />
                    Generate Sales Proposal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {stage === "generating" && (
            <Card className="mx-auto max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-yellow-100 to-gray-100">
                  <Target className="h-10 w-10 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl">Generating Sales Proposal</CardTitle>
                <CardDescription className="text-lg">
                  AI is analyzing your sales transcript and creating a comprehensive proposal
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
                      This may take a few moments as we analyze your transcript and create a tailored proposal.
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
                  <h2 className="text-2xl font-semibold text-gray-900">Proposal Generated Successfully</h2>
                  <p className="text-gray-600">Your comprehensive sales proposal is ready for review</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleDownloadProposal}
                    disabled={isDownloading}
                    className="hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? "Downloading..." : "Download Proposal"}
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

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm ">
                <CardHeader>
                  <CardTitle className="text-2xl">Sales Proposal</CardTitle>
                  <CardDescription className="text-lg">
                    AI-generated comprehensive sales proposal based on your transcript
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="executive-summary" className="w-full">
                    {/* <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-12 bg-gray-100 rounded-xl"> */}
                      {/* <TabsTrigger
                        value="executive-summary"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs lg:text-sm"
                      > */}
                        Proposal Content
                      {/* </TabsTrigger> */}
                      {/* <TabsTrigger
                        value="solution"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs lg:text-sm"
                      >
                        Solution
                      </TabsTrigger>
                      <TabsTrigger
                        value="value"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs lg:text-sm"
                      >
                        Value
                      </TabsTrigger>
                      <TabsTrigger
                        value="implementation"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs lg:text-sm"
                      >
                        Implementation
                      </TabsTrigger>
                      <TabsTrigger
                        value="investment"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs lg:text-sm"
                      >
                        Investment
                      </TabsTrigger>
                      <TabsTrigger
                        value="next-steps"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs lg:text-sm"
                      >
                        Next Steps
                      </TabsTrigger> */}
                    {/* </TabsList> */}
                    <TabsContent value="executive-summary" className="mt-8">
                      <div className="prose max-w-none">
                        <div
                          className="bg-yellow-50 p-6 rounded-xl border leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: proposalData?.executiveSummary }}
                        />
                      </div>
                    </TabsContent>
                    {/* <TabsContent value="solution" className="mt-8">
                      <div className="prose max-w-none">
                        <div
                          className="bg-gray-50 p-6 rounded-xl border leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: proposalData?.proposedSolution }}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="value" className="mt-8">
                      <div className="prose max-w-none">
                        <div
                          className="bg-gray-50 p-6 rounded-xl border leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: proposalData?.valueProposition }}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="implementation" className="mt-8">
                      <div className="prose max-w-none">
                        <div
                          className="bg-gray-50 p-6 rounded-xl border leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: proposalData?.implementationPlan }}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="investment" className="mt-8">
                      <div className="prose max-w-none">
                        <div
                          className="bg-gray-50 p-6 rounded-xl border leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: proposalData?.investmentTimeline }}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="next-steps" className="mt-8">
                      <div className="prose max-w-none">
                        <div
                          className="bg-gray-50 p-6 rounded-xl border leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: proposalData?.nextSteps }}
                        />
                      </div>
                    </TabsContent> */}
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
