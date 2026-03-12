import { NextResponse } from 'next/server';
import { generateHmacToken } from '@/lib/hmac-auth';

interface HHCity {
  id: string | number;
  type?: string;
  attributes?: {
    id?: number;
    name?: string;
    [key: string]: any;
  };
  name?: string;
  [key: string]: any;
}

interface City {
  id: string;
  name: string;
}

function mapCity(hhCity: HHCity): City {
  const id = String(hhCity.id || hhCity.attributes?.id || '');
  const name = hhCity.attributes?.name || hhCity.name || '';

  return {
    id,
    name,
  };
}

export async function GET() {
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

    const url = new URL('api/vendor/v1/cities.json', baseUrl);

    console.log('Fetching cities from:', url.toString());

    const token = generateHmacToken(url, 'GET', apiKey, apiSecretKey);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`❌ Cities API returned status ${response.status}`);
      const text = await response.text();
      console.error('Response:', text.substring(0, 200));

      return NextResponse.json({
        success: false,
        data: [],
        error: `API error: ${response.status}`
      }, { status: response.status });
    }

    const responseData = await response.json();
    console.log('\n=== CITIES API RESPONSE DEBUG ===');
    console.log('Response structure keys:', Object.keys(responseData));

    let cities: HHCity[] = [];

    if (Array.isArray(responseData)) {
      cities = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      cities = responseData.data;
      console.log(`✓ Found ${cities.length} cities in response.data`);
    } else if (responseData.cities && Array.isArray(responseData.cities)) {
      cities = responseData.cities;
    } else if (responseData.results && Array.isArray(responseData.results)) {
      cities = responseData.results;
    }

    if (cities.length === 0) {
      console.error('❌ No cities found in API response');
      return NextResponse.json({
        success: false,
        data: [],
        error: 'No cities found in API response'
      });
    }

    const mappedCities: City[] = cities.map(mapCity);

    console.log(`✓ Successfully mapped ${mappedCities.length} cities`);

    return NextResponse.json({
      success: true,
      data: mappedCities,
      count: mappedCities.length,
    });

  } catch (error) {
    console.error('❌ Error fetching cities:', error);

    return NextResponse.json({
      success: false,
      data: [],
      error: 'Internal server error'
    }, { status: 500 });
  }
}
