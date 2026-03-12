"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Loader as Loader2, CircleAlert as AlertCircle, Map } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { RestaurantCard } from "@/components/RestaurantCard";
import { FilterPills } from "@/components/FilterPills";
import { Input } from "@/components/ui/input";
import { Restaurant } from "@/lib/restaurant-mapper";

const DESTINATIONS = [
  { id: '1', name: '🇹🇭 Thailand', count: '1,300+ Offers', supplier_city_id: '1' },
  { id: '2', name: '🇸🇬 Singapore', count: '200+ Offers', supplier_city_id: '2' },
  { id: '3', name: '🇲🇾 Malaysia', count: '50+ Offers', supplier_city_id: '3' }
];

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeDestination, setActiveDestination] = useState<string>('1');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchRestaurants() {
      const destination = DESTINATIONS.find(d => d.id === activeDestination);
      if (!destination) return;

      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const response = await fetch(`/api/restaurants?city_id=${destination.supplier_city_id}&page=${page}`);

        if (!response.ok) {
          throw new Error('Failed to load restaurants');
        }

        const result = await response.json();
        const restaurantData = result.data || [];

        if (page === 1) {
          setRestaurants(restaurantData);
          setHasMore(restaurantData.length > 0);
        } else {
          const existingIds = new Set(restaurants.map(r => r.hr_id));
          const newRestaurants = restaurantData.filter((r: Restaurant) => !existingIds.has(r.hr_id));

          if (newRestaurants.length === 0 || restaurantData.length === 0) {
            setHasMore(false);
          } else {
            setRestaurants(prev => [...prev, ...newRestaurants]);
          }
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Unable to load restaurants. Please try again later.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    fetchRestaurants();
  }, [activeDestination, page]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredRestaurants = useMemo(() => {
    let results = restaurants;

    if (searchQuery) {
      results = results.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilters.length > 0) {
      results = results.filter((restaurant) => {
        if (selectedFilters.includes("nearby")) {
          const distance = parseFloat(restaurant.distance);
          if (distance > 2) return false;
        }
        if (selectedFilters.includes("premium") && !restaurant.isPremium) {
          return false;
        }
        if (selectedFilters.includes("buffet") && !restaurant.isBuffet) {
          return false;
        }
        return true;
      });
    }

    return results;
  }, [searchQuery, selectedFilters, restaurants]);

  const handleDestinationChange = (destinationId: string) => {
    setActiveDestination(destinationId);
    setPage(1);
    setHasMore(true);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Explore Destinations</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {DESTINATIONS.map((destination) => (
                <button
                  key={destination.id}
                  onClick={() => handleDestinationChange(destination.id)}
                  className={`flex-shrink-0 px-6 py-4 rounded-xl font-semibold text-left transition-all duration-200 min-w-[200px] ${
                    activeDestination === destination.id
                      ? 'bg-gray-900 text-white shadow-xl scale-105 border-2 border-gray-900'
                      : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg'
                  }`}
                >
                  <div className="text-2xl mb-1">{destination.name}</div>
                  <div className={`text-sm font-medium ${
                    activeDestination === destination.id ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {destination.count}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search restaurants or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              disabled={loading}
            />
          </div>

          <FilterPills
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
          />

          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
                  >
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-gray-700 text-lg font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-gray-100 rounded-full p-6 mb-6">
                <Map className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-700 text-xl font-semibold mb-2">
                Inventory for this region is currently being synced to the staging environment.
              </p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No restaurants found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredRestaurants.length} restaurant
                  {filteredRestaurants.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 min-w-[200px] justify-center"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>Load More Offers</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
