import { NextResponse } from 'next/server';
import { generateHmacToken } from '@/lib/hmac-auth';
import { mapRestaurant, type HHRestaurant, type Restaurant } from '@/lib/restaurant-mapper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const baseUrl = process.env.HH_BASE_URL;
    const apiKey = process.env.HH_API_KEY;
    const apiSecretKey = process.env.HH_API_SECRET_KEY;

    if (!baseUrl || !apiKey || !apiSecretKey) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const city_id = searchParams.get('city_id') || '1';
    const page = searchParams.get('page') || '1';

    const url = new URL('api/vendor/v1/restaurants/search.json', baseUrl);
    url.searchParams.append('city_id', city_id);
    url.searchParams.append('page[number]', page);
    url.searchParams.append('page[size]', '20');
    url.searchParams.append('minor_version', '3');
    url.searchParams.append('sort', 'top');
    url.searchParams.append('include_pictures', 'true');

    console.log('Fetching restaurants from:', url.toString());

    const token = generateHmacToken(url, 'GET', apiKey, apiSecretKey);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`❌ API returned status ${response.status}`);
      const text = await response.text();
      console.error('Response:', text.substring(0, 200));

      return NextResponse.json({
        success: false,
        data: [],
        error: `API error: ${response.status}`
      }, { status: response.status });
    }

    const responseData = await response.json();
    console.log('\n=== API RESPONSE DEBUG ===');
    console.log('Response structure keys:', Object.keys(responseData));
    console.log('Full response (first 3000 chars):\n', JSON.stringify(responseData, null, 2).substring(0, 3000));

    let restaurants: HHRestaurant[] = [];
    let included: any[] = [];

    if (Array.isArray(responseData)) {
      restaurants = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      restaurants = responseData.data;
      included = responseData.included || [];
      console.log(`✓ Found ${restaurants.length} restaurants in response.data`);
      console.log(`✓ Found ${included.length} included items`);
    } else if (responseData.restaurants && Array.isArray(responseData.restaurants)) {
      restaurants = responseData.restaurants;
    } else if (responseData.results && Array.isArray(responseData.results)) {
      restaurants = responseData.results;
    }

    if (restaurants.length === 0) {
      console.log('ℹ️ No restaurants found for this city_id, returning empty array');
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    if (restaurants.length > 0) {
      console.log('\n=== FIRST RESTAURANT DEBUG ===');
      console.log('Restaurant fields:', Object.keys(restaurants[0]));
      console.log('First restaurant full:\n', JSON.stringify(restaurants[0], null, 2));
      if (restaurants[0].attributes) {
        console.log('\nAttributes keys:', Object.keys(restaurants[0].attributes));
        console.log('\nRating fields check:');
        console.log('  - attributes.rating:', restaurants[0].attributes.rating);
        console.log('  - attributes.reviews_score:', restaurants[0].attributes.reviews_score);
        console.log('  - attributes.avg_rating:', restaurants[0].attributes.avg_rating);
        console.log('  - attributes.average_rating:', restaurants[0].attributes.average_rating);
      }
      if (restaurants[0].relationships) {
        console.log('Relationships:', JSON.stringify(restaurants[0].relationships, null, 2));
      }
    }

    if (included.length > 0) {
      console.log('\n=== INCLUDED ITEMS DEBUG ===');
      console.log('First included item:\n', JSON.stringify(included[0], null, 2));
    }

    let mappedRestaurants: Restaurant[] = [];
    try {
      mappedRestaurants = restaurants.map(r => mapRestaurant(r, included));
    } catch (mappingError) {
      console.error('Error during restaurant mapping:', mappingError);
      return NextResponse.json({
        success: false,
        data: [],
        error: 'Error processing restaurant data',
        details: mappingError instanceof Error ? mappingError.message : 'Unknown mapping error'
      }, { status: 500 });
    }

    if (mappedRestaurants.length > 0) {
      const sampleRest = mappedRestaurants[0];
      const sampleSource = restaurants[0];
      console.log('\n=== SAMPLE RESTAURANT RATING DATA (LIST VIEW) ===');
      console.log('Sample Restaurant Rating Data:', {
        name: sampleSource.attributes?.name,
        raw_reviews_score: sampleSource.attributes?.reviews_score,
        raw_google_rating: sampleSource.attributes?.google_rating,
        raw_reviews_count: sampleSource.attributes?.reviews_count,
        mapped_hh_rating: sampleRest.hh_rating,
        mapped_google_rating: sampleRest.google_rating,
        mapped_reviews_count: sampleRest.reviews_count,
        note: 'List API returns aggregated ratings (4.7/6672 for all). Suppressed to 0 to show New badge.'
      });
    }

    const requestedCityId = parseInt(city_id);
    const validCityMappings: { [key: number]: number[] } = {
      1: [1],
      2: [],
      3: []
    };

    const allowedCityIds = validCityMappings[requestedCityId];

    if (allowedCityIds) {
      if (allowedCityIds.length === 0) {
        console.log(`ℹ️ City ID ${requestedCityId} has no valid restaurants, returning empty array`);
        mappedRestaurants = [];
      } else {
        mappedRestaurants = mappedRestaurants.filter(restaurant => {
          const restaurantData = restaurants.find(r => String(r.id) === String(restaurant.id));
          const restaurantCityId = restaurantData?.attributes?.city_id;

          if (restaurantCityId && !allowedCityIds.includes(restaurantCityId)) {
            console.log(`⚠️ Filtering out restaurant ${restaurant.name} (city_id: ${restaurantCityId}, not in allowed: [${allowedCityIds.join(', ')}])`);
            return false;
          }
          return true;
        });
      }
    }

    console.log(`✓ Successfully mapped and filtered to ${mappedRestaurants.length} restaurants for city_id=${city_id}`);

    return NextResponse.json({
      success: true,
      data: mappedRestaurants,
      count: mappedRestaurants.length,
    });

  } catch (error) {
    console.error('API CRASH DETAILS:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const isTimeout = errorMessage.includes('aborted') || errorMessage.includes('timeout');
    const isNetworkError = errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('UND_ERR_SOCKET');

    return NextResponse.json({
      success: false,
      data: [],
      error: isTimeout ? 'Request timeout - API took too long to respond' :
             isNetworkError ? 'Network error - Unable to reach external API' :
             'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
