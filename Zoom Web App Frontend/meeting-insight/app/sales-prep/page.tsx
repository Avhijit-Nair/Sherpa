"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Upload,
  ExternalLink,
  Users,
  Target,
  TrendingUp,
  Loader2,
  Download,
  Share2,
  Sparkles,
  Trash2,
  FileIcon,
  Presentation,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import useDrivePicker from "react-google-drive-picker"
import axios from "axios"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useGoogleDrivePicker } from "@/hooks/use-google-drive-picker"
import { LogoutButton } from "@/components/logout-button"

// Default sales preparation prompt
const DEFAULT_SALES_PROMPT = `You are a sales strategy expert analyzing LinkedIn profiles and pitch deck presentations.

Your task is to:
1. Analyze the LinkedIn profile to understand the prospect's background, interests, and pain points
2. Review the pitch deck to understand the product/service offering
3. Create a personalized sales strategy that aligns the offering with the prospect's needs

Please provide your analysis in the following format:
- **Prospect Analysis**: Professional background, interests, and potential pain points
- **Pitch Strategy**: Recommended approach based on prospect profile and offering
- **Key Talking Points**: Specific discussion points and questions to ask
- **Next Steps**: Actionable recommendations for the sales process

LinkedIn URL and presentation files will be provided below:`

type PresentationFile = {
  id: string
  name: string
  uploadDate: string
  size: string
  type: string
  mimeType?: string
  downloadUrl?: string
}

// Sample sales preparation insights
const sampleSalesInsights = {
  prospectAnalysis: `**LinkedIn Profile Analysis**

**Professional Background:**
- Senior Sales Director at TechCorp with 8+ years of experience
- Previously worked at Microsoft and Salesforce
- Strong background in enterprise software sales
- MBA from Wharton School

**Key Interests & Pain Points:**
- Focused on digital transformation initiatives
- Frequently posts about sales automation and CRM optimization
- Concerned about team productivity and lead conversion rates
- Active in sales leadership communities

**Communication Style:**
- Professional and data-driven approach
- Values ROI and measurable outcomes
- Prefers detailed case studies and proof points
- Responds well to industry benchmarks`,

  pitchStrategy: `**Recommended Pitch Strategy**

**Opening Hook:**
"I noticed your recent LinkedIn post about improving sales team productivity. Our solution has helped similar companies like yours increase conversion rates by 35% while reducing manual work by 50%."

**Key Value Propositions:**
1. **Automation Focus:** Align with their interest in sales automation
2. **ROI-Driven:** Present clear metrics and benchmarks
3. **Enterprise-Ready:** Emphasize scalability and security features
4. **Proven Results:** Share case studies from similar companies

**Conversation Flow:**
1. Start with their pain points around team productivity
2. Present relevant case studies and benchmarks
3. Demonstrate ROI calculator
4. Address enterprise security and compliance
5. Propose pilot program with clear success metrics`,

  talkingPoints: `**Key Talking Points**

**Discovery Questions:**
- "What's your biggest challenge with current sales processes?"
- "How do you currently measure team productivity?"
- "What tools is your team using for lead management?"
- "What would a 35% improvement in conversion rates mean for your business?"

**Proof Points:**
- 35% average increase in conversion rates
- 50% reduction in manual data entry
- 99.9% uptime SLA for enterprise clients
- SOC 2 Type II compliance

**Objection Handling:**
- **Budget:** Focus on ROI and cost of inaction
- **Integration:** Highlight seamless API connections
- **Training:** Emphasize intuitive interface and support
- **Security:** Detail enterprise-grade security features`,

  nextSteps: `**Recommended Next Steps**

**Immediate Actions:**
1. **Personalized Follow-up:** Reference their recent LinkedIn activity
2. **Case Study Sharing:** Send relevant customer success stories
3. **ROI Calculator:** Provide customized ROI projection
4. **Demo Scheduling:** Propose focused 30-minute demo

**Meeting Preparation:**
- Prepare TechCorp-specific use cases
- Research their current tech stack
- Identify potential integration points
- Prepare competitive differentiation points

**Follow-up Timeline:**
- Day 1: Send personalized connection request
- Day 3: Share relevant case study
- Day 7: Propose demo meeting
- Day 14: Follow up with additional resources`,
}

