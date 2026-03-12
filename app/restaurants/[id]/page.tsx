"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Star, MapPin, Award, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DiningPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  miles: number;
  features: string[];
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface Restaurant {
  id: string;
  hr_id: string;
  name: string;
  cuisine: string;
  coverImage: string;
  heroImage: string;
  description: string;
  maxMiles: number;
  hh_rating: number;
  google_rating: number;
  reviews_count: number;
  rating: number;
  reviews: number;
  distance: string;
  isPremium: boolean;
  isBuffet: boolean;
  address: string;
  latitude: string;
  longitude: string;
  neighborhood: string;
  packages: DiningPackage[];
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/restaurants/${restaurantId}`);

        if (!response.ok) {
          throw new Error('Restaurant not found');
        }

        const data = await response.json();
        if (data.success && data.data) {
          setRestaurant(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError(err instanceof Error ? err.message : 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await fetch(`/api/restaurants/${restaurantId}/reviews`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setReviews(data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (restaurantId) {
      fetchReviews();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] overflow-hidden bg-gray-200">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="max-w-4xl space-y-8">
              <section>
                <Skeleton className="h-8 w-32 mb-3" />
                <Skeleton className="h-20 w-full" />
              </section>
              <section>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-lg">{error || 'Restaurant not found'}</p>
            <Button onClick={() => router.push("/restaurants")} className="mt-4">
              Back to Restaurants
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleBookPackage = (packageId: string) => {
    router.push(`/checkout?restaurant=${restaurantId}&package=${packageId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] overflow-hidden">
          <img
            src={restaurant.heroImage}
            alt={restaurant.name}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-900 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 text-white">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-2">
                {restaurant.isPremium && (
                  <Badge className="bg-amber-500 hover:bg-amber-600">
                    Premium
                  </Badge>
                )}
                <Badge variant="secondary">{restaurant.cuisine}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {restaurant.hh_rating > 0 ? (
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{restaurant.hh_rating.toFixed(1)}</span>
                    {restaurant.reviews_count > 0 && (
                      <span className="opacity-90">({restaurant.reviews_count} reviews)</span>
                    )}
                  </div>
                ) : restaurant.google_rating > 0 ? (
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="font-semibold text-[#4285F4] mr-1">G</span>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{restaurant.google_rating.toFixed(1)}</span>
                    {restaurant.reviews_count > 0 && (
                      <span className="opacity-90">({restaurant.reviews_count} reviews)</span>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="font-semibold">New</span>
                  </div>
                )}
                {restaurant.neighborhood && (
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <MapPin className="h-4 w-4" />
                    <span>{restaurant.neighborhood}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-4xl space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                About
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {restaurant.description}
              </p>
            </section>

            {restaurant.address && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Location
                </h2>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 leading-relaxed">{restaurant.address}</p>
                    </div>
                    <Button
                      onClick={() => {
                        const mapsUrl = restaurant.latitude && restaurant.longitude
                          ? `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      className="w-full sm:w-auto bg-[#6366F1] hover:bg-[#5558E3]"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Available Packages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restaurant.packages.map((pkg) => (
                  <Card key={pkg.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <div className="space-y-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            S${pkg.price.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                          <Award className="h-5 w-5 text-[#6366F1] flex-shrink-0" />
                          <span className="text-sm font-semibold text-[#6366F1]">
                            Earn {pkg.miles} Max Miles
                          </span>
                        </div>

                        <div className="space-y-2 pt-2">
                          {pkg.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-600">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        onClick={() => handleBookPackage(pkg.id)}
                        className="w-full bg-[#6366F1] hover:bg-[#5558E3]"
                      >
                        Book Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Prices are converted from local currency for your convenience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What Diners Say
              </h2>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-gray-200 text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-semibold text-gray-900">{review.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="font-medium">{review.name}</span>
                            {review.date && (
                              <span>{new Date(review.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            )}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No reviews yet. Be the first to dine and share your experience!</p>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
