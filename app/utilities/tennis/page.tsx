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


 const handleBooking6 = async () => {
  // if (!currentToken) {
  //  setBookingResult6({
  //   success: false,
  //   message: "Please login first to book tennis courts.",
  //  });
  //  return;
  // }

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
     "bookingTarget": {
      "placeId": 802,
      "placeUtilityId": 626,
      "timeConstraintId": 575,
      "classifyId": 118
    },
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
     message: JSON.stringify(result) || "Reverse booking failed. Please try again.",
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
  // setBookingResult3(null)
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
