"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { Loader2, LogOut } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCountDown } from "ahooks";
import { toast, ToastContainer } from "react-toastify";
import JsonView from "@uiw/react-json-view";

const ONE_DAY_MS = 86400000;
function getBookingDate(): number {
 return Date.now() + ONE_DAY_MS;
}
// Court booking options
const courtOptions = [
 {
  id: 0,
  label: "6h-8h",
 },
 {
  id: 1,
  label: "8h-10h",
 },
 {
  id: 2,
  label: "10h-12h",
 },
 {
  id: 3,
  label: "14h-16h",
 },
 {
  id: 4,
  label: "16h-18h",
 },
 {
  id: 5,
  label: "18h-20h",
 },
 {
  id: 6,
  label: "20h-21h",
 },
];

export default function TennisBookingPage() {
 // State for UI
 const [selectedOption, setSelectedOption] = useState(
  courtOptions[courtOptions.length - 2]
 ); // Default to first option
 const [selectedCourt, setSelectedCourt] = useState({ label: "S1.01", id: 0 }); // Default to first option
 const [responseTime, setResponseTime] = useState<number | null>(null);
 const [targetData, setTargetData] = useState<any>({
  timeConstraintId: null,
  fromTime: null,
  placeId: null,
  placeUtilityId: null,
  classifyId: null,
  utilityId: null,
  isFull: null,
 });
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
 const [showStepStates, setShowStepStates] = useState(false);
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

 // Individual API step states
 const [stepStates, setStepStates] = useState({
  slot: { loading: false, data: null as any, error: null as string | null },
  classifies: {
   loading: false,
   data: null as any,
   error: null as string | null,
  },
  places: { loading: false, data: null as any, error: null as string | null },
  ticketInfo: {
   loading: false,
   data: null as any,
   error: null as string | null,
  },
  booking: { loading: false, data: null as any, error: null as string | null },
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
     placeId: targetData.placeId,
     placeUtilityId: targetData.placeUtilityId,
     timeConstraintId: targetData.timeConstraintId,
     fromTime: targetData?.fromTime,
    }),
   });

   const data = await response.json();

   const endTime = performance.now();
   const duration = Math.round(endTime - startTime);
   setResponseTime(duration);

   if (data.success) {
    setBookingState({ loading: false, success: true, error: null });
    toast.success(`🎾 Booking Successful! (${duration}ms)`, {
     position: "top-right",
     autoClose: 1000,
    });
   } else {
    // Extract the actual error message from the API response
    const errorMessage = data.data?.message || data.error || "Booking failed";
    setBookingState({
     loading: false,
     success: false,
     error: errorMessage,
    });
    toast.error(errorMessage, {
     position: "top-right",
     autoClose: 1000,
    });
   }
  } catch (err) {
   const endTime = performance.now();
   const duration = Math.round(endTime - startTime);
   setResponseTime(duration);

   const errorMessage = err instanceof Error ? err.message : "Booking failed";
   setBookingState({
    loading: false,
    success: false,
    error: errorMessage,
   });
   toast.error(errorMessage, {
    position: "top-right",
    autoClose: 1000,
   });
  }
 }, [currentToken, selectedOption.id]);

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

   const response = await fetch(
    `/api/utility?token=${encodeURIComponent(currentToken)}`,
    {
     method: "GET",
     headers: {
      "Content-Type": "application/json",
     },
    }
   );

   const data = await response.json();

   if (data.error) {
    const errorMessage =
     data.data?.message || data.error || "Utility API failed";
    setUtilityState({
     loading: false,
     data: null,
     error: errorMessage,
    });
    toast.error(errorMessage, {
     position: "top-right",
     autoClose: 1000,
    });
   } else {
    const utilityData = data.data.data[data.data.data.length - 1];
    console.log("utilityData", utilityData);
    setTargetData((prev: any) => ({
     ...prev,
     utilityId: utilityData.id,
    }));
    setUtilityState({
     loading: false,
     data: data.data,
     error: null,
    });
    //  toast.success("✅ Utilities loaded successfully!", {
    //   position: "top-right",
    //   autoClose: 1000,
    //  });
   }
  } catch (err) {
   const errorMessage =
    err instanceof Error ? err.message : "Utility API failed";
   setUtilityState({
    loading: false,
    data: null,
    error: errorMessage,
   });
   toast.error(errorMessage, {
    position: "top-right",
    autoClose: 1000,
   });
  }
 }, [currentToken, targetData]);

 // Individual API step handlers
 const handleSlotApi = useCallback(async () => {
  const bookingDate = getBookingDate();
  setStepStates((prev) => ({
   ...prev,
   slot: { loading: true, data: null, error: null },
  }));

  try {
   if (!currentToken) {
    throw new Error("No authentication token available");
   }
   setTargetData((prev: any) => ({
    ...prev,
    bookingDate,
   }));
   const response = await fetch("/api/tennis-booking/slot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     token: currentToken,
     utilityId: targetData.utilityId,
     bookingDate,
    }),
   });

   const data = await response.json();

   if (data.success) {
    setStepStates((prev) => ({
     ...prev,
     slot: { loading: false, data: data.data, error: null },
    }));
    const selectedData = data.data.data[selectedOption.id];
    setTargetData((prev: any) => ({
     ...prev,
     timeConstraintId: selectedData.id,
     fromTime: selectedData.fromTime,
     isFull: selectedData.isFull,
    }));
    toast.success(`✅ ${JSON.stringify(selectedData)}`, {
     position: "top-right",
     autoClose: 1000,
    });
   } else {
    const errorMessage = data.data?.message || data.error || "Slot API failed";
    setStepStates((prev) => ({
     ...prev,
     slot: { loading: false, data: null, error: errorMessage },
    }));
    toast.error(`❌ Step 1: ${errorMessage}`, {
     position: "top-right",
     autoClose: 1000,
    });
   }
  } catch (err) {
   const errorMessage = err instanceof Error ? err.message : "Slot API failed";
   setStepStates((prev) => ({
    ...prev,
    slot: { loading: false, data: null, error: errorMessage },
   }));
   toast.error(`❌ Step 1: ${errorMessage}`, {
    position: "top-right",
    autoClose: 1000,
   });
  }
 }, [currentToken, selectedOption.id, targetData]);

 const handleClassifiesApi = useCallback(async () => {
  toast.dismiss();
  setStepStates((prev) => ({
   ...prev,
   classifies: { loading: true, data: null, error: null },
  }));

  try {
   if (!currentToken) {
    throw new Error("No authentication token available");
   }

   const response = await fetch("/api/tennis-booking/classifies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     token: currentToken,
     timeConstraintId: targetData.timeConstraintId,
     fromTime: targetData?.fromTime,
     utilityId: targetData.utilityId,
    }),
   });

   const data = await response.json();

   if (data.success) {
    const selectedData = data.data.data.find(
     (item: any) => item.name === "Nội khu S1"
    );
    console.log("selectedData", selectedData);
    setTargetData((prev: any) => ({
     ...prev,
     classifyId: selectedData.id,
    }));
    setStepStates((prev) => ({
     ...prev,
     classifies: { loading: false, data: data.data, error: null },
    }));
    toast.success("✅ Step 2: successfully", {
     position: "top-right",
     autoClose: 1000,
    });
   } else {
    const errorMessage =
     data.data?.message || data.error || "Classifies API failed";
    setStepStates((prev) => ({
     ...prev,
     classifies: { loading: false, data: null, error: errorMessage },
    }));
    toast.error(`❌ Step 2: ${errorMessage}`, {
     position: "top-right",
     autoClose: 1000,
    });
   }
  } catch (err) {
   const errorMessage =
    err instanceof Error ? err.message : "Classifies API failed";
   setStepStates((prev) => ({
    ...prev,
    classifies: { loading: false, data: null, error: errorMessage },
   }));
   toast.error(`❌ Step 2: ${errorMessage}`, {
    position: "top-right",
    autoClose: 1000,
   });
  }
 }, [currentToken, selectedOption.id, targetData]);

 const handlePlacesApi = useCallback(async () => {
  toast.dismiss();
  setStepStates((prev) => ({
   ...prev,
   places: { loading: true, data: null, error: null },
  }));

  try {
   if (!currentToken) {
    throw new Error("No authentication token available");
   }

   const response = await fetch("/api/tennis-booking/places", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     token: currentToken,
     timeConstraintId: targetData.timeConstraintId,
     fromTime: targetData.fromTime,
     classifyId: targetData.classifyId,
     utilityId: targetData.utilityId,
    }),
   });

   const data = await response.json();

   if (data.success) {
    const selectedData = data.data.data[selectedCourt.id];
    console.log("selectedData", selectedData);
    setTargetData((prev: any) => ({
     ...prev,
     placeId: selectedData.id,
     placeUtilityId: selectedData.placeUtilityId,
    }));
    setStepStates((prev) => ({
     ...prev,
     places: { loading: false, data: data.data, error: null },
    }));

    toast.success("✅ Step 3: successfully", {
     position: "top-right",
     autoClose: 1000,
    });
   } else {
    const errorMessage =
     data.data?.message || data.error || "Places API failed";
    setStepStates((prev) => ({
     ...prev,
     places: { loading: false, data: null, error: errorMessage },
    }));
    toast.error(`❌ Step 3: ${errorMessage}`, {
     position: "top-right",
     autoClose: 1000,
    });
   }
  } catch (err) {
   const errorMessage =
    err instanceof Error ? err.message : "Places API failed";
   setStepStates((prev) => ({
    ...prev,
    places: { loading: false, data: null, error: errorMessage },
   }));
   toast.error(`❌ Step 3: ${errorMessage}`, {
    position: "top-right",
    autoClose: 5000,
   });
  }
 }, [currentToken, selectedOption.id, targetData]);

 const handleTicketInfoApi = useCallback(async () => {
  toast.dismiss();
  setStepStates((prev) => ({
   ...prev,
   ticketInfo: { loading: true, data: null, error: null },
  }));

  try {
   if (!currentToken) {
    throw new Error("No authentication token available");
   }

   const response = await fetch("/api/tennis-booking/ticket-info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     token: currentToken,
     placeUtilityId: targetData.placeUtilityId,
     timeConstraintId: targetData.timeConstraintId,
     bookingDate: targetData.bookingDate,
    }),
   });

   const data = await response.json();

   if (data.success) {
    setStepStates((prev) => ({
     ...prev,
     ticketInfo: { loading: false, data: data.data, error: null },
    }));
    toast.success("✅ Step 4: successfully", {
     position: "top-right",
     autoClose: 1000,
    });
   } else {
    const errorMessage =
     data.data?.message || data.error || "Ticket Info API failed";
    setStepStates((prev) => ({
     ...prev,
     ticketInfo: { loading: false, data: null, error: errorMessage },
    }));
    toast.error(`❌ Step 4: ${errorMessage}`, {
     position: "top-right",
     autoClose: 1000,
    });
   }
  } catch (err) {
   const errorMessage =
    err instanceof Error ? err.message : "Ticket Info API failed";
   setStepStates((prev) => ({
    ...prev,
    ticketInfo: { loading: false, data: null, error: errorMessage },
   }));
   toast.error(`❌ Step 4: ${errorMessage}`, {
    position: "top-right",
    autoClose: 1000,
   });
  }
 }, [currentToken, selectedOption.id, targetData]);

 const handleBookingApi = useCallback(async () => {
  setStepStates((prev) => ({
   ...prev,
   booking: { loading: true, data: null, error: null },
  }));

  try {
   if (!currentToken) {
    throw new Error("No authentication token available");
   }

   const response = await fetch("/api/tennis-booking/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     token: currentToken,
     placeId: targetData.placeId,
     timeConstraintId: targetData.timeConstraintId,
     bookingDate: targetData.bookingDate,
     utilityId: targetData.utilityId,
    }),
   });

   const data = await response.json();

   if (data.success) {
    setStepStates((prev) => ({
     ...prev,
     booking: { loading: false, data: data.data, error: null },
    }));
    toast.success("✅ Step 5: Booking completed successfully", {
     position: "top-right",
     autoClose: 1000,
    });
   } else {
    // Extract the actual error message from the API response
    const errorMessage =
     data.data?.message || data.error || "Booking API failed";
    setStepStates((prev) => ({
     ...prev,
     booking: { loading: false, data: null, error: errorMessage },
    }));
    toast.error(`❌ Step 5: ${errorMessage}`, {
     position: "top-right",
     autoClose: 1000,
    });
   }
  } catch (err) {
   const errorMessage =
    err instanceof Error ? err.message : "Booking API failed";
   setStepStates((prev) => ({
    ...prev,
    booking: { loading: false, data: null, error: errorMessage },
   }));
   toast.error(`❌ Step 5: ${errorMessage}`, {
    position: "top-right",
    autoClose: 1000,
   });
  }
 }, [currentToken, selectedOption.id, targetData]);

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
        Loading
       </>
      ) : (
       <>Click to Start</>
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
    {targetData.utilityId && (
     <>
      {/* Court Selection */}
      <Card className="shadow-lg mb-6">
       <CardHeader className="text-center">
        <CardTitle className="text-lg font-bold text-gray-800 text-left">
         Court & Time Selection
        </CardTitle>
       </CardHeader>
       <CardContent>
        <div className="space-y-4 flex flex-row justify-between gap-2">
         <Dropdown
          options={courtOptions}
          value={selectedOption.id}
          onChange={(option) => setSelectedOption(option)}
          placeholder="Select court and time..."
          className="w-full"
         />
         <Dropdown
          options={[
           { label: "S1.01", id: 0 },
           { label: "S1.02", id: 1 },
          ]}
          value={selectedCourt.id}
          onChange={(option) => setSelectedCourt(option)}
          placeholder="Select court and time..."
          className="w-full"
         />
        </div>
       </CardContent>
      </Card>

      {/* Individual API Steps */}
      <Card className="shadow-lg mb-6">
       <CardContent className="space-y-3">
        {/* Step 1: Slot */}
        <Button
         onClick={handleSlotApi}
         disabled={stepStates.slot.loading}
         className="w-full text-white border-2 cursor-pointer"
         size="lg"
         variant="outline"
         style={{
          backgroundColor: "#f39c12",
          borderColor: "#f39c12",
          color: "white",
         }}
         onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#D4A254";
          (e.target as HTMLButtonElement).style.borderColor = "#D4A254";
         }}
         onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#f39c12";
          (e.target as HTMLButtonElement).style.borderColor = "#f39c12";
         }}
        >
         {stepStates.slot.loading ? (
          <>
           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
           Step 1: Getting Slots...
          </>
         ) : (
          <>{selectedOption.label}</>
         )}
        </Button>

        {/* Step 2: Classifies */}
        <Button
         onClick={handleClassifiesApi}
         disabled={stepStates.classifies.loading || !stepStates.slot.data}
         className="w-full text-white border-2 cursor-pointer"
         size="lg"
         variant="outline"
         style={{
          backgroundColor: "#f39c12",
          borderColor: "#f39c12",
          color: "white",
         }}
         onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#D4A254";
          (e.target as HTMLButtonElement).style.borderColor = "#D4A254";
         }}
         onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#f39c12";
          (e.target as HTMLButtonElement).style.borderColor = "#f39c12";
         }}
        >
         {stepStates.classifies.loading ? (
          <>
           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
           Loading...
          </>
         ) : (
          <>S1</>
         )}
        </Button>

        {/* Step 3: Places */}
        <Button
         onClick={handlePlacesApi}
         disabled={stepStates.places.loading || !stepStates.classifies.data}
         className="w-full text-white border-2 cursor-pointer"
         size="lg"
         variant="outline"
         style={{
          backgroundColor: "#f39c12",
          borderColor: "#f39c12",
          color: "white",
         }}
         onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#D4A254";
          (e.target as HTMLButtonElement).style.borderColor = "#D4A254";
         }}
         onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#f39c12";
          (e.target as HTMLButtonElement).style.borderColor = "#f39c12";
         }}
        >
         {stepStates.places.loading ? (
          <>
           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
           Loading...
          </>
         ) : (
          <>{selectedCourt.label}</>
         )}
        </Button>

        {/* Step 4: Ticket Info */}
        <Button
         onClick={handleTicketInfoApi}
         disabled={stepStates.ticketInfo.loading || !stepStates.places.data}
         className="w-full text-white border-2 cursor-pointer"
         size="lg"
         variant="outline"
         style={{
          backgroundColor: "#f39c12",
          borderColor: "#f39c12",
          color: "white",
         }}
         onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#D4A254";
          (e.target as HTMLButtonElement).style.borderColor = "#D4A254";
         }}
         onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#f39c12";
          (e.target as HTMLButtonElement).style.borderColor = "#f39c12";
         }}
        >
         {stepStates.ticketInfo.loading ? (
          <>
           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
           Loading...
          </>
         ) : (
          <>Ticket Info</>
         )}
        </Button>

        {/* Step 5: Booking */}
        <Button
         onClick={handleBookingApi}
         disabled={stepStates.booking.loading || !stepStates.ticketInfo.data}
         className="w-full text-white border-2 cursor-pointer flex"
         size="lg"
         variant="outline"
         style={{
          backgroundColor: "#f39c12",
          borderColor: "#f39c12",
          color: "white",
         }}
         onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#D4A254";
          (e.target as HTMLButtonElement).style.borderColor = "#D4A254";
         }}
         onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#f39c12";
          (e.target as HTMLButtonElement).style.borderColor = "#f39c12";
         }}
        >
         {stepStates.booking.loading ? (
          <>
           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
           Booking...
          </>
         ) : (
          <>Make Booking</>
         )}
        </Button>
       </CardContent>
      </Card>

      {/* Client-Side Booking Button */}
      {/* <Button
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
    </Button> */}
      {/* Auto-Booking Countdown */}
      {/* <Card className="shadow-lg mt-6">
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
    </Card> */}
      <Button
       className="w-full text-white border-2 cursor-pointer"
       size="lg"
       variant="outline"
       style={{
        backgroundColor: "#f39c12",
        borderColor: "#f39c12",
        color: "white",
       }}
       onClick={() => {
        setShowStepStates(!showStepStates);
       }}
      >
       View Logs
      </Button>
      {showStepStates && (
       <Card className="shadow-lg mt-6">
        <CardContent className="break-words">
         {stepStates.slot.data && <JsonView value={stepStates.slot.data} />}
         {stepStates.classifies.data && <JsonView value={stepStates.classifies.data} />}
         {stepStates.places.data && <JsonView value={stepStates.places.data} />}
         {stepStates.ticketInfo.data && <JsonView value={stepStates.ticketInfo.data} />}
         {stepStates.booking.data && <JsonView value={stepStates.booking.data} />}
        </CardContent>
       </Card>
      )}
     </>
    )}
    {/* <ToastContainer limit={1} /> */}
   </div>
  </div>
 );
}
