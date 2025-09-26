"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogIn, ArrowRight, Volleyball } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { TokenService } from "@/lib/token-service"
import crypto from "crypto";

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [token, setToken] = useState("");
  const [loginResult, setLoginResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { login } = useUser()

  const handleLogin = async () => {
    setIsLoggingIn(true)
    setLoginResult(null)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()

      if (response.ok && result.success && result.data?.data?.accessToken) {
        // Store token in localStorage
        TokenService.storeToken(username, result.data.data.accessToken)

        // Update context
        login(result.data.data.accessToken, result.data.data, username)

        setLoginResult({
          success: true,
          message: "Login successful! Redirecting to utilities...",
          data: result,
        })
        location.href = "/utilities/s1"
      } else {
        setLoginResult({
          success: false,
          message: result.message || "Login failed. Please try again.",
          data: result,
        })
      }
    } catch (error) {
      setLoginResult({
        success: false,
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }
  const handleLogin1 = () => {
    const data = JSON.stringify({
      "username": "0979251496",
      "password": "Nam@2025"
    });

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        const response = JSON.parse(this.responseText);
        setToken(response?.data?.accessToken);
      }
    });

    xhr.open("POST", "https://vh.vinhomes.vn/api/vhr/iam/v0/security/oauth-login");
    xhr.setRequestHeader("user-agent", "Dart/3.7 (dart:io)");
    xhr.setRequestHeader("app-version-name", "1.5.5");
    xhr.setRequestHeader("device-inf", "Pixel 6 Google 35");
    xhr.setRequestHeader("accept-language", "vi");
    xhr.setRequestHeader("device-id", "d4cecbf3a4df9517");
    xhr.setRequestHeader("host", "vh.vinhomes.vn");
    xhr.setRequestHeader("content-type", "application/json; charset=UTF-8");
    xhr.setRequestHeader("accept-encoding", "gzip");

    xhr.send(data);
  }
  function generateChecksum(utilityId: number, placeId: number, bookingDate: number, timeConstraintId: number) {
    const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@";
    const interpolatedString = 
       Number(utilityId) +
       Number(placeId) +
       Number(bookingDate) +
       Number(timeConstraintId) +
       SECRET_KEY;
   
   const checksum = crypto.createHash('sha256').update(interpolatedString).digest('hex');
   return checksum;
   }
  const handleBookingS1 = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingDate = tomorrow.getTime();
    const cs = generateChecksum(75, 801, bookingDate, 575);
    console.log(cs, 'c');
    
    const data = JSON.stringify({
      "bookingRequests": [
        {
          "bookingDate": bookingDate,
          "placeId": 801,
          "timeConstraintId": 575,
          "utilityId": 75,
          "residentTicket": 4,
          "residentChildTicket": null,
          "guestTicket": null,
          "guestChildTicket": null
        }
      ],
      "paymentMethod": null,
      "vinClubPoint": null,
      "deviceType": "ANDROID",
      "cs": cs
    });
    
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        alert(this.responseText);
      }
    });
    
    xhr.open("POST", "https://vh.vinhomes.vn/api/vhr/utility/v0/customer-utility/booking");
    xhr.setRequestHeader("user-agent", "Dart/3.7 (dart:io)");
    xhr.setRequestHeader("app-version-name", "1.5.5");
    xhr.setRequestHeader("device-inf", "Pixel 6 Google 35");
    xhr.setRequestHeader("accept-language", "vi");
    xhr.setRequestHeader("device-id", "d4cecbf3a4df9517");
    xhr.setRequestHeader("host", "vh.vinhomes.vn");
    xhr.setRequestHeader("content-type", "application/json; charset=UTF-8");
    xhr.setRequestHeader("accept-encoding", "gzip, deflate, br");
    xhr.setRequestHeader("x-vinhome-token", token);
    
    xhr.send(data);
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)' }}>
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#3B7097' }}>
              <LogIn className="w-8 h-8 text-white" />
            </div>

          </CardHeader>
          <CardContent className="space-y-4">
            {loginResult && (
              <Alert className={loginResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={loginResult.success ? "text-green-800" : "text-red-800"}>
                  {loginResult.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex justify-between">
                <Button onClick={handleLogin1}>Login</Button>
                <Button onClick={handleBookingS1}>S101 18h-20h</Button>
              </div>
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
              style={{ backgroundColor: '#3B7097' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097'}
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
  )
}
