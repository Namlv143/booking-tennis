"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Calendar, LogOut, UserRoundCheck, Zap } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

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
 const [isApiLoading, setIsApiLoading] = useState(false);
 const [result, setResult] = useState<any>(null);
 const [error, setError] = useState<string | null>(null);
 const [responseTime, setResponseTime] = useState<number | null>(null);
 const [selectedOption, setSelectedOption] = useState(courtOptions[0]); // Default to first option
 const router = useRouter();

 // Use context for user state
 const { isLoggedIn, currentToken, userData, isLoading, logout } = useUser();

 const handleApiBooking = async () => {
  setIsApiLoading(true);
  setError(null);
  setResult(null);
  setResponseTime(null);

  const startTime = performance.now(); // Start timing

  try {    
   const response = await fetch('/api/tennis-booking', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json'
    },
    body: JSON.stringify({
     bookingParams: {
      ...selectedOption.value,
      jwtToken: currentToken
     },
     
    })
   });

   const endTime = performance.now(); // End timing
   const duration = Math.round(endTime - startTime); // Calculate duration in ms
   setResponseTime(duration);

   const data = await response.json();
   if (!response.ok) {
    console.log("response", data)
    throw new Error(data.error);
   }

   setResult(data);

  } catch (err) {
   const endTime = performance.now(); // End timing even on error
   const duration = Math.round(endTime - startTime);
   setResponseTime(duration);
   setError(err instanceof Error ? err.message : "An error occurred during API booking");
  } finally {
   setIsApiLoading(false);
  }
 };

 // Redirect if not logged in
 useEffect(() => {
  if (!isLoading && !isLoggedIn) {
   router.push("/login");
  }
 }, [isLoading, isLoggedIn, router]);

 const handleLogout = () => {
  logout();
  setResult(null);
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
     <div className="flex-1 text-center">
      <h1 className="text-2xl font-semibold mb-2 text-left" style={{ color: '#3B7097' }}>Booking S1</h1>
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
    {/* API Result */}
    {result && (
      <Card className="shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <UserRoundCheck className="w-5 h-5" style={{ color: '#3B7097' }} />
            <h1 className="font-semibold text-left" style={{ color: '#3B7097' }}>Booking Successful</h1>
          </div>
          {responseTime && (
            <p className="text-sm text-gray-600">
              <strong>Response time:</strong> {responseTime / 1000}s
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

    {/* API Test Button */}
    <Button 
     onClick={handleApiBooking} 
     disabled={isApiLoading}
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
     {isApiLoading ? (
      <>
       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
       Confirming...
      </>
     ) : (
      <>
       <Zap className="w-4 h-4 mr-2" />
       Confirm
      </>
     )}
    </Button>

    {/* Error Display */}
    {error && (
     <Card className="shadow-lg mb-6 mt-3">
      <CardContent className="p-6">
       <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">{error}</AlertDescription>
       </Alert>
      </CardContent>
     </Card>
    )}
   </div>
  </div>
 );
}
