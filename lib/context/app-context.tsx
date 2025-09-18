"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { TokenService } from '@/lib/token-service'

// Types for our global state
interface UserData {
  fullName?: string
  email?: string
  phone?: string
  [key: string]: any
}

interface AppState {
  // Authentication
  isLoggedIn: boolean
  currentToken: string | null
  userData: UserData | null
  
  // Loading states
  isLoading: boolean
  isLoggingIn: boolean
  isBooking: boolean
  
  // API results
  loginResult: {
    success: boolean
    message: string
    data?: any
  } | null
  
  utilityResult: {
    success: boolean
    message: string
    data?: any
  } | null
  
  bookingResults: {
    [key: string]: {
      success: boolean
      message: string
    } | null
  }
  
  // Error handling
  error: string | null
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOGGING_IN'; payload: boolean }
  | { type: 'SET_BOOKING'; payload: boolean }
  | { type: 'SET_LOGGED_IN'; payload: boolean }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_USER_DATA'; payload: UserData | null }
  | { type: 'SET_LOGIN_RESULT'; payload: { success: boolean; message: string; data?: any } | null }
  | { type: 'SET_UTILITY_RESULT'; payload: { success: boolean; message: string; data?: any } | null }
  | { type: 'SET_BOOKING_RESULT'; payload: { key: string; result: { success: boolean; message: string } | null } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALL_RESULTS' }
  | { type: 'LOGOUT' }
  | { type: 'INITIALIZE_STATE' }

// Initial state
const initialState: AppState = {
  isLoggedIn: false,
  currentToken: null,
  userData: null,
  isLoading: false,
  isLoggingIn: false,
  isBooking: false,
  loginResult: null,
  utilityResult: null,
  bookingResults: {},
  error: null,
}

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_LOGGING_IN':
      return { ...state, isLoggingIn: action.payload }
    
    case 'SET_BOOKING':
      return { ...state, isBooking: action.payload }
    
    case 'SET_LOGGED_IN':
      return { ...state, isLoggedIn: action.payload }
    
    case 'SET_TOKEN':
      return { ...state, currentToken: action.payload }
    
    case 'SET_USER_DATA':
      return { ...state, userData: action.payload }
    
    case 'SET_LOGIN_RESULT':
      return { ...state, loginResult: action.payload }
    
    case 'SET_UTILITY_RESULT':
      return { ...state, utilityResult: action.payload }
    
    case 'SET_BOOKING_RESULT':
      return {
        ...state,
        bookingResults: {
          ...state.bookingResults,
          [action.payload.key]: action.payload.result,
        },
      }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'CLEAR_ALL_RESULTS':
      return {
        ...state,
        loginResult: null,
        utilityResult: null,
        bookingResults: {},
        error: null,
      }
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoggedIn: false,
        currentToken: null,
        userData: null,
      }
    
    case 'INITIALIZE_STATE':
      return {
        ...state,
        isLoading: false,
        isLoggingIn: false,
        isBooking: false,
        error: null,
      }
    
    default:
      return state
  }
}

