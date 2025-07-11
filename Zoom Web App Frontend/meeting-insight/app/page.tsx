"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Brain, Users } from "lucide-react"
import Link from "next/link"
import { AuthDialog } from "@/components/auth-dialog"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function Home() {
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  const { user, isAuthenticated, login,logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Show floating button when user scrolls to about 50% of the "Simple 3-step Process" section
      const triggerPoint = documentHeight * 0.6
      setShowFloatingButton(scrollPosition > triggerPoint)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      setShowAuthDialog(true)
    }
  }

  const handleAuthSuccess = (userInfo: { username: string; isAdmin: boolean }) => {
    login(userInfo)
    router.push("/dashboard")
  }

  const handleCardClick = (path: string) => {
    if (isAuthenticated) {
      router.push(path)
    } else {
      setShowAuthDialog(true)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50">
      <header className="border-b">
        <div className="container mx-auto max-w-7xl flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-yellow-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-black to-yellow-500 bg-clip-text text-transparent">
              Sherpa.AI
            </span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
            <Link href="/sales-prep" className="text-sm font-medium hover:underline underline-offset-4">
              Sales Prep
            </Link>
            <Link href="/sales-proposal" className="text-sm font-medium hover:underline underline-offset-4">
              Sales Proposal
            </Link>
            <button
              onClick={() => {
                if(isAuthenticated){
                logout()
                window.location.assign("/")
                }
                else{
                  handleGetStarted()
                }
              }}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 relative group transition-colors"
            >
             { isAuthenticated ? `Logout ${user?.username}`:`Login`}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full hover:cursor-pointer"></span>
            </button>
          
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-yellow-50">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center max-w-6xl mx-auto">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-gray-900 via-yellow-500 to-black bg-clip-text text-transparent">
                    Transform Your Meeting Transcripts into Actionable Insights
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Upload transcript files, customize AI prompts, and generate powerful insights for sales and team
                    analysis.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-yellow-500 to-black hover:from-yellow-600 hover:to-gray-800 hover:cursor-pointertext-white"
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:mr-0 relative">
                <div className="relative rounded-lg border bg-background p-2 shadow-lg">
                  <div className="rounded-md bg-yellow-100 p-4">
                    <div className="space-y-3">
                      <div className="h-2 w-[80%] rounded-lg bg-yellow-200"></div>
                      <div className="h-2 w-[60%] rounded-lg bg-yellow-200"></div>
                      <div className="h-2 w-[70%] rounded-lg bg-yellow-200"></div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-md bg-gray-100 p-3">
                      <div className="h-2 w-[80%] rounded-lg bg-gray-200"></div>
                      <div className="mt-2 h-10 rounded-lg bg-gray-200"></div>
                    </div>
                    <div className="rounded-md bg-gray-100 p-3">
                      <div className="h-2 w-[80%] rounded-lg bg-gray-200"></div>
                      <div className="mt-2 h-10 rounded-lg bg-gray-200"></div>
                    </div>
                    <div className="rounded-md bg-gray-100 p-3">
                      <div className="h-2 w-[80%] rounded-lg bg-gray-200"></div>
                      <div className="mt-2 h-10 rounded-lg bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-black px-3 py-1 text-sm text-yellow-500">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-gray-900 via-yellow-500 to-black bg-clip-text text-transparent">
                  Everything You Need
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides powerful tools to help you get more value from your meeting transcripts.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12 mt-8">
              <div
                className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-yellow-300 hover:bg-yellow-50/50"
                onClick={() => handleCardClick("/dashboard")}
              >
                <div className="rounded-full bg-yellow-100 p-3">
                  <Brain className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold">Custom AI Analysis</h3>
                <p className="text-center text-gray-500">
                  Customize AI prompts to focus on specific insights and patterns.
                </p>
                <div className="pt-2">
                  <ArrowRight className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div
                className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-yellow-300 hover:bg-yellow-50/50"
                onClick={() => handleCardClick("/sales-prep")}
              >
                <div className="rounded-full bg-yellow-100 p-3">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold">Sales Preparation</h3>
                <p className="text-center text-gray-500">
                  Analyze LinkedIn profiles and pitch decks for personalized sales strategies.
                </p>
                <div className="pt-2">
                  <ArrowRight className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div
                className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-yellow-300 hover:bg-yellow-50/50"
                onClick={() => handleCardClick("/sales-proposal")}
              >
                <div className="rounded-full bg-yellow-100 p-3">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold">Sales Proposal Generation</h3>
                <p className="text-center text-gray-500">
                  Generate professional sales proposals from sales transcripts.
                </p>
                <div className="pt-2">
                  <ArrowRight className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-black px-3 py-1 text-sm text-yellow-500">How It Works</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-gray-900 via-yellow-500 to-black bg-clip-text text-transparent">
                  Simple 3-Step Process
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform makes it easy to get insights from your transcripts.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 mt-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-black text-white">
                  1
                </div>
                <h3 className="text-xl font-bold">Upload Transcripts</h3>
                <p className="text-center text-gray-500">Upload files directly or import from Google Drive.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-black text-white">
                  2
                </div>
                <h3 className="text-xl font-bold">Customize Analysis</h3>
                <p className="text-center text-gray-500">Modify AI prompts to focus on your specific needs.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-black text-white">
                  3
                </div>
                <h3 className="text-xl font-bold">Get Insights</h3>
                <p className="text-center text-gray-500">View comprehensive analysis and download reports.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-6">
          <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
            © 2025 Sherpa.AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Get Started Button */}
      {showFloatingButton && !isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-yellow-500 to-black hover:from-yellow-600 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onSuccess={handleAuthSuccess} />
    </div>
  )
}
