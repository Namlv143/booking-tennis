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
import { Loader2, Calendar, LogOut, UserRoundCheck } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const getBookingDate = (): number => {
 const now = Date.now();
 // Get current date and adjust to Vietnam time (UTC+7)
 const vietnamTime = new Date(now + 7 * 60 * 60 * 1000);

 // Get tomorrow's date
 const tomorrow = new Date(vietnamTime);
 tomorrow.setDate(tomorrow.getDate() + 1);

 // Set time to 8:30 AM specifically (original design)
 tomorrow.setHours(8, 30, 0, 0);

 return tomorrow.getTime();
};

const generateFromTime = (hour: number, daysToAdd: number): number => {
 const now = Date.now();
 const targetDate = new Date(now);
 targetDate.setDate(targetDate.getDate() + daysToAdd);
 targetDate.setHours(hour, 0, 0, 0);
 return targetDate.getTime();
};

// Pre-create TextEncoder instance to avoid recreation

export default function TennisBookingPage() {
 const [isBookingS1, setIsBookingS1] = useState(false);
 const [isBookingS2, setIsBookingS2] = useState(false);
 const [isBookingS3, setIsBookingS3] = useState(false);
 const [isBookingS4, setIsBookingS4] = useState(false);
 const [isBookingS5, setIsBookingS5] = useState(false);
 const [bookingResultS1, setBookingResultS1] = useState<any>(null);
 const [bookingResultS2, setBookingResultS2] = useState<any>(null);
 const [bookingResultS3, setBookingResultS3] = useState<any>(null);
 const [bookingResultS4, setBookingResultS4] = useState<any>(null);
 const [bookingResultS5, setBookingResultS5] = useState<any>(null);
 const router = useRouter();
 const bookingDate = getBookingDate();
 const fromTime = generateFromTime(18, 1);

 // Use context for user state
 const { isLoggedIn, currentToken, userData, isLoading, logout } = useUser();

 // Redirect if not logged in
 useEffect(() => {
  if (!isLoading && !isLoggedIn) {
   router.push("/login");
  }
 }, [isLoading, isLoggedIn, router]);

 const handleLogout = () => {
  logout();
  setBookingResultS1(null);
  setBookingResultS2(null);
  setBookingResultS3(null);
  setBookingResultS4(null);
  setBookingResultS5(null);
 };
 const handleBookingS1 = async () => {
  setIsBookingS1(true); // Bắt đầu loading, vô hiệu hóa nút
  setBookingResultS1(null);

  try {
   // Gọi đến API route của bạn bằng phương thức POST
   const response = await fetch("/api/tennis", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    cache: "no-store" as RequestCache,
    keepalive: true,
    body: JSON.stringify({
     jwtToken: currentToken,
     bookingDate,
     fromTime,
     bookingTarget: {
      placeId: 801,
      placeUtilityId: 625,
      timeConstraintId: 571,
      classifyId: 118,
     },
    }),
   });

   // Lấy kết quả JSON từ phản hồi
   const result = await response.json();
   console.log("result", JSON.stringify(result));
   // Nếu thành công
   setBookingResultS1(result);
  } catch (error) {
   // Nếu có lỗi trong quá trình gọi API
   setBookingResultS1(error);
  } finally {
   // Dù thành công hay thất bại, cũng dừng loading
   setIsBookingS1(false);
  }
 };

 const handleBookingS2 = async () => {
  setIsBookingS2(true);
  setBookingResultS2(null);

  try {
   const response = await fetch("/api/tennis", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    cache: "no-store" as RequestCache,
    keepalive: true,
    body: JSON.stringify({
     jwtToken: currentToken,
     bookingDate,
     fromTime,
     bookingTarget: {
      placeId: 801,
      placeUtilityId: 625,
      timeConstraintId: 575,
      classifyId: 118,
     },
    }),
   });

   const result = await response.json();
   console.log("result", JSON.stringify(result));
   setBookingResultS2(result);
  } catch (error) {
   setBookingResultS2(error);
  } finally {
   setIsBookingS2(false);
  }
 };

 const handleBookingS3 = async () => {
  setIsBookingS3(true);
  setBookingResultS3(null);

  try {
   const response = await fetch("/api/tennis", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    cache: "no-store" as RequestCache,
    keepalive: true,
    body: JSON.stringify({
     jwtToken: currentToken,
     bookingDate,
     fromTime,
     bookingTarget: {
      placeId: 802,
      placeUtilityId: 626,
      timeConstraintId: 575,
      classifyId: 118,
     },
    }),
   });

   const result = await response.json();
   console.log("result", JSON.stringify(result));
   setBookingResultS3(result);
  } catch (error) {
   setBookingResultS3(error);
  } finally {
   setIsBookingS3(false);
  }
 };

 const handleBookingS4 = async () => {
  setIsBookingS4(true);
  setBookingResultS4(null);

  try {
   const response = await fetch("/api/tennis", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    cache: "no-store" as RequestCache,
    keepalive: true,
    body: JSON.stringify({
     jwtToken: currentToken,
     bookingDate,
     fromTime,
     bookingTarget: {
      placeId: 801,
      placeUtilityId: 625,
      timeConstraintId: 576,
      classifyId: 118,
     },
    }),
   });

   const result = await response.json();
   console.log("result", JSON.stringify(result));
   setBookingResultS4(result);
  } catch (error) {
   setBookingResultS4(error);
  } finally {
   setIsBookingS4(false);
  }
 };

 const handleBookingS5 = async () => {
  setIsBookingS5(true);
  setBookingResultS5(null);

  try {
   const response = await fetch("/api/tennis", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    cache: "no-store" as RequestCache,
    keepalive: true,
    body: JSON.stringify({
     jwtToken: currentToken,
     bookingDate,
     fromTime,
     bookingTarget: {
      placeId: 802,
      placeUtilityId: 626,
      timeConstraintId: 576,
      classifyId: 118,
     },
    }),
   });

   const result = await response.json();
   console.log("result", JSON.stringify(result));
   setBookingResultS5(result);
  } catch (error) {
   setBookingResultS5(error);
  } finally {
   setIsBookingS5(false);
  }
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
  <div
   className="min-h-screen p-4"
   style={{ background: "linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)" }}
  >
   <div className="max-w-4xl mx-auto pt-8">
    {/* Header */}
    <div className="flex justify-between items-center flex-col lg:flex-row gap-4 lg:gap-0">
     <div className="flex space-x-2 w-full justify-between">
      <div className="flex items-center gap-2">
       <UserRoundCheck className="w-8 h-8" style={{ color: "#3B7097" }} />
       <p className="text-xl font-bold" style={{ color: "#3B7097" }}>
        {userData?.data?.fullName || "User"}!
       </p>
      </div>
      <Button
       onClick={handleLogout}
       variant="outline"
       className="text-white border-2"
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
    </div>
    <CardDescription className="mb-4 mt-2">
     Click on the buttons below to book tennis courts.
    </CardDescription>
     {bookingResultS1 && (
      <Alert
       className={
        bookingResultS1.success
         ? "border-green-200 bg-green-50 mt-2"
         : "border-red-200 bg-red-50 mt-2"
       }
       autoClose={true}
       onClose={() => setBookingResultS1(null)}
      >
       <AlertDescription
        className={bookingResultS1.success ? "text-green-800" : "text-red-800"}
       >
        <div className="text-xs">
         {bookingResultS1?.success
          ? "Booking successful"
          : bookingResultS1?.error?.message}
        </div>
       </AlertDescription>
      </Alert>
     )}
     {bookingResultS2 && (
      <Alert
       className={
        bookingResultS2.success
         ? "border-green-200 bg-green-50 mt-2"
         : "border-red-200 bg-red-50 mt-2"
       }
       autoClose={true}
       onClose={() => setBookingResultS2(null)}
      >
       <AlertDescription
        className={bookingResultS2.success ? "text-green-800" : "text-red-800"}
       >
        <div className="text-xs">
         {bookingResultS2?.success
          ? "Booking successful"
          : bookingResultS2?.error?.message}
        </div>
       </AlertDescription>
      </Alert>
     )}
     {bookingResultS3 && (
      <Alert
       className={
        bookingResultS3.success
         ? "border-green-200 bg-green-50 mt-2"
         : "border-red-200 bg-red-50 mt-2"
       }
       autoClose={true}
       onClose={() => setBookingResultS3(null)}
      >
       <AlertDescription
        className={bookingResultS3.success ? "text-green-800" : "text-red-800"}
       >
        <div className="text-xs">
         {bookingResultS3?.success
          ? "Booking successful"
          : bookingResultS3?.error?.message}
        </div>
       </AlertDescription>
      </Alert>
     )}
     {bookingResultS4 && (
      <Alert
       className={
        bookingResultS4.success
         ? "border-green-200 bg-green-50 mt-2"
         : "border-red-200 bg-red-50 mt-2"
       }
       autoClose={true}
       onClose={() => setBookingResultS4(null)}
      >
       <AlertDescription
        className={bookingResultS4.success ? "text-green-800" : "text-red-800"}
       >
        <div className="text-xs">
         {bookingResultS4?.success
          ? "Booking successful"
          : bookingResultS4?.error?.message}
        </div>
       </AlertDescription>
      </Alert>
     )}
     {bookingResultS5 && (
      <Alert
       className={
        bookingResultS5.success
         ? "border-green-200 bg-green-50 mt-2"
         : "border-red-200 bg-red-50 mt-2"
       }
       autoClose={true}
       onClose={() => setBookingResultS5(null)}
      >
       <AlertDescription
        className={bookingResultS5.success ? "text-green-800" : "text-red-800"}
       >
        <div className="text-xs">
         {bookingResultS5?.success
          ? "Booking successful"
          : bookingResultS5?.error?.message}
        </div>
       </AlertDescription>
      </Alert>
     )}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-2">
     {/* First booking card - Testing tennis-booking */}
     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div
        className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1"
        style={{ backgroundColor: "#75BDE0" }}
       >
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       <Button
        onClick={handleBookingS1}
        disabled={isBookingS1 || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg transition-all duration-200"
        style={{ backgroundColor: "#3B7097" }}
        onMouseEnter={(e) => {
         if (!isBookingS1) {
          (e.target as HTMLButtonElement).style.backgroundColor = "#75BDE0";
         }
        }}
        onMouseLeave={(e) => {
         if (!isBookingS1) {
          (e.target as HTMLButtonElement).style.backgroundColor = "#3B7097";
         }
        }}
        size="default"
       >
        {isBookingS1 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          <span className="text-xs">Booking...</span>
         </>
        ) : (
         <>
          <Calendar className="w-3 h-3 mr-1" />
          <span>10h-12h</span>
         </>
        )}
       </Button>
      </CardContent>
     </Card>

     {/* Second booking card */}
     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div
        className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1"
        style={{ backgroundColor: "#75BDE0" }}
       >
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.01</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       <Button
        onClick={handleBookingS2}
        disabled={isBookingS2 || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg transition-all duration-200"
        style={{ backgroundColor: "#3B7097" }}
        onMouseEnter={(e) => {
         if (!isBookingS2) {
          (e.target as HTMLButtonElement).style.backgroundColor = "#75BDE0";
         }
        }}
        onMouseLeave={(e) => {
         if (!isBookingS2) {
          (e.target as HTMLButtonElement).style.backgroundColor = "#3B7097";
         }
        }}
        size="default"
       >
        {isBookingS2 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          <span className="text-xs">Booking...</span>
         </>
        ) : (
         <>
          <Calendar className="w-3 h-3 mr-1" />
          <span>18h-20h</span>
         </>
        )}
       </Button>
      </CardContent>
     </Card>

     {/* Third booking card */}
     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div
        className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1"
        style={{ backgroundColor: "#75BDE0" }}
       >
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       <Button
        onClick={handleBookingS3}
        disabled={isBookingS3 || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg transition-all duration-200"
        style={{ backgroundColor: "#3B7097" }}
        onMouseEnter={(e) => {
         if (!isBookingS3) {
          (e.target as HTMLButtonElement).style.backgroundColor = "#75BDE0";
         }
        }}
        onMouseLeave={(e) => {
         if (!isBookingS3) {
          (e.target as HTMLButtonElement).style.backgroundColor = "#3B7097";
         }
        }}
        size="default"
       >
        {isBookingS3 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          <span className="text-xs">Booking...</span>
         </>
        ) : (
         <>
          <Calendar className="w-3 h-3 mr-1" />
          <span>18h-20h</span>
         </>
        )}
       </Button>
      </CardContent>
     </Card>

     {/* Fourth booking card */}
     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div
        className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1"
        style={{ backgroundColor: "#75BDE0" }}
       >
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       <Button
        onClick={handleBookingS4}
        disabled={isBookingS4 || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg transition-all duration-200"
        style={{ backgroundColor: "#3B7097" }}
        onMouseEnter={(e) => {
         if (!isBookingS4) {
          (e.target as HTMLButtonElement).style.backgroundColor = "#75BDE0";
         }
        }}
        onMouseLeave={(e) => {
         if (!isBookingS4) {
          (e.target as HTMLButtonElement).style.backgroundColor = "#3B7097";
         }
        }}
        size="default"
       >
        {isBookingS4 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          <span className="text-xs">Booking...</span>
         </>
        ) : (
         <>
          <Calendar className="w-3 h-3 mr-1" />
          <span>20h-21h</span>
         </>
        )}
       </Button>
      </CardContent>
     </Card>

     {/* Fifth booking card */}
     <Card className="shadow-lg bg-white">
      <CardHeader className="text-center p-2">
       <div
        className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1"
        style={{ backgroundColor: "#75BDE0" }}
       >
        <Calendar className="w-6 h-6 text-white" />
       </div>
       <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1 px-4 py-2">
       <Button
        onClick={handleBookingS5}
        disabled={isBookingS5 || !isLoggedIn}
        className="w-full text-white font-semibold py-4 text-sm rounded-lg transition-all duration-200"
        style={{ backgroundColor: "#3B7097" }}
        onMouseEnter={(e) => {
         if (!isBookingS5) {
          (e.target as HTMLButtonElement).style.backgroundColor = "#75BDE0";
         }
        }}
        onMouseLeave={(e) => {
         if (!isBookingS5) {
          (e.target as HTMLButtonElement).style.backgroundColor = "#3B7097";
         }
        }}
        size="default"
       >
        {isBookingS5 ? (
         <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          <span className="text-xs">Booking...</span>
         </>
        ) : (
         <>
          <Calendar className="w-3 h-3 mr-1" />
          <span>20h-21h</span>
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
