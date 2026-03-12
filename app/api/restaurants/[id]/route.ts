import { NextResponse } from 'next/server';
import { generateHmacToken } from '@/lib/hmac-auth';
import { mapRestaurant, type HHRestaurant } from '@/lib/restaurant-mapper';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const url = new URL(`api/vendor/v1/restaurants/${params.id}.json`, baseUrl);
    url.searchParams.append('locale', 'en');
    url.searchParams.append('include_pictures', 'true');

    console.log('Fetching restaurant details:', url.toString());

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
      console.error(`API returned status ${response.status} for restaurant ${params.id}`);
      const text = await response.text();
      console.error('Response:', text.substring(0, 200));

      return NextResponse.json(
        { error: 'Restaurant not found', status: response.status },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('\n=== DETAIL RESPONSE DEBUG ===');
    console.log('Response structure keys:', Object.keys(responseData));
    console.log('Full detail response:\n', JSON.stringify(responseData, null, 2));

    let restaurant: HHRestaurant | null = null;
    let included: any[] = [];

    if (responseData.data) {
      restaurant = responseData.data;
      included = responseData.included || [];
      console.log(`✓ Found restaurant data with ${included.length} included items`);
    } else if (responseData.restaurant) {
      restaurant = responseData.restaurant;
      console.log('✓ Found restaurant in responseData.restaurant');
    } else {
      restaurant = responseData;
      console.log('✓ Using root response as restaurant');
    }

    if (!restaurant) {
      console.error('❌ Restaurant data not found in response');
      return NextResponse.json(
        { error: 'Restaurant data not found' },
        { status: 404 }
      );
    }

    console.log('\n=== RESTAURANT DATA DEBUG ===');
    console.log('Restaurant fields:', Object.keys(restaurant));
    if (restaurant.attributes) {
      console.log('Attributes keys:', Object.keys(restaurant.attributes));
      console.log('Attributes:\n', JSON.stringify(restaurant.attributes, null, 2));
      console.log('\nRating fields check:');
      console.log('  - attributes.rating:', restaurant.attributes.rating);
      console.log('  - attributes.reviews_score:', restaurant.attributes.reviews_score);
      console.log('  - attributes.avg_rating:', restaurant.attributes.avg_rating);
      console.log('  - attributes.average_rating:', restaurant.attributes.average_rating);
    }
    if (restaurant.relationships) {
      console.log('Relationships:\n', JSON.stringify(restaurant.relationships, null, 2));
    }

    if (included.length > 0) {
      console.log('\n=== PACKAGES DEBUG ===');
      const packages = included.filter((i: any) => i.type === 'package' || i.type === 'deal');
      console.log(`Found ${packages.length} packages in included`);
      if (packages.length > 0) {
        console.log('First package:\n', JSON.stringify(packages[0], null, 2));
      }
    }

    let mappedRestaurant;
    try {
      mappedRestaurant = mapRestaurant(restaurant, included, true);
    } catch (mappingError) {
      console.error('Error during restaurant mapping:', mappingError);
      return NextResponse.json({
        success: false,
        error: 'Error processing restaurant data',
        details: mappingError instanceof Error ? mappingError.message : 'Unknown mapping error'
      }, { status: 500 });
    }

    console.log(`\n✓ Successfully mapped restaurant ${params.id}`);
    console.log(`  - Name: ${mappedRestaurant.name}`);
    console.log(`  - Cover: ${mappedRestaurant.coverImage}`);
    console.log(`  - Hero: ${mappedRestaurant.heroImage}`);
    console.log(`  - Packages: ${mappedRestaurant.packages.length}`);
    console.log('\n=== RESTAURANT RATING DATA (DETAIL VIEW) ===');
    console.log('Restaurant Rating Data:', {
      name: restaurant.attributes?.name,
      raw_reviews_score: restaurant.attributes?.reviews_score,
      raw_google_rating: restaurant.attributes?.google_rating,
      raw_reviews_count: restaurant.attributes?.reviews_count,
      mapped_hh_rating: mappedRestaurant.hh_rating,
      mapped_google_rating: mappedRestaurant.google_rating,
      mapped_reviews_count: mappedRestaurant.reviews_count,
      note: 'Detail API returns accurate per-restaurant ratings'
    });

    return NextResponse.json({
      success: true,
      data: mappedRestaurant,
    });

  } catch (error) {
    console.error('API CRASH DETAILS:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const isTimeout = errorMessage.includes('aborted') || errorMessage.includes('timeout');
    const isNetworkError = errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('UND_ERR_SOCKET');

    return NextResponse.json(
      {
        error: isTimeout ? 'Request timeout - API took too long to respond' :
               isNetworkError ? 'Network error - Unable to reach external API' :
               'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
