"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, Download, PlayCircle, Share2, Users } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

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
  transcript: `
    [00:00:05] John: Good morning everyone, let's get started with our weekly team meeting.
    
    [00:00:12] Sarah: Before we begin, I wanted to give a quick update on Project Alpha. We're on track but facing some minor technical challenges with the API integration.
    
    [00:00:25] John: What kind of challenges are you encountering?
    
    [00:00:28] Sarah: The third-party API has some inconsistent response formats that are causing our parser to fail. I'm thinking we could implement a middleware layer to normalize the responses before they hit our main codebase.
    
    [00:00:45] Michael: That sounds like a good approach. Do you need any help with that?
    
    [00:00:50] Sarah: I should be able to handle it, but I might reach out if I run into any issues.
    
    [00:00:56] John: Great, let's move on to marketing updates. Emily?
    
    [00:01:02] Emily: The new campaign has exceeded our expectations. We're seeing a 24% increase in engagement compared to last quarter. I think we should consider allocating more resources to expand this campaign.
    
    [00:01:18] John: That's excellent news. Let's discuss resource allocation for the next quarter...
  `,
})

export default function RecordingClientPage() {
  const params = useParams()
  const id = params.id as string
  const recording = getMockRecording(id)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

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
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Logout
            </Link>
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
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{recording.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{recording.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{recording.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recording.participants} participants</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700" size="sm" asChild>
                  <Link href={`/recordings/${id}/analyze`}>Analyze</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video relative bg-black flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-16 w-16 rounded-full bg-black/30 text-white hover:bg-black/40 hover:text-white"
                        onClick={togglePlayback}
                      >
                        <PlayCircle className="h-10 w-10" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2 text-white">
                      <div className="flex items-center justify-between">
                        <span>{isPlaying ? "00:01:24" : "00:00:00"}</span>
                        <div className="w-full mx-4 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full"
                            style={{ width: isPlaying ? "20%" : "0%" }}
                          ></div>
                        </div>
                        <span>{recording.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="text-xl font-bold">Transcript</h2>
                <div className="rounded-lg border p-4 space-y-4 max-h-[400px] overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{recording.transcript}</pre>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Recording Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Date</dt>
                    <dd>{recording.date}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Duration</dt>
                    <dd>{recording.duration}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Participants</dt>
                    <dd>{recording.participants}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Recording ID</dt>
                    <dd className="truncate max-w-[150px]">{recording.id}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Participants</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600">
                      J
                    </div>
                    <span>John (Host)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                      S
                    </div>
                    <span>Sarah</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-600">
                      M
                    </div>
                    <span>Michael</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-medium text-orange-600">
                      E
                    </div>
                    <span>Emily</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-4">Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href={`/recordings/${id}/analyze`}>Generate AI Insights</Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download Transcript
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
