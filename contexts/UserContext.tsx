"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { TokenService } from '@/lib/token-service'

// User data types
interface UserData {
  fullName?: string
  email?: string
  phone?: string
  [key: string]: any
}

interface UserContextType {
  // User state
  isLoggedIn: boolean
  currentToken: string | null
  userData: UserData | null
  isLoading: boolean
  
  // User actions
  login: (token: string, userData: UserData, username?: string) => Promise<void>
  logout: () => void
  updateUserData: (data: UserData) => void
  refreshUserData: () => Promise<void>
  
  // Utility data
  utilityData: any | null
  setUtilityData: (data: any) => void
  clearUtilityData: () => void
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentToken, setCurrentToken] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [utilityData, setUtilityData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Helper function to clear all data and redirect to login
  const clearAllAndRedirectToLogin = () => {
    console.error("Clearing all tokens and redirecting to login due to invalid token")
    TokenService.clearAllTokens()
    setCurrentToken(null)
    setIsLoggedIn(false)
    setUserData(null)
    setUtilityData(null)
    
    // Clear any other potential storage
    if (typeof window !== 'undefined') {
      // Redirect to login
      window.location.href = '/login'
    }
  }

  // Load user data from API
  const loadUserData = useCallback(async (token: string) => {
    try {
      const userMeResponse = await fetch("/api/user-me", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      console.log("userMeResponse", userMeResponse)
      if (userMeResponse.ok) {
        const userMeResult = await userMeResponse.json()
        console.log("userMeResult from /api/user-me:", userMeResult)
        if (userMeResult.data) {
          console.log("Setting userData to:", userMeResult.data)
          setUserData(userMeResult.data)
        }
      } else if (userMeResponse.status === 400 || userMeResponse.ok === false) {
        // Token is invalid/expired, clear all tokens and redirect to login
        clearAllAndRedirectToLogin()
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
    }
  }, [])

  // Initialize user state on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check for any existing token
        const allTokens = TokenService.getAllTokens()
        const usernames = Object.keys(allTokens)
        
        // Find the first valid token
        let validToken = null
        for (const username of usernames) {
          const token = TokenService.getToken(username)
          if (token) {
            validToken = token
            break
          }
        }
        
        if (validToken) {
          setCurrentToken(validToken)
          setIsLoggedIn(true)
          
          // Load user data (will handle 401 errors internally)
          await loadUserData(validToken)
        }
      } catch (error) {
        console.error("Failed to initialize user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()
  }, [loadUserData])

  // Login function
  const login = async (token: string, userData: UserData, username?: string) => {
    // Store token if username is provided
    if (username) {
      TokenService.storeToken(username, token)
    }
    
    setCurrentToken(token)
    setIsLoggedIn(true)
    setUserData(userData)
    
    // Return a promise that resolves after state updates
    return new Promise<void>((resolve) => {
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        resolve()
      }, 0)
    })
  }

  // Logout function
  const logout = () => {
    clearAllAndRedirectToLogin()
  }

  // Update user data
  const updateUserData = (data: UserData) => {
    setUserData(prev => ({ ...prev, ...data }))
  }

  // Refresh user data from API
  const refreshUserData = async () => {
    if (currentToken) {
      await loadUserData(currentToken)
    }
  }

  // Set utility data
  const setUtilityDataHandler = (data: any) => {
    setUtilityData(data)
  }

  // Clear utility data
  const clearUtilityData = () => {
    setUtilityData(null)
  }

  const value: UserContextType = {
    isLoggedIn,
    currentToken,
    userData,
    isLoading,
    login,
    logout,
    updateUserData,
    refreshUserData,
    utilityData,
    setUtilityData: setUtilityDataHandler,
    clearUtilityData
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

// Custom hook to use user context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isLoggedIn, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isLoggedIn) {
        router.push('/login')
      }
    }, [isLoggedIn, isLoading, router])

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        </div>
      )
    }

    if (!isLoggedIn) {
      return null
    }

    return <Component {...props} />
  }
}
