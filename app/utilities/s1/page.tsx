"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dropdown } from "@/components/ui/dropdown";
import {
 Loader2,
 Calendar,
 LogOut,
 UserRoundCheck,
 Zap,
 Clock,
 Play,
 Pause,
 Settings,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCountDown } from "ahooks";

// Court booking options
const courtOptions = [
 {
  label: "Sân 1: 18h-20h",
  value: {
   placeId: 801,
   placeUtilityId: 625,
   timeConstraintId: 575,
  },
 },
 {
  label: "Sân 2: 18h-20h",
  value: {
   placeId: 802,
   placeUtilityId: 626,
   timeConstraintId: 575,
  },
 },
 {
  label: "Sân 1: 20h-21h",
  value: {
   placeId: 801,
   placeUtilityId: 625,
   timeConstraintId: 576,
   bookingHour: 20,
  },
 },
 {
  label: "Sân 2: 20h-21h",
  value: {
   placeId: 802,
   placeUtilityId: 626,
   timeConstraintId: 576,
   bookingHour: 20,
  },
 },
 {
  label: "Sân 1: 08h-10h",
  value: {
   placeId: 801,
   placeUtilityId: 625,
   timeConstraintId: 570,
   bookingHour: 8,
  },
 },
 {
  label: "Sân 2: 08h-10h",
  value: {
   placeId: 802,
   placeUtilityId: 626,
   timeConstraintId: 570,
   bookingHour: 8,
  },
 },
 {
  label: "Sân 1: 10h-12h",
  value: {
   placeId: 801,
   placeUtilityId: 625,
   timeConstraintId: 571,
   bookingHour: 10,
  },
 },
 {
  label: "Sân 2: 10h-12h",
  value: {
   placeId: 802,
   placeUtilityId: 626,
   timeConstraintId: 571,
   bookingHour: 10,
  },
 },
];

