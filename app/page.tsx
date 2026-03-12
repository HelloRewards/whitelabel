"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, ArrowRight, Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSSOLogin = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsLoading(true);

    try {
      console.log("[Client] Requesting token from /api/dev/generate-token");

      const response = await fetch("/api/dev/generate-token", {
        cache: "no-store",
      });

      console.log("[Client] Response received, status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Client] Token generation failed:", errorData);
        alert(`Token generation failed: ${errorData.error || 'Unknown error'}`);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("[Client] Token received, redirecting to SSO endpoint");

      if (data.token) {
        const url = `/api/auth/sso?token=${data.token}`;
        console.log("[Client] Navigating to:", url);
        router.push(url);
      } else {
        console.error("[Client] No token in response:", data);
        alert("Failed to generate token");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[Client] Error during SSO login:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6366F1] mb-4">
            <Plane className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Heymax Dining Rewards
          </h1>
          <p className="text-lg text-gray-600">
            Developer Testing Portal
          </p>
        </div>

        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-xs">
                Development Mode
              </Badge>
            </div>
            <CardTitle className="text-2xl">SSO Simulation</CardTitle>
            <CardDescription className="text-base">
              Test the complete authentication flow with one click
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm text-gray-700">
                What happens when you click:
              </h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#6366F1] text-white text-xs font-bold">
                    1
                  </span>
                  <span>Generates a JWT token with mock user credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#6366F1] text-white text-xs font-bold">
                    2
                  </span>
                  <span>Verifies the token using SSO_SECRET</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#6366F1] text-white text-xs font-bold">
                    3
                  </span>
                  <span>Creates a secure session cookie</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#6366F1] text-white text-xs font-bold">
                    4
                  </span>
                  <span>Redirects to the protected restaurants page</span>
                </li>
              </ol>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Mock User:</span> demo@heymax.com
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">User ID:</span> demo_user_001
                </p>
              </div>

              <Button
                onClick={handleSSOLogin}
                disabled={isLoading}
                className="w-full h-12 text-base bg-[#6366F1] hover:bg-[#5558E3]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Simulate Heymax SSO Login
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            This demo portal simulates the external app SSO handoff
          </p>
        </div>
      </div>
    </div>
  );
}
