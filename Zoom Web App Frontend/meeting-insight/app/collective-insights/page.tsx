"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ArrowLeft, Brain, Download, Loader2, Share2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

// Sample LLM response based on the provided JSON
const sampleInsights = {
  insights: `**Insights**

This series of transcripts shows a successful sales process progressing through different stages of the sales funnel.  Here's a breakdown:

* **Initial Outreach (May 5th):** Priya effectively piqued Ramesh's interest by highlighting the unique selling points (USP) of the UrbanX Glide and positioning it competitively against established brands. She efficiently qualified the lead by gauging interest and setting up a follow-up meeting with the regional manager.

* **Needs Analysis & Product Demo (May 8th):** Ankit, the regional manager, provided a compelling product demo, addressing Ramesh's concerns about upfront investment and customer financing.  This effectively answered objections and moved the prospect closer to a decision. However, the call ended with Ramesh needing to consult his brother.

* **Addressing Concerns & Negotiation (May 10th):** Priya skillfully addressed Ramesh's concerns regarding after-sales support by highlighting existing infrastructure and future plans.  She also proactively offered co-branding opportunities and marketing support, adding value and demonstrating flexibility. This led to Ramesh's commitment to review the MoU.

* **Closing the Deal (May 11th):** Ankit closed the deal effectively by confirming the final details, addressing the key concern about margins, and securing an initial order of 10 units. The welcome to the network showed professional closing.

**Areas for Improvement:**

* **Documentation:** While the transcripts show effective communication, having access to the actual dealership draft and MoU would provide a more complete picture and ensure accuracy.

* **Quantifiable Metrics:**  While the transcripts mention volume tiers affecting margins, specific data points on volume discounts and the break-even point would be beneficial. Tracking metrics like call duration and successful closing rates is key to improvement.

* **Proactive Follow-up:** While follow-up calls were scheduled, proactively checking in with Ramesh and Karan between calls might have shortened the sales cycle.

* **More focused questioning:** In the initial call, Priya could have explored Ramesh's existing sales strategies and processes to tailor the dealership proposal more effectively.

* **Formalizing next steps:** In May 8th's call, there wasn't a formal action item set for Ramesh beyond "reviewing with his brother". A more formal agreement for the next steps would be useful.

**Summary**

The sales process demonstrates effective communication, addressing customer concerns, and a successful closing.  The team worked collaboratively, leveraging each member's strengths (Priya's initial outreach and relationship building, Ankit's product expertise and closing skills). The process moved swiftly from initial contact to a signed agreement within a week.

**Next Steps**

1. **Review the complete documentation:** Obtain the actual dealership agreement and MoU for thorough review.
2. **Analyze sales cycle metrics:** Track key metrics such as call duration, conversion rates, and time-to-close to identify areas for further optimization.
3. **Develop a standardized sales process:** Create a documented sales process incorporating best practices observed in this successful interaction.
4. **Implement CRM:** Using a Customer Relationship Management (CRM) system would improve tracking and communication.
5. **Refine the sales pitch:** Add data points and quantifiable metrics to refine the sales pitch and make it more impactful.
6. **Training:** Conduct regular training sessions for the sales team to reinforce best practices and address areas for improvement.
7. **Ongoing client relationship management:** Schedule a follow-up call with Ramesh and Karan post onboarding to ensure a smooth transition and gather feedback.  This could build customer loyalty.`,
}

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
    // Convert headers
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Convert bullet points
    .replace(/\* (.*?)(?=\n|$)/g, "<li>$1</li>")
    // Wrap bullet points in ul
    .replace(/<li>(.*?)(?=<li>|$)/gs, "<ul><li>$1</ul>")
    // Convert numbered lists
    .replace(/(\d+)\. (.*?)(?=\n|$)/g, "<li>$2</li>")
    // Wrap numbered lists in ol
    .replace(/<li>(.*?)(?=<li>|$)/gs, "<ol><li>$1</ol>")
    // Convert paragraphs
    .replace(/([^\n<>]+)(?=\n|$)/g, "<p>$1</p>")
    // Fix duplicate paragraph tags
    .replace(/<p><p>/g, "<p>")
    .replace(/<\/p><\/p>/g, "</p>")
    // Fix nested lists
    .replace(/<\/ul><ul>/g, "")
    .replace(/<\/ol><ol>/g, "")

  return html
}

export default function CollectiveInsightsPage() {
  const router = useRouter()
  const [stage, setStage] = useState<"analyzing" | "results">("analyzing")
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Preparing transcripts...")
  const [error, setError] = useState<string | null>(null)
  const [insightsData, setInsightsData] = useState<any>(null)

  useEffect(() => {
    const analyzeRecordings = async () => {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 2

            // Update status message based on progress
            if (newProgress > 20 && newProgress <= 40) {
              setStatus("Processing audio from multiple recordings...")
            } else if (newProgress > 40 && newProgress <= 60) {
              setStatus("Analyzing content across recordings...")
            } else if (newProgress > 60 && newProgress <= 80) {
              setStatus("Identifying patterns and trends...")
            } else if (newProgress > 80 && newProgress < 100) {
              setStatus("Generating collective insights...")
            }

            if (newProgress >= 100) {
              clearInterval(progressInterval)

              // In a real implementation, we would call the API here
              // For now, we'll just use the sample data
              // const result = await api.recordings.analyzeTranscripts()

              const sections = extractSections(sampleInsights.insights)
              setInsightsData({
                summary: markdownToHtml(sections.summary),
                insights: markdownToHtml(sections.insights + sections.areasForImprovement),
                suggestions: markdownToHtml(sections.nextSteps),
              })

              setStage("results")
            }

            return Math.min(newProgress, 100)
          })
        }, 200)

        return () => clearInterval(progressInterval)
      } catch (err) {
        setError("Failed to analyze recordings. Please try again.")
        console.error(err)
      }
    }

    analyzeRecordings()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-purple-600"
            >
              <path d="M7 22a5 5 0 0 1-5-5c0-2.76 2.24-5 5-5 .71 0 1.39.15 2 .42V6a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5.42A5.02 5.02 0 0 0 7 12a5 5 0 0 0-5 5 5 5 0 0 0 5 5Z" />
            </svg>
            <Link href="/" className="text-xl font-bold">
              ZoomInsights
            </Link>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/settings" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Settings
            </Link>
            <button onClick={() => api.auth.logout()} className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-6 md:py-8 lg:py-10">
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Collective Insights</h1>
            <p className="text-gray-500">
              {stage === "analyzing"
                ? "Analyzing multiple recordings to generate comprehensive insights"
                : "AI-generated insights across multiple recordings"}
            </p>
          </div>

          {stage === "analyzing" ? (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Generating Collective Insights</CardTitle>
                <CardDescription>
                  Our AI is analyzing multiple recordings to identify patterns and extract valuable insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error ? (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <p>{error}</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/dashboard")}>
                      Return to Dashboard
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{status}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        <span>
                          This may take a few moments as we analyze multiple recordings to identify patterns and trends.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Analysis Complete</h2>
                  <p className="text-gray-500">Comprehensive insights generated from multiple recordings</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Collective AI-Generated Insights</CardTitle>
                  <CardDescription>Analysis and insights generated from multiple meeting recordings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="insights">Insights</TabsTrigger>
                      <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="mt-6">
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: insightsData?.summary }} />
                    </TabsContent>
                    <TabsContent value="insights" className="mt-6">
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: insightsData?.insights }} />
                    </TabsContent>
                    <TabsContent value="suggestions" className="mt-6">
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: insightsData?.suggestions }}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
