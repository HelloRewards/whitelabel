import { Star, MapPin, Award } from "lucide-react";
import { Restaurant } from "@/lib/restaurant-mapper";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full group">
      <Link href={`/restaurants/${restaurant.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {restaurant.isPremium && (
            <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600">
              Premium
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                {restaurant.name}
              </h3>
              <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600">
              {restaurant.hh_rating > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{restaurant.hh_rating.toFixed(1)}</span>
                  {restaurant.reviews_count > 0 && (
                    <span className="text-gray-500">({restaurant.reviews_count})</span>
                  )}
                </div>
              ) : restaurant.google_rating > 0 ? (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-[#4285F4] text-xs">G</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{restaurant.google_rating.toFixed(1)}</span>
                  {restaurant.reviews_count > 0 && (
                    <span className="text-gray-500">({restaurant.reviews_count})</span>
                  )}
                </div>
              ) : (
                <Badge variant="secondary" className="text-xs px-2 py-0 h-5">New</Badge>
              )}
              {restaurant.distance && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{restaurant.distance}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <Award className="h-4 w-4 text-[#6366F1]" />
              <span className="text-sm font-semibold text-[#6366F1]">
                Earn up to 3% back in Max Miles
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
