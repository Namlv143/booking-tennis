"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dropdown } from "@/components/ui/dropdown";
import { Loader2, Calendar, LogOut, UserRoundCheck, Zap, Clock, Play, Pause } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useTennisBooking } from "@/hooks/useTennisBooking";

// Court booking options
const courtOptions = [
  {
    label: 'Sân 1: 18h-20h',
    value: {
      placeId: 801,
      placeUtilityId: 625,
      timeConstraintId: 575,
    }
  },
  {
    label: 'Sân 2: 18h-20h',
    value: {
      placeId: 802,
      placeUtilityId: 626,
      timeConstraintId: 575,
    }
  },
  {
    label: 'Sân 1: 20h-21h',
    value: {
      placeId: 801,
      placeUtilityId: 625,
      timeConstraintId: 576,
    }
  },
  {
    label: 'Sân 2: 20h-21h',
    value: {
      placeId: 802,
      placeUtilityId: 626,
      timeConstraintId: 576,
    }
  },
  {
    label: 'Sân 1: 08h-10h',
    value: {
      placeId: 801,
      placeUtilityId: 625,
      timeConstraintId: 570,
    }
  },
  {
    label: 'Sân 2: 08h-10h',
    value: {
      placeId: 802,
      placeUtilityId: 626,
      timeConstraintId: 570,
    }
  },
  {
    label: 'Sân 1: 10h-12h',
    value: {
      placeId: 801,
      placeUtilityId: 625,
      timeConstraintId: 571,
    }
  }
];

