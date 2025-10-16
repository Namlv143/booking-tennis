"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { Loader2, LogOut } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

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
 // Use context for user state
 const { isLoggedIn, currentToken, userData, isLoading, logout } = useUser();

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

 // Redirect if not logged in
 useEffect(() => {
  if (!isLoading && !isLoggedIn) {
   router.push("/login");
  }
 }, [isLoading, isLoggedIn, router]);

 const handleLogout = () => {
  logout();
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
   }
  } catch (err) {
   const errorMessage =
    err instanceof Error ? err.message : "Utility API failed";
   setUtilityState({
    loading: false,
    data: null,
    error: errorMessage,
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
   } else {
    const errorMessage = data.data?.message || data.error || "Slot API failed";
    setStepStates((prev) => ({
     ...prev,
     slot: { loading: false, data: null, error: errorMessage },
    }));
   }
  } catch (err) {
   const errorMessage = err instanceof Error ? err.message : "Slot API failed";
   setStepStates((prev) => ({
    ...prev,
    slot: { loading: false, data: null, error: errorMessage },
   }));
  }
 }, [currentToken, selectedOption.id, targetData]);

 const handleClassifiesApi = useCallback(async () => {
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
   } else {
    const errorMessage =
     data.data?.message || data.error || "Classifies API failed";
    setStepStates((prev) => ({
     ...prev,
     classifies: { loading: false, data: null, error: errorMessage },
    }));
   }
  } catch (err) {
   const errorMessage =
    err instanceof Error ? err.message : "Classifies API failed";
   setStepStates((prev) => ({
    ...prev,
    classifies: { loading: false, data: null, error: errorMessage },
   }));
  }
 }, [currentToken, selectedOption.id, targetData]);

 const handlePlacesApi = useCallback(async () => {
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
   } else {
    const errorMessage =
     data.data?.message || data.error || "Places API failed";
    setStepStates((prev) => ({
     ...prev,
     places: { loading: false, data: null, error: errorMessage },
    }));
   }
  } catch (err) {
   const errorMessage =
    err instanceof Error ? err.message : "Places API failed";
   setStepStates((prev) => ({
    ...prev,
    places: { loading: false, data: null, error: errorMessage },
   }));
  }
 }, [currentToken, selectedOption.id, targetData]);

 const handleTicketInfoApi = useCallback(async () => {
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
   } else {
    const errorMessage =
     data.data?.message || data.error || "Ticket Info API failed";
    setStepStates((prev) => ({
     ...prev,
     ticketInfo: { loading: false, data: null, error: errorMessage },
    }));
   }
  } catch (err) {
   const errorMessage =
    err instanceof Error ? err.message : "Ticket Info API failed";
   setStepStates((prev) => ({
    ...prev,
    ticketInfo: { loading: false, data: null, error: errorMessage },
   }));
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
   } else {
    // Extract the actual error message from the API response
    const errorMessage =
     data.data?.message || data.error || "Booking API failed";
    setStepStates((prev) => ({
     ...prev,
     booking: { loading: false, data: null, error: errorMessage },
    }));
   }
  } catch (err) {
   const errorMessage =
    err instanceof Error ? err.message : "Booking API failed";
   setStepStates((prev) => ({
    ...prev,
    booking: { loading: false, data: null, error: errorMessage },
   }));
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
   <div className="text-center mb-8">
    {userData?.fullName ? (
     <h1 className="text-2xl font-semibold" style={{ color: "#3B7097" }}>
      Welcome {userData.fullName}!
     </h1>
    ) : (
     <h1 className="text-2xl font-semibold" style={{ color: "#3B7097" }}>
      Welcome!
     </h1>
    )}
    <p className=" text-gray-800 mb-2">Tennis Booking Dashboard</p>
   </div>
   <div className="max-w-4xl mx-auto">
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
      {stepStates.booking.data && (
       <h3 className="text-md mb-2 text-green-500 text-left">
        Booking Successfully
       </h3>
      )}
      {stepStates.booking.error && (
       <h3 className="text-md mb-2 text-red-500 text-left">
        {stepStates.booking.error}
       </h3>
      )}
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
     </>
    )}
   </div>
  </div>
 );
}
