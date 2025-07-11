"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-purple-100 p-4">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to ZoomInsights</CardTitle>
          <CardDescription className="text-lg">
            Upload your meeting transcripts and generate powerful AI insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 text-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium">Upload Transcripts</h3>
              <p className="text-sm text-gray-500">Upload files directly or from Google Drive</p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 text-center">
              <div className="rounded-full bg-green-100 p-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium">AI Analysis</h3>
              <p className="text-sm text-gray-500">Generate insights with customizable prompts</p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-4 text-center">
              <div className="rounded-full bg-orange-100 p-3">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium">Sales Prep</h3>
              <p className="text-sm text-gray-500">Analyze LinkedIn profiles and pitch decks</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6" onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            No account required. Start analyzing your transcripts immediately.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
