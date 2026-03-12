"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, Award, CircleCheck as CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockRestaurants } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const restaurantId = searchParams.get("restaurant");
  const packageId = searchParams.get("package");

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: "2",
    specialRequests: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const restaurant = mockRestaurants.find((r) => r.id === restaurantId);
  const selectedPackage = restaurant?.packages.find((p) => p.id === packageId);

  if (!restaurant || !selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Booking information not found</p>
            <Button onClick={() => router.push("/restaurants")} className="mt-4">
              Back to Restaurants
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);

    toast({
      title: "Booking Confirmed!",
      description: `Your reservation at ${restaurant.name} has been confirmed. You'll earn ${selectedPackage.miles} Max Miles!`,
    });

    setTimeout(() => {
      router.push("/restaurants");
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-gray-600 mb-6">
                Your reservation at {restaurant.name} has been confirmed.
              </p>
              <div className="bg-indigo-50 rounded-lg p-4 mb-6 inline-block">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-[#6366F1]" />
                  <span className="text-lg font-semibold text-[#6366F1]">
                    You'll earn {selectedPackage.miles} Max Miles!
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Redirecting you back to restaurants...
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Complete Your Booking
            </h1>
            <p className="text-gray-600">
              Fill in the details to confirm your reservation
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{restaurant.name}</CardTitle>
              <CardDescription>{selectedPackage.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{selectedPackage.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                  <Award className="h-5 w-5 text-[#6366F1]" />
                  <div>
                    <p className="text-xs text-gray-600">You'll earn</p>
                    <p className="text-sm font-bold text-[#6366F1]">
                      {selectedPackage.miles} Miles
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="guests"
                      name="guests"
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={formData.guests}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">
                    Special Requests (Optional)
                  </Label>
                  <Textarea
                    id="specialRequests"
                    name="specialRequests"
                    placeholder="Any dietary restrictions, allergies, or special occasions..."
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base bg-[#6366F1] hover:bg-[#5558E3]"
                >
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
