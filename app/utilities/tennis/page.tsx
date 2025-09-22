"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
 Loader2,
 Calendar,
 LogOut,
 LayoutList,
 UserRoundCheck,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// Pre-computed constants for instant access
const BOOKING_TARGET = {
 placeId: 802,
 placeUtilityId: 626,
 timeConstraintId: 571,
 classifyId: 118
} as const;

const BOOKING_TARGET_1 = {
 placeId: 801,
 placeUtilityId: 625,
 timeConstraintId: 571,
 classifyId: 118
} as const;

const API_ENDPOINT = "/api/tennis-booking-reverse";

const FETCH_OPTIONS_BASE = {
 method: "POST",
 headers: {
  "Content-Type": "application/json",
 },
 cache: 'no-store' as RequestCache,
 keepalive: true,
} as const;

// Constants for checksum calculation (same as backend)
const UTILITY_ID = 75;
const RESIDENT_TICKET_COUNT = 4;
const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@";

// Pre-create TextEncoder for performance
const textEncoder = new TextEncoder();

// Get booking date (same logic as backend)
const getBookingDate = (): number => {
 const now = Date.now();
 const vietnamTime = new Date(now + 7 * 60 * 60 * 1000);
 const tomorrow = new Date(vietnamTime);
 tomorrow.setDate(tomorrow.getDate() + 1);
 tomorrow.setHours(8, 30, 0, 0);
 return tomorrow.getTime();
};

// Calculate checksum once - values never change!
const calculateStaticChecksum = async (bookingDate: number): Promise<string> => {
 const numericSum = UTILITY_ID + BOOKING_TARGET.placeId + bookingDate + BOOKING_TARGET.timeConstraintId;
 const interpolatedString = `${numericSum}${SECRET_KEY}`;
 
 const data = textEncoder.encode(interpolatedString);
 const hashBuffer = await crypto.subtle.digest("SHA-256", data);
 
 // Optimized hex conversion
 const hashArray = new Uint8Array(hashBuffer);
 let hexString = '';
 for (let i = 0; i < hashArray.length; i++) {
  hexString += hashArray[i].toString(16).padStart(2, "0");
 }
 return hexString;
};

