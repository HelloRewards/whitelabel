"use client";

import { useSearchParams } from "next/navigation";
import { CircleAlert as AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "An error occurred";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            We couldn't verify your session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="capitalize">
              {message}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-gray-600 mt-4">
            Please contact your app administrator or try accessing this page through your mobile app again.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
