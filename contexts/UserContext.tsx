"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getUserMe } from '@/lib/vinhomes-api'

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
  login: (token: string, userData: UserData, username?: string) => void
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
    localStorage.removeItem('vinhomes_tokens')
    setCurrentToken(null)
    setIsLoggedIn(false)
    setUserData(null)
    setUtilityData(null)
    
    // Clear any other potential storage
    if (typeof window !== 'undefined') {
      // Redirect to login
      window.location.href = '/'
    }
  }

  // Initialize user state on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check for any existing token
        
        const validToken = JSON.parse(localStorage.getItem('vinhomes_tokens') || 'null')
        if (validToken) {
          console.log("validToken", validToken)
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
  }, [])

  // Load user data from API
  const loadUserData = async (token: string) => {
    try {
      const userMeResponse = await getUserMe(token)
      console.log("userMeResponse", userMeResponse)
      if (userMeResponse.data) {
        setUserData(userMeResponse.data?.data)
      } else if (userMeResponse.error) {
        clearAllAndRedirectToLogin()
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
    }
  }

  // Login function
  const login = (token: string, userData: UserData, username?: string) => {
    // Store token if username is provided
    if (username) {
      localStorage.setItem('vinhomes_tokens', JSON.stringify(token))
    }
    
    setCurrentToken(token)
    setIsLoggedIn(true)
    setUserData(userData)
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
export function withAuth(Component: React.ComponentType<any>) {
  
    return <Component />
  
}
