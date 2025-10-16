"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { TokenService } from "@/lib/token-service";

export default function LoginPage() {
 const [isLoggingIn, setIsLoggingIn] = useState(false);

 const [username, setUsername] = useState("");
 const [password, setPassword] = useState("");
 const router = useRouter();
 const { login } = useUser();

 const handleLogin = async () => {
  setIsLoggingIn(true);

  try {
   const response = await fetch("/api/login", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
   });

   const result = await response.json();

   if (response.ok && result.success && result.data?.data?.accessToken) {
    // Store token in localStorage
    TokenService.storeToken(username, result.data.data.accessToken);
    // Update context and wait for it to complete
    console.log("result.data.data.customerInfo", result.data.data.customerInfo)
    await login(result.data.data.accessToken, result.data.data.customerInfo, username);

    // Navigate after login state is properly set
    router.push("/utilities/s1");
   } 
  } catch (error) {
    console.error("Failed to login:", error);
  } finally {
   setIsLoggingIn(false);
  }
 };

 return (
  <div
   className="min-h-screen flex items-center justify-center p-4"
   style={{ background: "linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)" }}
  >
   <div className="w-full max-w-md">
    <Card className="shadow-lg">
     <CardHeader className="text-center">
      <div
       className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
       style={{ backgroundColor: "#3B7097" }}
      >
       <LogIn className="w-8 h-8 text-white" />
      </div>
     </CardHeader>

     <CardContent className="space-y-4">
      <div className="space-y-4">
       <div className="space-y-2">
        <Label htmlFor="username">Phone number</Label>
        <Input
         id="username"
         type="text"
         placeholder="Enter username"
         value={username}
         onChange={(e) => setUsername(e.target.value)}
         className="text-sm"
        />
       </div>

       <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
         id="password"
         type="password"
         placeholder="Enter password"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         className="text-sm"
        />
       </div>
      </div>

      <Button
       onClick={handleLogin}
       disabled={isLoggingIn || !username || !password}
       className="w-full text-white font-semibold py-3"
       style={{ backgroundColor: "#3B7097" }}
       onMouseEnter={(e) =>
        ((e.target as HTMLButtonElement).style.backgroundColor = "#75BDE0")
       }
       onMouseLeave={(e) =>
        ((e.target as HTMLButtonElement).style.backgroundColor = "#3B7097")
       }
       size="lg"
      >
       {isLoggingIn ? (
        <>
         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
         Logging in...
        </>
       ) : (
        <>
         <LogIn className="w-4 h-4 mr-2" />
         Login
        </>
       )}
      </Button>
     </CardContent>
    </Card>
   </div>
  </div>
 );
}
