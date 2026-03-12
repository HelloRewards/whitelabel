import { NextResponse } from 'next/server';
import { generateHmacToken } from '@/lib/hmac-auth';

export const dynamic = 'force-dynamic';

interface HHReview {
  id: string | number;
  type?: string;
  attributes?: {
    reviewer_name?: string;
    user_name?: string;
    name?: string;
    rating?: number;
    score?: number;
    comment?: string;
    review?: string;
    text?: string;
    message?: string;
    created_at?: string;
    date?: string;
    reviewed_at?: string;
    user?: {
      name?: string;
    };
    [key: string]: any;
  };
  reviewer_name?: string;
  user_name?: string;
  rating?: number;
  comment?: string;
  review?: string;
  created_at?: string;
  [key: string]: any;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

function mapReview(hhReview: HHReview): Review | null {
  const attrs = hhReview.attributes || {};

  const name = attrs.user_name || attrs.reviewer_name || attrs.name || hhReview.user_name || hhReview.reviewer_name || attrs.user?.name || '';
  const rating = attrs.rating || attrs.score || hhReview.rating || 0;
  const comment = attrs.review || attrs.comment || attrs.text || attrs.message || hhReview.review || hhReview.comment || '';
  const date = attrs.created_at || attrs.date || attrs.reviewed_at || hhReview.created_at || '';

  if (!rating || rating === 0) {
    return null;
  }

  return {
    id: String(hhReview.id),
    name: name || 'Verified Diner',
    rating,
    comment: comment || '',
    date,
  };
}

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

    const url = new URL('api/vendor/v1/reviews.json', baseUrl);
    url.searchParams.append('restaurant_id', params.id);
    url.searchParams.append('page[number]', '1');
    url.searchParams.append('page[size]', '5');
    url.searchParams.append('sort', 'new');

    console.log('Fetching reviews:', url.toString());

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
      console.error(`Reviews API returned status ${response.status} for restaurant ${params.id}`);
      const text = await response.text();
      console.error('Response:', text.substring(0, 200));

      return NextResponse.json(
        { error: 'Reviews not found', status: response.status },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    console.log('RAW REVIEWS JSON:', JSON.stringify(responseData, null, 2));

    console.log('\n=== REVIEWS RESPONSE DEBUG ===');
    console.log('Response structure keys:', Object.keys(responseData));

    let reviews: HHReview[] = [];

    if (responseData.data && Array.isArray(responseData.data)) {
      reviews = responseData.data;
      console.log(`✓ Found ${reviews.length} reviews in data array`);
    } else if (responseData.reviews && Array.isArray(responseData.reviews)) {
      reviews = responseData.reviews;
      console.log(`✓ Found ${reviews.length} reviews in reviews array`);
    } else if (Array.isArray(responseData)) {
      reviews = responseData;
      console.log(`✓ Found ${reviews.length} reviews in root array`);
    }

    if (reviews.length > 0) {
      console.log('First review sample:\n', JSON.stringify(reviews[0], null, 2));
    }

    const mappedReviews = reviews.map(mapReview).filter((review): review is Review => review !== null);

    console.log(`✓ Successfully mapped ${mappedReviews.length} reviews for restaurant ${params.id}`);

    return NextResponse.json({
      success: true,
      data: mappedReviews,
    });

  } catch (error) {
    console.error('API CRASH DETAILS (Reviews):', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const isTimeout = errorMessage.includes('aborted') || errorMessage.includes('timeout');
    const isNetworkError = errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('UND_ERR_SOCKET');

    return NextResponse.json(
      {
        success: false,
        data: [],
        error: isTimeout ? 'Request timeout - API took too long to respond' :
               isNetworkError ? 'Network error - Unable to reach external API' :
               'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