export default function TennisBookingPage() {
 // State for UI
 const [selectedOption, setSelectedOption] = useState(courtOptions[0]); // Default to first option
 const [responseTime, setResponseTime] = useState<number | null>(null);
 const router = useRouter();
 const [targetDate, setTargetDate] = useState<number>();

 const [countdown] = useCountDown({
  targetDate,
  onEnd: () => {
   handleApiBooking();
  },
 });
 // Use context for user state
 const { isLoggedIn, currentToken, userData, isLoading, logout } = useUser();

 // Booking state (replacing useTennisBooking hook)
 const [bookingState, setBookingState] = useState({
  loading: false,
  success: false,
  error: null as string | null,
 });

 // Utility API state
 const [utilityState, setUtilityState] = useState({
  loading: false,
  data: null as any,
  error: null as string | null,
 });

 const handleApiBooking = useCallback(async () => {
  // Reset previous booking state
  setBookingState({ loading: true, success: false, error: null });
  setResponseTime(null);

  const startTime = performance.now(); // Start timing

  try {
   // Use server-side API route booking
   if (!currentToken) {
    throw new Error("No authentication token available");
   }

   const response = await fetch("/api/tennis-booking", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     token: currentToken,
     placeId: selectedOption.value.placeId,
     placeUtilityId: selectedOption.value.placeUtilityId,
     timeConstraintId: selectedOption.value.timeConstraintId,
     bookingHour: selectedOption.value?.bookingHour || 18,
    }),
   });

   const data = await response.json();

   const endTime = performance.now();
   const duration = Math.round(endTime - startTime);
   setResponseTime(duration);

   if (data.success) {
    setBookingState({ loading: false, success: true, error: null });
   } else {
    setBookingState({
     loading: false,
     success: false,
     error: data.error || "Booking failed",
    });
   }
  } catch (err) {
   const endTime = performance.now();
   const duration = Math.round(endTime - startTime);
   setResponseTime(duration);

   setBookingState({
    loading: false,
    success: false,
    error: err instanceof Error ? err.message : "Booking failed",
   });
  }
 }, [currentToken, selectedOption.value]);

 // Redirect if not logged in
 useEffect(() => {
  if (!isLoading && !isLoggedIn) {
   router.push("/login");
  }
 }, [isLoading, isLoggedIn, router]);

 const handleLogout = () => {
  logout();
  setBookingState({ loading: false, success: false, error: null }); // Reset booking state
 };


 const handleUtilityApi = useCallback(async () => {
  // Reset previous utility state
  setUtilityState({ loading: true, data: null, error: null });

  try {
   if (!currentToken) {
    throw new Error("No authentication token available");
   }

   const response = await fetch(`/api/utility?token=${encodeURIComponent(currentToken)}`, {
    method: "GET",
    headers: {
     "Content-Type": "application/json",
    },
   });

   const data = await response.json();

   if (data.error) {
    setUtilityState({
     loading: false,
     data: null,
     error: data.error || "Utility API failed",
    });
   } else {
    setUtilityState({
     loading: false,
     data: data.data,
     error: null,
    });
   }
  } catch (err) {
   setUtilityState({
    loading: false,
    data: null,
    error: err instanceof Error ? err.message : "Utility API failed",
   });
  }
 }, [currentToken]);

 if (isLoading) {
  return (
   <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)" }}
   >
    <div className="text-center">
     <Loader2
      className="w-8 h-8 animate-spin mx-auto mb-4"
      style={{ color: "#3B7097" }}
     />
     <p style={{ color: "#3B7097" }}>Loading...</p>
    </div>
   </div>
  );
 }

 if (!isLoggedIn) {
  return (
   <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)" }}
   >
    <div className="text-center">
     <Loader2
      className="w-8 h-8 animate-spin mx-auto mb-4"
      style={{ color: "#3B7097" }}
     />
     <p style={{ color: "#3B7097" }}>Redirecting to login...</p>
    </div>
   </div>
  );
 }

 return (
  <div
   className="min-h-screen p-4"
   style={{ background: "linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)" }}
  >
   <div className="max-w-4xl mx-auto pt-8">
    {/* Header with Logout */}
    <div className="flex justify-between items-start mb-8">
    <Button
     onClick={handleUtilityApi}
     disabled={utilityState.loading}
     size="lg"
     variant="outline"
     className="text-white border-2 cursor-pointer"
     style={{
      backgroundColor: "#3B7097",
      borderColor: "#3B7097",
      color: "white",
     }}
     onMouseEnter={(e) => {
      (e.target as HTMLButtonElement).style.backgroundColor = "#3B7097";
      (e.target as HTMLButtonElement).style.borderColor = "#3B7097";
     }}
     onMouseLeave={(e) => {
      (e.target as HTMLButtonElement).style.backgroundColor = "#75BDE0";
      (e.target as HTMLButtonElement).style.borderColor = "#75BDE0";
     }}
    >
     {utilityState.loading ? (
      <>
       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
       Loading Utilities...
      </>
     ) : (
      <>
       <Settings className="w-4 h-4 mr-2" />
       Get Utilities
      </>
     )}
    </Button>
     <Button
      onClick={handleLogout}
      variant="outline"
      className="text-white border-2 cursor-pointer"
      style={{
       backgroundColor: "#3B7097",
       borderColor: "#3B7097",
       color: "white",
      }}
      onMouseEnter={(e) => {
       (e.target as HTMLButtonElement).style.backgroundColor = "#75BDE0";
       (e.target as HTMLButtonElement).style.borderColor = "#75BDE0";
      }}
      onMouseLeave={(e) => {
       (e.target as HTMLButtonElement).style.backgroundColor = "#3B7097";
       (e.target as HTMLButtonElement).style.borderColor = "#3B7097";
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
        <UserRoundCheck className="w-5 h-5" style={{ color: "#3B7097" }} />
        <h1 className="font-semibold text-left" style={{ color: "#3B7097" }}>
         ✅ Booking Successful
        </h1>
       </div>
       {responseTime && (
        <p className="text-sm text-gray-600">
         <strong>Response time:</strong> {responseTime}ms (Server-side)
        </p>
       )}
      </CardContent>
     </Card>
    )}
    {/* Court Selection */}
    {utilityState.data && (
     <h1 className="font-semibold text-left" style={{ color: "#3B7097" }}>
     Tenis Booking started
    </h1>
    )}
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
      </div>
     </CardContent>
    </Card>

    {/* Auto-Booking Countdown */}
    <Card className="shadow-lg mb-6">
     <CardHeader className="text-center">
      <CardTitle className="text-lg font-bold text-gray-800 text-left">
       Auto-Booking Timer
      </CardTitle>
     </CardHeader>
     <CardContent className="flex flex-col gap-2">
      <Button
       size="lg"
       variant="outline"
       style={{
        backgroundColor: "#75BDE0",
        borderColor: "#75BDE0",
        color: "white",
       }}
       className="w-full text-white border-2 cursor-pointer"
       onClick={() => {
        const now = new Date();
        now.setHours(8, 30, 0, 0);
        setTargetDate(now.getTime());
       }}
      >
       {countdown === 0
        ? "Start Interval"
        : `Reset After ${Math.round(countdown / 1000)}s`}
      </Button>
      <Button
       variant="outline"
       size="lg"
       style={{
        backgroundColor: "#75BDE0",
        borderColor: "#75BDE0",
        color: "white",
       }}
       className="w-full text-white border-2 cursor-pointer"
       onClick={() => {
        setTargetDate(undefined);
       }}
      >
       Stop
      </Button>
     </CardContent>
    </Card>    

    {/* Client-Side Booking Button */}
    <Button
     onClick={handleApiBooking}
     disabled={bookingState.loading}
     className="w-full text-white border-2 cursor-pointer"
     size="lg"
     variant="outline"
     style={{
      backgroundColor: "#75BDE0",
      borderColor: "#75BDE0",
      color: "white",
     }}
     onMouseEnter={(e) => {
      (e.target as HTMLButtonElement).style.backgroundColor = "#3B7097";
      (e.target as HTMLButtonElement).style.borderColor = "#3B7097";
     }}
     onMouseLeave={(e) => {
      (e.target as HTMLButtonElement).style.backgroundColor = "#75BDE0";
      (e.target as HTMLButtonElement).style.borderColor = "#75BDE0";
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

    {/* Utility API Error Display */}
    {utilityState.error && (
     <Card className="shadow-lg mb-6 mt-3">
      <CardContent className="p-6">
       <Alert className="border-orange-200 bg-orange-50">
        <AlertDescription className="text-orange-800">
         <strong>Utility API Error:</strong> {utilityState.error}
        </AlertDescription>
       </Alert>
      </CardContent>
     </Card>
    )}

    {/* Booking Error Display */}
    {bookingState.error && (
     <Card className="shadow-lg mb-6 mt-3">
      <CardContent className="p-6">
       <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
         {bookingState.error}
        </AlertDescription>
       </Alert>
      </CardContent>
     </Card>
    )}
   </div>
  </div>
 );
}
