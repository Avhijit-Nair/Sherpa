"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Brain, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

// Mock recording data
const getMockRecording = (id: string) => ({
  id,
  title:
    id === "rec1"
      ? "Weekly Team Meeting"
      : id === "rec2"
        ? "Product Planning Session"
        : id === "rec3"
          ? "Client Presentation: Project X"
          : id === "rec4"
            ? "Marketing Strategy Discussion"
            : "Quarterly Review",
  date: "2025-05-10",
  duration: "45 minutes",
  participants: 8,
})

export default function AnalyzeClientPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const recording = getMockRecording(id)

  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Preparing transcript...")
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const analyzeRecording = async () => {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 5

            // Update status message based on progress
            if (newProgress > 20 && newProgress <= 40) {
              setStatus("Processing audio...")
            } else if (newProgress > 40 && newProgress <= 60) {
              setStatus("Analyzing content...")
            } else if (newProgress > 60 && newProgress <= 80) {
              setStatus("Generating insights...")
            } else if (newProgress > 80) {
              setStatus("Finalizing results...")
            }

            if (newProgress >= 100) {
              clearInterval(progressInterval)
              setIsComplete(true)
            }

            return Math.min(newProgress, 100)
          })
        }, 300)

        // In a real implementation, we would call the API here
        // For now, we'll just simulate the analysis
        // const result = await api.recordings.analyzeTranscripts()

        return () => clearInterval(progressInterval)
      } catch (err) {
        setError("Failed to analyze recording. Please try again.")
        console.error(err)
      }
    }

    analyzeRecording()
  }, [id])

  useEffect(() => {
    if (isComplete) {
      const redirectTimer = setTimeout(() => {
        router.push(`/recordings/${id}/insights`)
      }, 1000)

      return () => clearTimeout(redirectTimer)
    }
  }, [isComplete, id, router])

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
          <div className="mb-4">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{recording.title}</h1>
            <p className="text-gray-500">Analyzing recording to generate insights</p>
          </div>

          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Generating AI Insights</CardTitle>
              <CardDescription>Our AI is analyzing your recording to extract valuable information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                  <p>{error}</p>
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
                      {isComplete ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
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
                            className="h-3 w-3 text-green-600"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </div>
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      )}
                      <span>
                        {isComplete
                          ? "Analysis complete! Redirecting to insights..."
                          : "This may take a few moments depending on the length of your recording."}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
