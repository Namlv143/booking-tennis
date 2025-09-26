"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useUser } from "@/contexts/UserContext"

export default function TennisBookingPage() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useUser()

  // Redirect based on login status
  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        // Redirect to utilities as homepage when logged in
        router.push("/utilities")
      } else {
        // No token, redirect to login
        router.push("/login")
      }
    }
  }, [isLoading, isLoggedIn, router])

  // Show loading or redirecting message
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)' }}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>{isLoading ? "Loading..." : "Redirecting..."}</p>
      </div>
    </div>
  )
}

