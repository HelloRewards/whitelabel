import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'force-cache',
    });

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageUrl}, status: ${imageResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: imageResponse.status }
      );
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