export default function TennisBookingPage() {
 // State for UI
 const [selectedOption, setSelectedOption] = useState(courtOptions[0]); // Default to first option
 const [responseTime, setResponseTime] = useState<number | null>(null);
 const router = useRouter();

 // Countdown state
 const [countdownEnabled, setCountdownEnabled] = useState(false);
 const [timeRemaining, setTimeRemaining] = useState<string>("");
 const [isTargetTime, setIsTargetTime] = useState(false);
 const intervalRef = useRef<NodeJS.Timeout | null>(null);

 // Use context for user state
 const { isLoggedIn, currentToken, userData, isLoading, logout } = useUser();

 // Use client-side tennis booking (Vietnam IP automatically!)
 const { bookingState, bookTennis, reset } = useTennisBooking();

 // Calculate time remaining until 15:55:00
 const calculateTimeRemaining = () => {
   const now = new Date();
   const target = new Date();
   target.setHours(8, 30, 0, 0);
   
   // If target time has passed today, set for tomorrow
   if (now > target) {
     target.setDate(target.getDate() + 1);
   }
   
   const diff = target.getTime() - now.getTime();
   
   if (diff <= 0) {
     return { timeString: "00:00:00", isTime: true };
   }
   
   // More accurate calculation - add 500ms for proper rounding to avoid fast countdown
   const adjustedDiff = diff + 500;
   const hours = Math.floor(adjustedDiff / (1000 * 60 * 60));
   const minutes = Math.floor((adjustedDiff % (1000 * 60 * 60)) / (1000 * 60));
   const seconds = Math.floor((adjustedDiff % (1000 * 60)) / 1000);
   
   return {
     timeString: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
     isTime: diff <= 1000 // Within 1 second of target
   };
 };

 const handleApiBooking = useCallback(async () => {
  reset(); // Reset previous booking state
  setResponseTime(null);

  const startTime = performance.now(); // Start timing

  try {    
    // Use client-side booking with user's Vietnam IP
    if (!currentToken) {
      throw new Error('No authentication token available');
    }
    await bookTennis(currentToken, selectedOption.value);
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    setResponseTime(duration);

  } catch (err) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    setResponseTime(duration);
  }
 }, [currentToken, selectedOption.value, bookTennis, reset, setResponseTime]);

 // Redirect if not logged in
 useEffect(() => {
  if (!isLoading && !isLoggedIn) {
   router.push("/login");
  }
 }, [isLoading, isLoggedIn, router]);

 // Countdown timer effect
 useEffect(() => {
   if (countdownEnabled) {
     // Immediately update on start
     const updateCountdown = () => {
       const { timeString, isTime } = calculateTimeRemaining();
       setTimeRemaining(timeString);
       setIsTargetTime(isTime);
       
       // Auto-trigger booking when target time is reached
       if (isTime && !bookingState.loading) {
         handleApiBooking();
         setCountdownEnabled(false); // Disable after triggering
       }
     };
     
     // Run immediately on start
     updateCountdown();
     
     // Use 1000ms interval to sync with clock seconds and prevent drift
     intervalRef.current = setInterval(updateCountdown, 1000);
   } else {
     if (intervalRef.current) {
       clearInterval(intervalRef.current);
       intervalRef.current = null;
     }
   }

   return () => {
     if (intervalRef.current) {
       clearInterval(intervalRef.current);
       intervalRef.current = null;
     }
   };
 }, [countdownEnabled, bookingState.loading, handleApiBooking]);

 const handleLogout = () => {
  logout();
  reset(); // Reset booking state
  setCountdownEnabled(false); // Stop countdown on logout
 };

 const toggleCountdown = () => {
   if (!countdownEnabled) {
     // Starting countdown - useEffect will handle immediate update with fresh time
     setCountdownEnabled(true);
   } else {
     // Stopping countdown
     setCountdownEnabled(false);
     setIsTargetTime(false);
   }
 };

 if (isLoading) {
  return (
   <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)' }}>
    <div className="text-center">
     <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#3B7097' }} />
     <p style={{ color: '#3B7097' }}>Loading...</p>
    </div>
   </div>
  );
 }

 if (!isLoggedIn) {
  return (
   <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)' }}>
    <div className="text-center">
     <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#3B7097' }} />
     <p style={{ color: '#3B7097' }}>Redirecting to login...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)' }}>
   <div className="max-w-4xl mx-auto pt-8">
    {/* Header with Logout */}
    <div className="flex justify-between items-start mb-8">
     
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
    {/* Booking Result */}
    {bookingState.success && (
      <Card className="shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <UserRoundCheck className="w-5 h-5" style={{ color: '#3B7097' }} />
            <h1 className="font-semibold text-left" style={{ color: '#3B7097' }}>
              ✅ Booking Successful (Vietnam IP)
            </h1>
          </div>
          {responseTime && (
            <p className="text-sm text-gray-600">
              <strong>Response time:</strong> {responseTime}ms (Client-side)
            </p>
          )}
          
        </CardContent>
      </Card>
    )}
    {/* Court Selection */}
    <Card className="shadow-lg mb-6">
     <CardHeader className="text-center">
     <CardTitle className="text-lg font-bold text-gray-800 text-left">
       Court & Time Selection
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="space-y-4">
       <div>
        <Dropdown
         options={courtOptions}
         value={selectedOption.value}
         onChange={(option) => setSelectedOption(option)}
         placeholder="Select court and time..."
         className="w-full"
        />
       </div>
       {/* <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm"><strong>Place ID:</strong> {selectedOption.value.placeId}</p>
        <p className="text-sm"><strong>Place Utility ID:</strong> {selectedOption.value.placeUtilityId}</p>
        <p className="text-sm"><strong>Time Constraint ID:</strong> {selectedOption.value.timeConstraintId}</p>
       </div> */}
      </div>
     </CardContent>
    </Card>

    {/* Auto-Booking Countdown */}
    <Card className="shadow-lg mb-6">
     <CardHeader className="text-center">
      <CardTitle className="text-lg font-bold text-gray-800 text-left">
        Auto-Booking Timer (15:55:00)
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="space-y-4">
       <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
         <Clock className="w-5 h-5" style={{ color: '#3B7097' }} />
         <span className="font-mono text-lg font-bold" style={{ color: isTargetTime ? '#DC2626' : '#3B7097' }}>
          {countdownEnabled ? timeRemaining : calculateTimeRemaining().timeString}
         </span>
        </div>
        <Button 
         onClick={toggleCountdown}
         variant="outline"
         className={`${countdownEnabled ? 'bg-red-100 border-red-300 text-red-700' : 'bg-green-100 border-green-300 text-green-700'}`}
        >
         {countdownEnabled ? (
          <>
           <Pause className="w-4 h-4 mr-2" />
           Stop Countdown
          </>
         ) : (
          <>
           <Play className="w-4 h-4 mr-2" />
           Start Countdown
          </>
         )}
        </Button>
       </div>
       {countdownEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
         <p className="text-sm text-yellow-800">
          🚀 <strong>Auto-booking is ACTIVE!</strong> The booking will be triggered automatically when the countdown reaches 15:55:00.
         </p>
        </div>
       )}
       {isTargetTime && countdownEnabled && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
         <p className="text-sm text-red-800 font-bold">
          ⚡ TRIGGERING BOOKING NOW!
         </p>
        </div>
       )}
      </div>
     </CardContent>
    </Card>

    {/* Client-Side Booking Button */}
    <Button 
     onClick={handleApiBooking} 
     disabled={bookingState.loading}
     className="w-full text-white border-2"
     size="lg"
     variant="outline"
     style={{ 
      backgroundColor: '#75BDE0', 
      borderColor: '#75BDE0',
      color: 'white'
     }}
     onMouseEnter={(e) => {
      (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097';
      (e.target as HTMLButtonElement).style.borderColor = '#3B7097';
     }}
     onMouseLeave={(e) => {
      (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0';
      (e.target as HTMLButtonElement).style.borderColor = '#75BDE0';
     }}
    >
     {bookingState.loading ? (
      <>
       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
       Booking...
      </>
     ) : (
      <>
       <Zap className="w-4 h-4 mr-2" />
       Book
      </>
     )}
    </Button>

    {/* Error Display */}
    {bookingState.error && (
     <Card className="shadow-lg mb-6 mt-3">
      <CardContent className="p-6">
       <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          ❌ {bookingState.error}
        </AlertDescription>
       </Alert>
      </CardContent>
     </Card>
    )}
   </div>
  </div>
 );
}