export default function TennisBookingPage() {

 const [isBooking6, setIsBooking6] = useState(false);
 const [bookingResult6, setBookingResult6] = useState<{
  success: boolean;
  message: string;
 } | null>(null);
 
 // Optimization: AbortController for request cancellation
 const [bookingController6, setBookingController6] = useState<AbortController | null>(null);
 
 // Pre-computed request payload template (updated when token changes)
 const [precomputedPayload, setPrecomputedPayload] = useState<any>(null);
 
 // Pre-computed checksum - NEVER changes with hardcoded values!
 const [precomputedChecksum, setPrecomputedChecksum] = useState<string | null>(null);

 // Button 1 state (BOOKING_TARGET_1)
 const [isBooking1, setIsBooking1] = useState(false);
 const [bookingResult1, setBookingResult1] = useState<{
  success: boolean;
  message: string;
 } | null>(null);
 
 const [bookingController1, setBookingController1] = useState<AbortController | null>(null);
 const [precomputedPayload1, setPrecomputedPayload1] = useState<any>(null);
 const [precomputedChecksum1, setPrecomputedChecksum1] = useState<string | null>(null);

 // Both courts booking state
 const [isBookingBoth, setIsBookingBoth] = useState(false);
 const [bookingBothResult, setBookingBothResult] = useState<{
  success: boolean;
  message: string;
  court1Result?: any;
  court2Result?: any;
 } | null>(null);

 // Auto-trigger at 8:30 AM state
 const [autoTriggerEnabled, setAutoTriggerEnabled] = useState(false);
 const [timeUntil830, setTimeUntil830] = useState<string>("");
 const [autoTriggerStatus, setAutoTriggerStatus] = useState<string>("");

 const router = useRouter();

 // Use context for user state
 const { isLoggedIn, currentToken, userData, isLoading, logout } = useUser();

 // Redirect if not logged in
 useEffect(() => {
  if (!isLoading && !isLoggedIn) {
   router.push("/login");
  }
 }, [isLoading, isLoggedIn, router]);

 // Pre-compute checksum on page load (NEVER changes!)
 useEffect(() => {
  const computeChecksum = async () => {
   const bookingDate = getBookingDate();
   
   // Calculate checksum for BOOKING_TARGET (original)
   const checksum = await calculateStaticChecksum(bookingDate);
   setPrecomputedChecksum(checksum);
   
   // Calculate checksum for BOOKING_TARGET_1 (new button)
   const numericSum1 = UTILITY_ID + BOOKING_TARGET_1.placeId + bookingDate + BOOKING_TARGET_1.timeConstraintId;
   const interpolatedString1 = `${numericSum1}${SECRET_KEY}`;
   const data1 = textEncoder.encode(interpolatedString1);
   const hashBuffer1 = await crypto.subtle.digest("SHA-256", data1);
   const hashArray1 = new Uint8Array(hashBuffer1);
   let hexString1 = '';
   for (let i = 0; i < hashArray1.length; i++) {
    hexString1 += hashArray1[i].toString(16).padStart(2, "0");
   }
   setPrecomputedChecksum1(hexString1);
  };
  
  computeChecksum();
 }, []); // Empty dependency - runs once on mount

 // Pre-compute request payload when token is available
 useEffect(() => {
  if (currentToken && precomputedChecksum) {
   // Pre-build the entire request payload WITH pre-computed checksum
   const payload = {
    jwtToken: currentToken,
    bookingTarget: {
     ...BOOKING_TARGET,
     precomputedChecksum // Include the pre-computed checksum!
    }
   };
   setPrecomputedPayload(JSON.stringify(payload));
  } else {
   setPrecomputedPayload(null);
  }
 }, [currentToken, precomputedChecksum]);

 // Pre-compute request payload for BOOKING_TARGET_1
 useEffect(() => {
  if (currentToken && precomputedChecksum1) {
   // Pre-build the entire request payload WITH pre-computed checksum for button 1
   const payload1 = {
    jwtToken: currentToken,
    bookingTarget: {
     ...BOOKING_TARGET_1,
     precomputedChecksum: precomputedChecksum1 // Include the pre-computed checksum!
    }
   };
   setPrecomputedPayload1(JSON.stringify(payload1));
  } else {
   setPrecomputedPayload1(null);
  }
 }, [currentToken, precomputedChecksum1]);

 const handleBooking6 = async () => {
  // Fast validation - fail immediately if not ready
  if (!precomputedPayload) {
   setBookingResult6({
    success: false,
    message: "❌ System not ready - please wait"
   });
   return;
  }

  // Cancel any existing request
  if (bookingController6) {
   bookingController6.abort();
  }

  // Create new controller for this request
  const controller = new AbortController();
  setBookingController6(controller);

  // Batch state updates for better performance
  setIsBooking6(true);
  setBookingResult6(null);

  const startTime = performance.now();

  try {
   console.log("🧪 [CARD 6] Starting tennis booking request...");
   
   // INSTANT FETCH - everything pre-computed!
   const response = await fetch(API_ENDPOINT, {
    ...FETCH_OPTIONS_BASE,
    body: precomputedPayload, // Already JSON stringified!
    signal: controller.signal,
   });

   // Fast response validation
   if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
   }

   // Optimized JSON parsing with error handling
   let result;
   try {
    result = await response.json();
   } catch (parseError) {
    throw new Error("Invalid response format from server");
   }

   const processingTime = Math.round(performance.now() - startTime);
   console.log(`🧪 [CARD 6] Request completed in ${processingTime}ms`);

   // Fast success validation
   const isSuccess = result?.data?.transactionId || result?.data?.userId || result?.success;
   
   // Batch state update
    setBookingResult6({
    success: !!isSuccess,
    message: isSuccess 
     ? `✅ Booking successful! (${processingTime}ms) 🎾`
     : `❌ ${result?.message || JSON.stringify(result).substring(0, 100) || "Booking failed"}`
   });

  } catch (error: any) {
   const processingTime = Math.round(performance.now() - startTime);
   
   // Handle different error types efficiently
   let errorMessage = "Network error occurred";
   
   if (error.name === 'AbortError') {
    errorMessage = "Request cancelled";
   } else if (error.message?.includes('HTTP')) {
    errorMessage = `Server error: ${error.message}`;
   } else if (error.message?.includes('fetch')) {
    errorMessage = "Connection failed - check network";
   } else if (error.message) {
    errorMessage = error.message;
   }

   console.log(`🧪 [CARD 6] Error after ${processingTime}ms:`, errorMessage);
   
   setBookingResult6({
    success: false,
    message: `❌ ${errorMessage} (${processingTime}ms)`
   });
  } finally {
   // Cleanup and batch final state updates
   setIsBooking6(false);
   setBookingController6(null);
  }
 };

 const handleBooking1 = async () => {
  // Fast validation - fail immediately if not ready
  if (!precomputedPayload1) {
   setBookingResult1({
    success: false,
    message: "❌ System not ready - please wait"
   });
   return;
  }

  // Cancel any existing request
  if (bookingController1) {
   bookingController1.abort();
  }

  // Create new controller for this request
  const controller = new AbortController();
  setBookingController1(controller);

  // Batch state updates for better performance
  setIsBooking1(true);
  setBookingResult1(null);

  const startTime = performance.now();

  try {
   console.log("🧪 [CARD 1] Starting tennis booking request...");
   
   // INSTANT FETCH - everything pre-computed!
   const response = await fetch(API_ENDPOINT, {
    ...FETCH_OPTIONS_BASE,
    body: precomputedPayload1, // Already JSON stringified!
    signal: controller.signal,
   });

   // Fast response validation
   if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
   }

   // Optimized JSON parsing with error handling
   let result;
   try {
    result = await response.json();
   } catch (parseError) {
    throw new Error("Invalid response format from server");
   }

   const processingTime = Math.round(performance.now() - startTime);
   console.log(`🧪 [CARD 1] Request completed in ${processingTime}ms`);

   // Fast success validation
   const isSuccess = result?.data?.transactionId || result?.data?.userId || result?.success;
   
   // Batch state update
   setBookingResult1({
    success: !!isSuccess,
    message: isSuccess 
     ? `✅ Booking successful! (${processingTime}ms) 🎾`
     : `❌ ${result?.message || JSON.stringify(result).substring(0, 100) || "Booking failed"}`
   });

  } catch (error: any) {
   const processingTime = Math.round(performance.now() - startTime);
   
   // Handle different error types efficiently
   let errorMessage = "Network error occurred";
   
   if (error.name === 'AbortError') {
    errorMessage = "Request cancelled";
   } else if (error.message?.includes('HTTP')) {
    errorMessage = `Server error: ${error.message}`;
   } else if (error.message?.includes('fetch')) {
    errorMessage = "Connection failed - check network";
   } else if (error.message) {
    errorMessage = error.message;
   }

   console.log(`🧪 [CARD 1] Error after ${processingTime}ms:`, errorMessage);
   
   setBookingResult1({
    success: false,
    message: `❌ ${errorMessage} (${processingTime}ms)`
   });
  } finally {
   // Cleanup and batch final state updates
   setIsBooking1(false);
   setBookingController1(null);
  }
 };

 const handleBookBoth = useCallback(async () => {
  // Fast validation - both payloads must be ready
  if (!precomputedPayload || !precomputedPayload1) {
   setBookingBothResult({
    success: false,
    message: "❌ System not ready - please wait for both courts to initialize"
   });
   return;
  }

  // Prevent multiple simultaneous requests
  if (isBookingBoth || isBooking1 || isBooking6) {
   setBookingBothResult({
    success: false,
    message: "❌ Booking already in progress - please wait"
   });
   return;
  }

  setIsBookingBoth(true);
  setBookingBothResult(null);
  
  // Clear individual results to avoid confusion
  setBookingResult1(null);
  setBookingResult6(null);

  const startTime = performance.now();

  try {
   console.log("🚀 [BOTH COURTS] Starting SIMULTANEOUS booking for S1.01 and S1.02...");
   
   // Create controllers for both requests
   const controller1 = new AbortController();
   const controller6 = new AbortController();
   
   // Set controllers for cleanup
   setBookingController1(controller1);
   setBookingController6(controller6);

   // PARALLEL BOOKING - Both courts at the same time!
   const [result1, result6] = await Promise.all([
    // Court 1 (S1.01) booking
    fetch(API_ENDPOINT, {
     ...FETCH_OPTIONS_BASE,
     body: precomputedPayload1,
     signal: controller1.signal,
    }).then(async (response) => {
     if (!response.ok) {
      throw new Error(`Court 1 HTTP ${response.status}: ${response.statusText}`);
     }
     const data = await response.json();
     return { court: 'S1.01', success: true, data };
    }).catch((error) => {
     return { court: 'S1.01', success: false, error: error.message };
    }),

    // Court 2 (S1.02) booking  
    fetch(API_ENDPOINT, {
     ...FETCH_OPTIONS_BASE,
     body: precomputedPayload,
     signal: controller6.signal,
    }).then(async (response) => {
     if (!response.ok) {
      throw new Error(`Court 2 HTTP ${response.status}: ${response.statusText}`);
     }
     const data = await response.json();
     return { court: 'S1.02', success: true, data };
    }).catch((error) => {
     return { court: 'S1.02', success: false, error: error.message };
    })
   ]);

   const processingTime = Math.round(performance.now() - startTime);
   console.log(`🚀 [BOTH COURTS] Parallel booking completed in ${processingTime}ms`);
   console.log(`Court 1 (S1.01): ${result1.success ? 'SUCCESS' : 'FAILED'}`);
   console.log(`Court 2 (S1.02): ${result6.success ? 'SUCCESS' : 'FAILED'}`);

   // Determine overall success
   const successCount = (result1.success ? 1 : 0) + (result6.success ? 1 : 0);
   const isOverallSuccess = successCount > 0;

   // Update individual results
   if (result1.success) {
    const data1 = 'data' in result1 ? result1.data : null;
    const isSuccess1 = data1?.data?.transactionId || data1?.data?.userId || data1?.success;
    setBookingResult1({
     success: !!isSuccess1,
     message: isSuccess1 ? `✅ S1.01 booked! (${processingTime}ms) 🎾` : `❌ S1.01 booking failed`
    });
   } else {
    const error1 = 'error' in result1 ? result1.error : 'Unknown error';
    setBookingResult1({
     success: false,
     message: `❌ S1.01: ${error1}`
    });
   }

   if (result6.success) {
    const data6 = 'data' in result6 ? result6.data : null;
    const isSuccess6 = data6?.data?.transactionId || data6?.data?.userId || data6?.success;
    setBookingResult6({
     success: !!isSuccess6,
     message: isSuccess6 ? `✅ S1.02 booked! (${processingTime}ms) 🎾` : `❌ S1.02 booking failed`
    });
   } else {
    const error6 = 'error' in result6 ? result6.error : 'Unknown error';
    setBookingResult6({
     success: false,
     message: `❌ S1.02: ${error6}`
    });
   }

   // Set combined result
   let message = "";
   if (successCount === 2) {
    message = `🎉 BOTH COURTS BOOKED! S1.01 + S1.02 (${processingTime}ms) 🎾🎾`;
   } else if (successCount === 1) {
    const successCourt = result1.success ? "S1.01" : "S1.02";
    message = `✅ ${successCourt} booked successfully! (${processingTime}ms) 🎾`;
   } else {
    message = `❌ Both courts failed. Try individual booking. (${processingTime}ms)`;
   }

   setBookingBothResult({
    success: isOverallSuccess,
    message,
    court1Result: result1,
    court2Result: result6
   });

  } catch (error: any) {
   const processingTime = Math.round(performance.now() - startTime);
   console.error(`🚀 [BOTH COURTS] Error after ${processingTime}ms:`, error);
   
   setBookingBothResult({
    success: false,
    message: `❌ Parallel booking failed: ${error.message} (${processingTime}ms)`
   });
  } finally {
   // Cleanup
   setIsBookingBoth(false);
   setBookingController1(null);
   setBookingController6(null);
  }
 }, [precomputedPayload, precomputedPayload1, isBooking1, isBooking6]);

 // Precise 8:30 AM Auto-trigger System
 useEffect(() => {
  let intervalId: NodeJS.Timeout;
  let timeoutId: NodeJS.Timeout;

  const getVietnamTime = () => {
   // Use proper Vietnam timezone conversion
   const now = new Date();
   const vietnamTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
   return vietnamTime;
  };

  const updateCountdown = () => {
   const vietnamTime = getVietnamTime();
   
   console.log(`🕐 Current Vietnam time: ${vietnamTime.toLocaleString()}`);
   
    // Target: 8:30:00.000 AM Vietnam time (PRODUCTION booking time)
    const target830 = new Date(vietnamTime);
    target830.setHours(8, 30, 0, 0);
    
    console.log(`🎯 Target 8:30 AM: ${target830.toLocaleString()}`);
    
    // If it's already past 8:30 AM today, set for tomorrow
   if (target830.getTime() <= vietnamTime.getTime()) {
    target830.setDate(target830.getDate() + 1);
    console.log(`⏭️ Moved to tomorrow: ${target830.toLocaleString()}`);
   }
   
   const timeUntil = target830.getTime() - vietnamTime.getTime();
   console.log(`⏱️ Time until target: ${timeUntil}ms (${Math.round(timeUntil/1000)}s)`);
   
   if (timeUntil <= 0) {
    // Recalculate for next day
    target830.setDate(target830.getDate() + 1);
    const newTimeUntil = target830.getTime() - vietnamTime.getTime();
    
    const hours = Math.floor(newTimeUntil / (1000 * 60 * 60));
    const minutes = Math.floor((newTimeUntil % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((newTimeUntil % (1000 * 60)) / 1000);
    
    setTimeUntil830(`${hours}h ${minutes}m ${seconds}s`);
    setAutoTriggerStatus("⏰ Next booking window: Tomorrow 8:30 AM");
    return;
   }
   
   const hours = Math.floor(timeUntil / (1000 * 60 * 60));
   const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
   const seconds = Math.floor((timeUntil % (1000 * 60)) / 1000);
   
   setTimeUntil830(`${hours}h ${minutes}m ${seconds}s`);
   
   // Dynamic status based on time remaining
   if (timeUntil < 10000) { // Less than 10 seconds
    setAutoTriggerStatus("🚀 BOOKING STARTS IN SECONDS!");
   } else if (timeUntil < 60000) { // Less than 1 minute  
    setAutoTriggerStatus("🎯 FINAL COUNTDOWN - BOOKING IMMINENT!");
   } else if (timeUntil < 300000) { // Less than 5 minutes
    setAutoTriggerStatus("⚡ System ready - booking in minutes!");
   } else if (timeUntil < 3600000) { // Less than 1 hour
    setAutoTriggerStatus("🎾 Optimal booking window approaching");
   } else {
    setAutoTriggerStatus("⏰ Auto-booking scheduled for 8:30 AM sharp");
   }
  };

  const scheduleAutomaticBooking = () => {
   const vietnamTime = getVietnamTime();
   const target830 = new Date(vietnamTime);
   target830.setHours(8, 30, 0, 0);
   
   // If it's already past 8:30 AM today, set for tomorrow
   if (target830.getTime() <= vietnamTime.getTime()) {
    target830.setDate(target830.getDate() + 1);
   }
   
   let timeUntil = target830.getTime() - vietnamTime.getTime();
   
   // PRECISION OPTIMIZATION: Subtract estimated delay compensation
   const ESTIMATED_EXECUTION_DELAY = 10; // ms - accounts for setTimeout/React/network delays
   timeUntil = Math.max(0, timeUntil - ESTIMATED_EXECUTION_DELAY);
   
   console.log(`🎯 [AUTO-TRIGGER] Scheduled for ${target830.toLocaleString()}`);
   console.log(`🕐 [AUTO-TRIGGER] Current Vietnam time: ${vietnamTime.toLocaleString()}`);
   console.log(`⏱️ [AUTO-TRIGGER] Time until trigger: ${timeUntil}ms (${Math.round(timeUntil/1000)}s)`);
   console.log(`🔧 [AUTO-TRIGGER] Delay compensation: -${ESTIMATED_EXECUTION_DELAY}ms applied`);
   
   if (timeUntil > 0 && timeUntil < 24 * 60 * 60 * 1000) {
    // HIGH-PRECISION TRIGGER SYSTEM
    timeoutId = setTimeout(() => {
     const triggerStart = performance.now();
      console.log("🚀 [AUTO-TRIGGER] EXECUTING AT 8:30 AM SHARP!");
     
     if (autoTriggerEnabled && precomputedPayload && precomputedPayload1 && isLoggedIn) {
      // IMMEDIATE EXECUTION - No React state updates before trigger
      console.log("🎾 [AUTO-TRIGGER] Triggering handleBookBoth...");
      
      // Trigger booking immediately without state update delay
      handleBookBoth().then(() => {
       const triggerEnd = performance.now();
       const actualDelay = triggerEnd - triggerStart;
       console.log(`⚡ [AUTO-TRIGGER] Execution completed in ${actualDelay.toFixed(2)}ms`);
       setAutoTriggerStatus(`🚀 AUTO-BOOKING EXECUTED! (${actualDelay.toFixed(2)}ms delay)`);
      }).catch((error) => {
       console.error("❌ [AUTO-TRIGGER] Booking failed:", error);
       setAutoTriggerStatus("❌ Auto-booking failed - see console");
      });
     } else {
      console.log("❌ [AUTO-TRIGGER] Failed: System not ready");
      setAutoTriggerStatus("❌ Auto-trigger failed - system not ready");
     }
    }, timeUntil);
   }
  };

  if (autoTriggerEnabled && precomputedPayload && precomputedPayload1) {
   console.log("🔧 [AUTO-TRIGGER] System activated");
   
   // Update countdown every second
   intervalId = setInterval(updateCountdown, 1000);
   updateCountdown(); // Initial call
   
   // Schedule the precise 8:30 AM trigger
   scheduleAutomaticBooking();
  } else {
   setTimeUntil830("");
   setAutoTriggerStatus("");
  }

  return () => {
   if (intervalId) clearInterval(intervalId);
   if (timeoutId) clearTimeout(timeoutId);
  };
 }, [autoTriggerEnabled, precomputedPayload, precomputedPayload1, isLoggedIn, handleBookBoth]);

 const handleLogout = () => {
  // Cancel any ongoing requests before logout
  if (bookingController6) {
   bookingController6.abort();
   setBookingController6(null);
  }
  
  if (bookingController1) {
   bookingController1.abort();
   setBookingController1(null);
  }
  
  logout();
  setBookingResult6(null);
  setBookingResult1(null);
  setBookingBothResult(null);
  setIsBookingBoth(false);
  setAutoTriggerEnabled(false);
  setTimeUntil830("");
  setAutoTriggerStatus("");
  // logout() already handles redirect with page refresh
 };

 if (isLoading) {
  return (
   <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
     <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
     <p>Loading...</p>
    </div>
   </div>
  );
 }

 if (!isLoggedIn) {
  return (
   <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
     <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
     <p>Redirecting to login...</p>
    </div>
   </div>
  );
 }

 return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)' }}>
   <div className="max-w-4xl mx-auto pt-8">
    {/* Header */}
    <div className="flex justify-between items-center flex-col lg:flex-row gap-4 lg:gap-0">
     <div className="flex space-x-2 w-full justify-between">
      {/* <Button
              onClick={() => router.push("/utilities")}
              className="text-white font-semibold py-4 text-sm text-white"
            >
              <LayoutList className="w-4 h-4 mr-2" />
              Dashboard
            </Button> */}
      <div className="flex items-center gap-2">
       <UserRoundCheck className="w-8 h-8" style={{ color: '#3B7097' }} />
       <p className="text-xl font-bold" style={{ color: '#3B7097' }}>
        {userData?.data?.fullName || "User"}!
       </p>
      </div>
      <Button
        onClick={handleLogout}
        variant="outline"
        className="text-white border-2"
        style={{ 
          backgroundColor: '#3B7097', 
          borderColor: '#3B7097',
          color: 'white'
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0';
          (e.target as HTMLButtonElement).style.borderColor = '#75BDE0';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097';
          (e.target as HTMLButtonElement).style.borderColor = '#3B7097';
        }}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
     </div>
    </div>
    <CardDescription className="mb-4 mt-2">
     Click on the buttons below to book tennis courts.
    </CardDescription>
    
    {/* Book Both Courts Button - Prominent placement */}
    <div className="mb-6">
     <Card className="shadow-lg border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
      <CardHeader className="text-center p-4">
       <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#FF9800' }}>
        <Calendar className="w-8 h-8 text-white" />
       </div>
       <CardTitle className="text-xl font-bold text-gray-800">Book Both Courts</CardTitle>
       <CardDescription className="text-sm text-gray-600">S1.01 + S1.02 auto booking!</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 px-6 py-4">
       {/* Auto-trigger status display */}
       {autoTriggerEnabled && (
        <Alert className="border-blue-200 bg-blue-50">
         <AlertDescription className="text-blue-800">
          <div className="text-sm font-medium">{autoTriggerStatus}</div>
          {timeUntil830 && (
           <div className="text-xs mt-1">
            ⏰ Time until 8:30 AM: {timeUntil830}
           </div>
          )}
         </AlertDescription>
        </Alert>
       )}

       {bookingBothResult && (
        <Alert
         className={
          bookingBothResult.success
           ? "border-green-200 bg-green-50"
           : "border-red-200 bg-red-50"
         }
        >
         <AlertDescription
          className={bookingBothResult.success ? "text-green-800" : "text-red-800"}
         >
          <div className="text-sm font-medium">{bookingBothResult.message}</div>
         </AlertDescription>
        </Alert>
       )}
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 mt-4">
       <Button
        onClick={handleBookBoth}
        disabled={isBookingBoth || isBooking1 || isBooking6 || !isLoggedIn}
        className="w-full text-white font-bold py-6 text-base rounded-lg transition-all duration-200 shadow-lg"
        style={{ backgroundColor: '#FF9800' }}
        onMouseEnter={(e) => {
         if (!isBookingBoth && !isBooking1 && !isBooking6) {
          (e.target as HTMLButtonElement).style.backgroundColor = '#FFB74D';
         }
        }}
        onMouseLeave={(e) => {
         if (!isBookingBoth && !isBooking1 && !isBooking6) {
          (e.target as HTMLButtonElement).style.backgroundColor = '#FF9800';
         }
        }}
        size="lg"
       >
        {isBookingBoth ? (
         <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Booking Both Courts...</span>
         </>
        ) : (
         <>
          <Calendar className="w-4 h-4 mr-2" />
          <span>Book Both Courts (S1.01 + S1.02)</span>
         </>
        )}
       </Button>

       {/* Auto-trigger toggle button */}
       <Button
        onClick={() => setAutoTriggerEnabled(!autoTriggerEnabled)}
        disabled={!isLoggedIn || !precomputedPayload || !precomputedPayload1}
        className={`w-full text-white font-semibold py-4 text-sm rounded-lg transition-all duration-200 ${
         autoTriggerEnabled 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        size="lg"
        style={{ backgroundColor: '#3B7097' }}
       >
        {autoTriggerEnabled ? (
         <>
          <span>Disable Auto-Booking (8:30 AM)</span>
         </>
        ) : (
         <>
          <span>Enable Auto-Booking (8:30 AM)</span>
         </>
        )}
       </Button>
       </div>
      </CardContent>
     </Card>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
     {/* First booking card - BOOKING_TARGET_1 (Court S1.01) */}
     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: '#4CAF50' }}>
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.01</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       {bookingResult1 && (
        <Alert
         className={
          bookingResult1.success
           ? "border-green-200 bg-green-50"
           : "border-red-200 bg-red-50"
         }
        >
         <AlertDescription
          className={bookingResult1.success ? "text-green-800" : "text-red-800"}
         >
          <div className="text-xs">{bookingResult1.message}</div>
         </AlertDescription>
        </Alert>
       )}

       <Button
        onClick={handleBooking1}
        disabled={isBooking1 || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg transition-all duration-200"
        style={{ backgroundColor: '#4CAF50' }}
        onMouseEnter={(e) => {
         if (!isBooking1) {
          (e.target as HTMLButtonElement).style.backgroundColor = '#66BB6A';
         }
        }}
        onMouseLeave={(e) => {
         if (!isBooking1) {
          (e.target as HTMLButtonElement).style.backgroundColor = '#4CAF50';
         }
        }}
        size="default"
       >
        {isBooking1 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          <span className="text-xs">Booking...</span>
         </>
        ) : (
         <>
          <Calendar className="w-3 h-3 mr-1" />
          <span>Court 1</span>
         </>
        )}
       </Button>
      </CardContent>
     </Card>

     {/* Sixth booking card - Testing tennis-booking-reverse */}
     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: '#75BDE0' }}>
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       {bookingResult6 && (
        <Alert
         className={
          bookingResult6.success
           ? "border-green-200 bg-green-50"
           : "border-red-200 bg-red-50"
         }
        >
         <AlertDescription
          className={bookingResult6.success ? "text-green-800" : "text-red-800"}
         >
          <div className="text-xs">{bookingResult6.message}</div>
         </AlertDescription>
        </Alert>
       )}

       <Button
        onClick={handleBooking6}
        disabled={isBooking6 || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg transition-all duration-200"
        style={{ backgroundColor: '#3B7097' }}
        onMouseEnter={(e) => {
         if (!isBooking6) {
          (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0';
         }
        }}
        onMouseLeave={(e) => {
         if (!isBooking6) {
          (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097';
         }
        }}
        size="default"
       >
        {isBooking6 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          <span className="text-xs">Booking...</span>
         </>
        ) : (
         <>
          <Calendar className="w-3 h-3 mr-1" />
          <span>Court 2</span>
         </>
        )}
       </Button>
      </CardContent>
     </Card>
    </div>
   </div>
  </div>
 );
}