// Context type
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  
  // Convenience methods
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loadUserData: (token: string) => Promise<void>
  getUtilityData: (token: string) => Promise<void>
  bookTennisCourt: (params: {
    placeId: number
    placeUtilityId: number
    timeConstraintId: number
    bookingKey: string
  }) => Promise<void>
  clearResults: () => void
  setError: (error: string | null) => void
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize state on mount
  useEffect(() => {
    const token = TokenService.getToken("0979251496")
    if (token) {
      dispatch({ type: 'SET_LOGGED_IN', payload: true })
      dispatch({ type: 'SET_TOKEN', payload: token })
      loadUserData(token)
    }
  }, [])

  // Load user data
  const loadUserData = async (token: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const userMeResponse = await fetch("/api/user-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (userMeResponse.ok) {
        const userMeResult = await userMeResponse.json()
        if (userMeResult.data) {
          dispatch({ type: 'SET_USER_DATA', payload: userMeResult.data })
        }
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
      dispatch({ type: 'SET_ERROR', payload: "Failed to load user data" })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Login function
  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOGGING_IN', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()

      if (response.ok && result.success && result.data?.data?.accessToken) {
        const token = result.data.data.accessToken
        TokenService.storeToken(username, token)
        
        dispatch({ type: 'SET_LOGGED_IN', payload: true })
        dispatch({ type: 'SET_TOKEN', payload: token })
        dispatch({ type: 'SET_LOGIN_RESULT', payload: {
          success: true,
          message: "Login successful!",
          data: result
        }})
        
        // Load user data after successful login
        await loadUserData(token)
      } else {
        dispatch({ type: 'SET_LOGIN_RESULT', payload: {
          success: false,
          message: result.message || "Login failed. Please try again."
        }})
      }
    } catch (error) {
      dispatch({ type: 'SET_LOGIN_RESULT', payload: {
        success: false,
        message: "Network error. Please check your connection and try again."
      }})
    } finally {
      dispatch({ type: 'SET_LOGGING_IN', payload: false })
    }
  }

  // Logout function
  const logout = () => {
    TokenService.clearAllTokens()
    dispatch({ type: 'LOGOUT' })
  }

  // Get utility data
  const getUtilityData = async (token: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await fetch(`/api/utility?token=${encodeURIComponent(token)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()

      if (response.ok && result.data) {
        dispatch({ type: 'SET_UTILITY_RESULT', payload: {
          success: true,
          message: "Utility data retrieved successfully! 📊",
          data: result.data
        }})
      } else {
        dispatch({ type: 'SET_UTILITY_RESULT', payload: {
          success: false,
          message: result.message || "Failed to retrieve utility data."
        }})
      }
    } catch (error) {
      dispatch({ type: 'SET_UTILITY_RESULT', payload: {
        success: false,
        message: "Network error. Please check your connection and try again."
      }})
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Book tennis court
  const bookTennisCourt = async (params: {
    placeId: number
    placeUtilityId: number
    timeConstraintId: number
    bookingKey: string
  }) => {
    if (!state.currentToken) {
      dispatch({ type: 'SET_BOOKING_RESULT', payload: {
        key: params.bookingKey,
        result: {
          success: false,
          message: "Please login first to book tennis courts."
        }
      }})
      return
    }

    try {
      dispatch({ type: 'SET_BOOKING', payload: true })
      dispatch({ type: 'SET_BOOKING_RESULT', payload: { key: params.bookingKey, result: null }})

      const response = await fetch("/api/tennis-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: params.placeId,
          placeUtilityId: params.placeUtilityId,
          timeConstraintId: params.timeConstraintId,
          jwtToken: state.currentToken
        }),
      })

      const result = await response.json()

      if (result?.data?.transactionId || result?.data?.userId) {
        dispatch({ type: 'SET_BOOKING_RESULT', payload: {
          key: params.bookingKey,
          result: {
            success: true,
            message: "Tennis court booking completed successfully! 🎾"
          }
        }})
      } else {
        dispatch({ type: 'SET_BOOKING_RESULT', payload: {
          key: params.bookingKey,
          result: {
            success: false,
            message: result.message || "Booking failed. Please try again."
          }
        }})
      }
    } catch (error) {
      dispatch({ type: 'SET_BOOKING_RESULT', payload: {
        key: params.bookingKey,
        result: {
          success: false,
          message: "Network error. Please check your connection and try again."
        }
      }})
    } finally {
      dispatch({ type: 'SET_BOOKING', payload: false })
    }
  }

  // Clear all results
  const clearResults = () => {
    dispatch({ type: 'CLEAR_ALL_RESULTS' })
  }

  // Set error
  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  const value: AppContextType = {
    state,
    dispatch,
    login,
    logout,
    loadUserData,
    getUtilityData,
    bookTennisCourt,
    clearResults,
    setError,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Export types for use in other files
export type { AppState, UserData, AppContextType }