export default function SalesPrepPage() {
   const router = useRouter()
  const [linkedinUrl, setLinkedinUrl] = useState("")
   const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const [presentations, setPresentations] = useState<PresentationFile[]>([])
  const [prompt, setPrompt] = useState(DEFAULT_SALES_PROMPT)
  const [stage, setStage] = useState<"setup" | "analyzing" | "results">("setup")
  const [progress, setProgress] = useState(0)
   const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState("Preparing analysis...")
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [insightsData, setInsightsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Google Drive Picker for presentations
  const { openPicker, isSignedIn, timeRemaining } = useGoogleDrivePicker({
    multiselect: true,
    showUploadView: true,
  })

  useEffect(() => {
     if (!authLoading && !isAuthenticated) {
      router.push("/")
      return
    }
    // Load presentations from localStorage
    const savedPresentations = localStorage.getItem("salesPresentations")
    if (savedPresentations) {
      try {
        const parsedPresentations = JSON.parse(savedPresentations)
        setPresentations(parsedPresentations)
      } catch (error) {
        console.error("Failed to parse saved presentations:", error)
      }
    }
  }, [isAuthenticated, authLoading, router])

  const savePresentationsToStorage = (updatedPresentations: PresentationFile[]) => {
    localStorage.setItem("salesPresentations", JSON.stringify(updatedPresentations))
    setPresentations(updatedPresentations)
  }

  const handleOpenPicker = () => {
    openPicker((data) => {
      if (data.action === "picked") {
        setIsLoading(true)
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

          try {
            const newPresentations: PresentationFile[] = data.docs
              .filter((doc: any) => {
                const fileType = doc.name.split(".").pop()?.toLowerCase()
                return ["ppt", "pptx", "pdf"].includes(fileType || "")
              })
              .map((doc: any, index: number) => ({
                id: `pres_${Date.now()}_${index}`,
                name: doc.name,
                uploadDate: new Date().toLocaleDateString(),
                size: doc.sizeBytes ? `${(doc.sizeBytes / 1024).toFixed(1)} KB` : "Unknown",
                type: doc.name.split(".").pop()?.toLowerCase() || "pdf",
                mimeType: doc.mimeType,
                downloadUrl: doc.id,
              }))

            if (newPresentations.length === 0) {
              setError("Please select only PowerPoint (.ppt, .pptx) or PDF files.")
              setIsLoading(false)
              setUploadProgress(0)
            return
            }

            const updatedPresentations = [...presentations, ...newPresentations]
            savePresentationsToStorage(updatedPresentations)
          } catch (error) {
            setError("Failed to process selected presentations.")
            setIsLoading(false)
          setUploadProgress(0)
          } finally {
            setIsLoading(false)
          }
        }
    
    })
  }

  const handleDeletePresentation = (id: string) => {
    const updatedPresentations = presentations.filter((p) => p.id !== id)
    savePresentationsToStorage(updatedPresentations)
  }

  const handleStartAnalysis = async () => {
    if (!linkedinUrl || presentations.length === 0) {
      setError("Please provide both LinkedIn URL and at least one presentation file.")
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

          if (newProgress > 20 && newProgress <= 40) {
            setStatus("Analyzing LinkedIn profile...")
          } else if (newProgress > 40 && newProgress <= 60) {
            setStatus("Processing presentations...")
          } else if (newProgress > 60 && newProgress <= 80) {
            setStatus("Generating sales strategy...")
          } else if (newProgress > 80 && newProgress < 100) {
            setStatus("Finalizing recommendations...")
          }

          // if (newProgress >= 100) {
          //   clearInterval(progressInterval)
          //   // Simulate completion with sample data
          //   const sections = extractSections(sampleSalesInsights)
          //   setInsightsData({
          //     summary: markdownToHtml(sections.summary),
          //     insights: markdownToHtml(sections.insights + sections.areasForImprovement),
          //     suggestions: markdownToHtml(sections.nextSteps),
          //     rawData: `${sampleSalesInsights.prospectAnalysis}\n\n${sampleSalesInsights.pitchStrategy}\n\n${sampleSalesInsights.talkingPoints}\n\n${sampleSalesInsights.nextSteps}`,
          //   })
          //   setStage("results")
          // }

          return Math.min(newProgress, 100)
        })
      }, 150)

      // In a real implementation, send to backend:
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/salesprep`,
        // "https://zoom-transcript-analyzer.uc.r.appspot.com/api/salesprep",
        {
          prompt: prompt,
          linkedinUrl: linkedinUrl,
          presentations: presentations,
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 12000000,
          onUploadProgress: (progressEvent:any) => {
          if (progressEvent.total) {
            const uploadProgress = Math.round((progressEvent.loaded * 50) / progressEvent.total)
            setProgress(Math.min(50 + uploadProgress, 90))
          }
        }
        }
      )
      // const response = {
      //   data: {
      //     prepWork: sampleSalesInsights,
      //   },
      // }
      
      // console.log("Data" + JSON.stringify(response))
      if(response.data && response.data.prepWork) {
        clearInterval(progressInterval)
      setProgress(100)
      setStatus("Analysis complete!")
        const salesPrepData = response.data.prepWork
       

        try {
        // const sections = extractSections(salesPrepData)
        // if (sections.summary || sections.insights || sections.nextSteps || sections.areasForImprovement) {
        //   setInsightsData({
        //     summary: markdownToHtml(sections.summary),
        //     insights: markdownToHtml(sections.insights),
        //     nextSteps: markdownToHtml(sections.nextSteps),
        //   })
        //           setStage("results")
        // } else {
          setInsightsData({
            report: markdownToHtml(salesPrepData.toString())
            // insights: markdownToHtml(salesPrepData.toString()),
            // nextSteps: markdownToHtml("Please refer to the summary for actionable insights."),
          })
        // }
        setStage("results")
        }
        catch (extractionError) {
        console.error("Failed to extract sections:", extractionError)
        setInsightsData({
          report: "No Insights available",
          // insights: markdownToHtml(salesPrepData.toString()),
          // nextSteps: markdownToHtml("Please refer to the summary for actionable insights."),
        })
      }
    }
    } catch (err) {
      setError("Failed to analyze sales preparation data. Please try again.")
      console.error(err)
      setStage("setup")
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const content = insightsData?.rawData || "No data available"
      const blob = new Blob([content], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "sales-preparation-report.txt"
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileIcon className="h-8 w-8 text-red-500" />
      case "ppt":
      case "pptx":
        return <Presentation className="h-8 w-8 text-orange-500" />
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />
    }
  }

  // Function to extract sections from the insights text
  const extractSections = (insights: any) => {
    console.log("Extracting sections from insights:", insights)
    return {
      summary: insights.prospectAnalysis,
      insights: insights.pitchStrategy + "\n\n" + insights.talkingPoints,
      nextSteps: insights.nextSteps,
      areasForImprovement: "",
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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-yellow-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Users className="h-6 w-6 text-yellow-500" />
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
            <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors">
              Transcript Analyzer
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/sales-prep" className="text-sm font-medium text-yellow-500 relative group">
              Sales Prep
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/sales-proposal" className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors">
              Sales Proposal
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
           <button
              onClick={() => {
                logout()
                window.location.assign("/")
              }}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors hover:cursor-pointer"
            >
              Logout ({user?.username})
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          
          <div className="mb-6 max-w-6xl mx-auto">
            <Button variant="ghost" size="sm" asChild className="mb-4 hover:bg-yellow-50 transition-colors" onClick={() => setStage("setup")}>
              { stage ==="results" && (<Link href="/sales-prep">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>)} 
              {/* {stage === "setup" && (
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Home
                </Link>
              )} */}
            </Button>

            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-yellow-500 text-sm font-medium">
                <Target className="h-4 w-4" />
                Sales Intelligence
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-yellow-500 to-black bg-clip-text text-transparent">
                {stage === "setup"
                  ? "Sales Preparation"
                  : stage === "analyzing"
                    ? "Analyzing Sales Data"
                    : "Sales Strategy Report"}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {stage === "setup"
                  ? "Analyze LinkedIn profiles and pitch decks for personalized sales strategies"
                  : stage === "analyzing"
                    ? "AI is generating your personalized sales strategy"
                    : "Your comprehensive sales preparation report"}
              </p>
            </div>
          </div>

          {error && (
            <Card className="mx-auto max-w-4xl mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
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
                <CardTitle className="text-2xl">How to do it?</CardTitle>
                <CardDescription className="text-lg">
                  Upload LinkedIn profile URL and pitch deck presentations to generate a personalized sales strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="linkedin-url" className="text-base font-medium">
                        LinkedIn Profile URL <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative group">
                        <ExternalLink className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                        <Input
                          id="linkedin-url"
                          type="url"
                          placeholder="https://linkedin.com/in/prospect-name"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="pl-11 h-12 border-2 focus:border-yellow-500 transition-all duration-200"
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Enter the LinkedIn profile URL of your prospect for personalized insights
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Presentation Files<span className="text-red-500">*</span></Label>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          onClick={handleOpenPicker}
                          disabled={isLoading}
                          className="w-full h-12 border-2 border-dashed hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200"
                        >
                          <Upload className="mr-2 h-5 w-5" />
                          {isLoading ? "Processing..." : "Upload Presentations"}
                        </Button>
                        <p className="text-sm text-gray-500">
                          Upload PowerPoint (.ppt, .pptx) or PDF files from your computer or Google Drive
                        </p>

                        {/* Uploaded Presentations */}
                        {presentations.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">
                              Uploaded Presentations ({presentations.length})
                            </h4>
                            <div className="grid gap-3">
                              {presentations.map((presentation) => (
                                <div
                                  key={presentation.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {getFileIcon(presentation.type)}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{presentation.name}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {presentation.type.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs text-gray-500">{presentation.size}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeletePresentation(presentation.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
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
                          icon: Users,
                          title: "Prospect Analysis",
                          description: "Detailed insights about your prospect's background, interests, and pain points",
                          color: "blue",
                        },
                        {
                          icon: Target,
                          title: "Personalized Strategy",
                          description: "Customized pitch approach based on prospect profile and your offering",
                          color: "green",
                        },
                        {
                          icon: TrendingUp,
                          title: "Talking Points",
                          description: "Key discussion points, questions, and objection handling strategies",
                          color: "yellow",
                        },
                      ].map((feature, index) => (
                        <div
                          key={feature.title}
                          className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div
                            className={cn(
                              "rounded-full p-3 flex-shrink-0",
                              feature.color === "blue" && "bg-blue-100",
                              feature.color === "green" && "bg-green-100",
                              feature.color === "yellow" && "bg-yellow-100",
                            )}
                          >
                            <feature.icon
                              className={cn(
                                "h-5 w-5",
                                feature.color === "blue" && "text-blue-600",
                                feature.color === "green" && "text-green-600",
                                feature.color === "yellow" && "text-yellow-600",
                              )}
                            />
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
                      <Label htmlFor="sales-prompt" className="text-base font-medium">
                        Analysis Prompt
                      </Label>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        Admin Only
                      </Badge>
                    </div>
                    <Textarea
                      id="sales-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={10}
                      className="font-mono text-sm border-2 focus:border-yellow-500 transition-all duration-200 bg-gray-50"
                      placeholder="Enter your custom prompt here..."
                    />
                    <p className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      💡 <strong>Admin Tip:</strong> Modify this prompt to focus on specific aspects like industry
                      expertise, company size, or particular pain points. The more specific your prompt, the more
                      targeted your sales strategy will be.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4">
                  {user?.isAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => setPrompt(DEFAULT_SALES_PROMPT)}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      Reset to Default
                    </Button>
                  )}
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-black hover:from-yellow-600 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl px-8 py-3 text-white"
                    onClick={handleStartAnalysis}
                    disabled={!linkedinUrl || presentations.length === 0}
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Generate Sales Strategy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {stage === "analyzing" && (
            <Card className="mx-auto max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-yellow-100 to-gray-100">
                  <Users className="h-10 w-10 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl">Generating Sales Strategy</CardTitle>
                <CardDescription className="text-lg">
                  Our AI is analyzing the LinkedIn profile and presentations to create your personalized sales approach
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
                      This may take a few moments as we analyze the prospect data and create your strategy.
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
                  <h2 className="text-2xl font-semibold text-gray-900">Sales Strategy Ready</h2>
                  <p className="text-gray-600">Your personalized sales preparation report</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleDownload}
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
                  <CardTitle className="text-2xl">Sales Preparation Report</CardTitle>
                  <CardDescription className="text-lg">
                    AI-generated insights and strategy for your sales meeting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div
                      className="bg-yellow-50 p-6 rounded-xl border leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: insightsData?.report }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
