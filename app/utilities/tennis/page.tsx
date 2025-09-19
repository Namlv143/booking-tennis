"use client";

import { useState, useEffect } from "react";
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

export default function TennisBookingPage() {
 const [isBooking, setIsBooking] = useState(false);
 const [bookingResult, setBookingResult] = useState<{
  success: boolean;
  message: string;
 } | null>(null);

 const [isBooking2, setIsBooking2] = useState(false);
 const [bookingResult2, setBookingResult2] = useState<{
  success: boolean;
  message: string;
 } | null>(null);

 const [isBooking3, setIsBooking3] = useState(false)
 const [bookingResult3, setBookingResult3] = useState<{
   success: boolean
   message: string
 } | null>(null)

 const [isBooking4, setIsBooking4] = useState(false);
 const [bookingResult4, setBookingResult4] = useState<{
  success: boolean;
  message: string;
 } | null>(null);

 const [isBooking5, setIsBooking5] = useState(false);
 const [bookingResult5, setBookingResult5] = useState<{
  success: boolean;
  message: string;
 } | null>(null);

 const [isBooking6, setIsBooking6] = useState(false);
 const [bookingResult6, setBookingResult6] = useState<{
  success: boolean;
  message: string;
 } | null>(null);

 const router = useRouter();

 // Use context for user state
 const { isLoggedIn, currentToken, userData, isLoading, logout } = useUser();

 // Redirect if not logged in
 useEffect(() => {
  if (!isLoading && !isLoggedIn) {
   router.push("/login");
  }
 }, [isLoading, isLoggedIn, router]);

 // Reusable booking function that maintains the same logic
 const handleBookingRequest = async (
  bookingParams: {
   placeId: number;
   placeUtilityId: number;
   timeConstraintId: number;
  },
  setBookingState: (state: { isBooking: boolean; result: any }) => void
 ) => {
  if (!currentToken) {
   setBookingState({
    isBooking: false,
    result: {
     success: false,
     message: "Please login first to book tennis courts.",
    },
   });
   return;
  }

  setBookingState({ isBooking: true, result: null });

  try {
   const response = await fetch("/api/tennis-booking", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     ...bookingParams,
     jwtToken: currentToken,
    }),
   });

   const result = await response.json();

   if (result?.data?.transactionId || result?.data?.userId) {
    setBookingState({
     isBooking: false,
     result: {
      success: true,
      message: "Tennis court booking completed successfully! 🎾",
     },
    });
   } else {
    setBookingState({
     isBooking: false,
     result: {
      success: false,
      message: result.message || "Booking failed. Please try again.",
     },
    });
   }
  } catch (error) {
   setBookingState({
    isBooking: false,
    result: {
     success: false,
     message: "Network error. Please check your connection and try again.",
    },
   });
  }
 };

 const handleBooking = () =>
  handleBookingRequest(
   { placeId: 801, placeUtilityId: 625, timeConstraintId: 575 },
   ({ isBooking, result }) => {
    setIsBooking(isBooking);
    setBookingResult(result);
   }
  );

 const handleBooking2 = () =>
  handleBookingRequest(
   { placeId: 802, placeUtilityId: 626, timeConstraintId: 575 },
   ({ isBooking, result }) => {
    setIsBooking2(isBooking);
    setBookingResult2(result);
   }
  );

 const handleBooking3 = async () => {
   if (!currentToken) {
     setBookingResult3({
       success: false,
       message: "Please login first to book tennis courts.",
     })
     return
   }

   setIsBooking3(true)
   setBookingResult3(null)

   try {
     const response = await fetch("/api/tennis-booking-test", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         jwtToken: currentToken
       }),
     })

     const result = await response.json()
     console.log("🧪 [CARD 3] Dynamic booking result:", result)

     if (result?.data?.transactionId || result?.data?.userId) {
       const discoveredParams = result.discoveredParams
       const message = discoveredParams
         ? `Tennis court booking completed successfully! 🎾 (Discovered: Place ${discoveredParams.placeId}, Time ${discoveredParams.timeConstraintId})`
         : "Tennis court booking completed successfully! 🎾"

       setBookingResult3({
         success: true,
         message: message,
       })
     } else {
       setBookingResult3({
         success: false,
         message: result.message || "Booking failed. Please try again.",
       })
     }
   } catch (error) {
     console.log("🧪 [CARD 3] Booking error:", error)
     setBookingResult3({
       success: false,
       message: "Network error. Please check your connection and try again.",
     })
   } finally {
     setIsBooking3(false)
   }
 }

 const handleBooking4 = () =>
  handleBookingRequest(
   { placeId: 801, placeUtilityId: 625, timeConstraintId: 576 },
   ({ isBooking, result }) => {
    setIsBooking4(isBooking);
    setBookingResult4(result);
   }
  );

 const handleBooking5 = () =>
  handleBookingRequest(
   { placeId: 802, placeUtilityId: 625, timeConstraintId: 576 },
   ({ isBooking, result }) => {
    setIsBooking5(isBooking);
    setBookingResult5(result);
   }
  );

 const handleBooking6 = async () => {
  if (!currentToken) {
   setBookingResult6({
    success: false,
    message: "Please login first to book tennis courts.",
   });
   return;
  }

  setIsBooking6(true);
  setBookingResult6(null);

  try {
   console.log("🧪 [CARD 6] Testing tennis-booking-reverse...");
   const response = await fetch("/api/tennis-booking-reverse", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     jwtToken: currentToken,
    }),
   });

   const result = await response.json();
   console.log("🧪 [CARD 6] Reverse booking result:", result);

   if (result?.data?.transactionId || result?.data?.userId) {
    setBookingResult6({
     success: true,
     message:
      "Tennis court reverse booking completed successfully! 🎾 (Hardcoded params + cookies)",
    });
   } else {
    setBookingResult6({
     success: false,
     message: result.message || "Reverse booking failed. Please try again.",
    });
   }
  } catch (error) {
   console.log("🧪 [CARD 6] Reverse booking error:", error);
   setBookingResult6({
    success: false,
    message: "Network error. Please check your connection and try again.",
   });
  } finally {
   setIsBooking6(false);
  }
 };

 const handleLogout = () => {
  logout();
  setBookingResult(null);
  setBookingResult2(null);
  // setBookingResult3(null)
  setBookingResult4(null);
  setBookingResult5(null);
  setBookingResult6(null);
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
     {/* First booking card (original) */}
     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: '#75BDE0' }}>
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.01</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       {bookingResult && (
        <Alert
         className={
          bookingResult.success
           ? "border-green-200 bg-green-50"
           : "border-red-200 bg-red-50"
         }
        >
         <AlertDescription
          className={bookingResult.success ? "text-green-800" : "text-red-800"}
         >
          <div className="text-xs">{bookingResult.message}</div>
         </AlertDescription>
        </Alert>
       )}

       <Button
        onClick={handleBooking}
        disabled={isBooking || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg"
        style={{ backgroundColor: '#3B7097' }}
        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0'}
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097'}
        size="default"
       >
        {isBooking ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Booking...
         </>
        ) : (
         "18h-20h"
        )}
       </Button>
      </CardContent>
     </Card>

     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: '#75BDE0' }}>
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       {bookingResult2 && (
        <Alert
         className={
          bookingResult2.success
           ? "border-green-200 bg-green-50"
           : "border-red-200 bg-red-50"
         }
        >
         <AlertDescription
          className={bookingResult2.success ? "text-green-800" : "text-red-800"}
         >
          <div className="text-xs">{bookingResult2.message}</div>
         </AlertDescription>
        </Alert>
       )}

       <Button
        onClick={handleBooking2}
        disabled={isBooking2 || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg"
        style={{ backgroundColor: '#3B7097' }}
        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0'}
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097'}
        size="default"
       >
        {isBooking2 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Booking...
         </>
        ) : (
         "18h-20h"
        )}
       </Button>
      </CardContent>
     </Card>

     {/* Third booking card */}
     <Card className="shadow-lg bg-white">
            <CardHeader className="text-center p-2">
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: '#75BDE0' }}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">Random</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 px-4 py-2">
              {bookingResult3 && (
                <Alert className={bookingResult3.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={bookingResult3.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{bookingResult3.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking3}
                disabled={isBooking3 || !isLoggedIn}
                className="w-full text-white font-semibold py-4 text-sm rounded-lg"
                style={{ backgroundColor: '#3B7097' }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097'}
                size="default"
              >
                {isBooking3 ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Booking...
                  </>
                ) : 'Random'}
              </Button>
            </CardContent>
          </Card>

     {/* Fourth booking card */}
     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: '#75BDE0' }}>
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.01</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       {bookingResult4 && (
        <Alert
         className={
          bookingResult4.success
           ? "border-green-200 bg-green-50"
           : "border-red-200 bg-red-50"
         }
        >
         <AlertDescription
          className={bookingResult4.success ? "text-green-800" : "text-red-800"}
         >
          <div className="text-xs">{bookingResult4.message}</div>
         </AlertDescription>
        </Alert>
       )}

       <Button
        onClick={handleBooking4}
        disabled={isBooking4 || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg"
        style={{ backgroundColor: '#3B7097' }}
        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0'}
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097'}
        size="default"
       >
        {isBooking4 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Booking...
         </>
        ) : (
         "20h-21h"
        )}
       </Button>
      </CardContent>
     </Card>

     {/* Fifth booking card */}
     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: '#75BDE0' }}>
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       {bookingResult5 && (
        <Alert
         className={
          bookingResult5.success
           ? "border-green-200 bg-green-50"
           : "border-red-200 bg-red-50"
         }
        >
         <AlertDescription
          className={bookingResult5.success ? "text-green-800" : "text-red-800"}
         >
          <div className="text-xs">{bookingResult5.message}</div>
         </AlertDescription>
        </Alert>
       )}

       <Button
        onClick={handleBooking5}
        disabled={isBooking5 || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg"
        style={{ backgroundColor: '#3B7097' }}
        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0'}
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097'}
        size="default"
       >
        {isBooking5 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Booking...
         </>
        ) : (
         "20h-21h"
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
       <CardTitle className="text-lg font-bold text-gray-800">Test</CardTitle>
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
        className="w-full text-white font-semibold py-4 text-sm rounded-lg"
        style={{ backgroundColor: '#3B7097' }}
        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0'}
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097'}
        size="default"
       >
        {isBooking6 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Testing...
         </>
        ) : (
         "Random"
        )}
       </Button>
      </CardContent>
     </Card>
    </div>
   </div>
  </div>
 );
}
