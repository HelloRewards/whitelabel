const THB_TO_SGD = 0.041;

interface PriceSummary {
  lowest_price?: string;
  highest_price?: string;
  package_type?: string;
  pricing_type?: string;
}

export interface HHRestaurant {
  id: string | number;
  type?: string;
  attributes?: {
    name?: string;
    cuisine?: string;
    category?: string;
    cover_image?: string;
    cover_image_url?: string;
    image_cover_url?: string;
    image?: string;
    image_url?: string;
    hero_image?: string;
    hero_image_url?: string;
    banner_image?: string;
    banner_image_url?: string;
    thumbnail?: string;
    thumbnail_url?: string;
    description?: string;
    max_miles?: number;
    points?: number;
    rating?: number;
    reviews_score?: number;
    reviews_count?: number;
    distance?: string;
    is_premium?: boolean;
    premium?: boolean;
    is_buffet?: boolean;
    buffet?: boolean;
    address?: string;
    lat?: string;
    lng?: string;
    latitude?: string;
    longitude?: string;
    location?: string;
    neighborhood?: string;
    area?: string;
    zone?: string;
    price_summaries?: PriceSummary[];
    [key: string]: any;
  };
  name?: string;
  cuisine?: string;
  category?: string;
  cover_image?: string;
  image?: string;
  hero_image?: string;
  description?: string;
  max_miles?: number;
  points?: number;
  rating?: number;
  distance?: string;
  is_premium?: boolean;
  premium?: boolean;
  is_buffet?: boolean;
  buffet?: boolean;
  packages?: HHPackage[];
  deals?: HHPackage[];
  relationships?: any;
  [key: string]: any;
}

export interface HHPackage {
  id: string | number;
  type?: string;
  attributes?: {
    name?: string;
    title?: string;
    description?: string;
    price?: number;
    original_price?: number;
    miles?: number;
    points?: number;
    features?: string[];
    inclusions?: string[];
  };
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  original_price?: number;
  miles?: number;
  points?: number;
  features?: string[];
  inclusions?: string[];
}

export interface Restaurant {
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

export interface DiningPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  miles: number;
  features: string[];
}

export function scrubText(text: string): string {
  if (!text) return '';
  return text
    .replace(/Hungry Hub/gi, 'Hello Rewards Exclusive')
    .replace(/HungryHub/gi, 'HelloRewards');
}

function extractPriceThb(pkg: HHPackage): number {
  if (!pkg) {
    console.warn('extractPriceThb: Package is null or undefined, returning default price');
    return 850;
  }

  const attrs = pkg.attributes || pkg;

  const priceKeys = ['price', 'net_price', 'price_after_discount', 'original_price'];

  for (const key of priceKeys) {
    const value = (attrs as any)?.[key] || (pkg as any)?.[key];
    if (value != null) {
      const strValue = String(value);
      let parsed = parseFloat(strValue);

      if (!isNaN(parsed) && parsed > 0) {
        const hasDecimal = strValue.includes('.');

        if (hasDecimal && parsed < 200) {
          parsed = parsed * 10;
        } else if (!hasDecimal && parsed >= 100 && parsed < 300) {
          parsed = parsed * 10;
        }

        if (parsed >= 500) {
          return Math.round(parsed);
        }
      }
    }
  }

  const name = ((attrs?.name || attrs?.title || pkg?.name || pkg?.title) || '').toLowerCase();
  if (name.includes('all you can eat') || name.includes('ayce') || name.includes('buffet')) {
    return 990;
  }
  if (name.includes('set menu')) {
    return 1200;
  }
  if (name.includes('party') || name.includes('group')) {
    return 2500;
  }

  return 850;
}

export function mapPackage(pkg: HHPackage, restaurantId: string): DiningPackage {
  if (!pkg) {
    console.warn('mapPackage: Package is null or undefined, returning default package');
    return {
      id: `${restaurantId}-default`,
      name: 'Dining Package',
      description: 'Contact restaurant for details',
      price: 35,
      miles: 105,
      features: []
    };
  }

  const attrs = pkg.attributes || pkg;

  const name = attrs?.name || attrs?.title || pkg?.name || pkg?.title || '';
  const description = attrs?.description || pkg?.description || '';

  const rawThb = extractPriceThb(pkg);
  const priceInSgd = Math.round(rawThb * THB_TO_SGD);
  const miles = priceInSgd * 3;

  const features = attrs?.features || attrs?.inclusions || pkg?.features || pkg?.inclusions || [];

  return {
    id: `${restaurantId}-${pkg.id || 'unknown'}`,
    name: scrubText(name),
    description: scrubText(description),
    price: priceInSgd,
    miles,
    features: Array.isArray(features) ? features : [],
  };
}

function extractImageUrl(attrs: any, rootObj: any): string {
  const possibleKeys = [
    'cover_image_url', 'image_cover_url', 'cover_image',
    'banner_image_url', 'banner_image',
    'hero_image_url', 'hero_image',
    'image_url', 'image',
    'thumbnail_url', 'thumbnail'
  ];

  for (const key of possibleKeys) {
    const attrValue = attrs?.[key];
    if (attrValue && typeof attrValue === 'string' && attrValue.startsWith('http')) {
      return attrValue;
    }
  }

  for (const key of possibleKeys) {
    const rootValue = rootObj?.[key];
    if (rootValue && typeof rootValue === 'string' && rootValue.startsWith('http')) {
      return rootValue;
    }
  }

  return '';
}

function proxyImageUrl(originalUrl: string): string {
  if (!originalUrl || originalUrl === '') {
    return '';
  }
  return `/api/images?url=${encodeURIComponent(originalUrl)}`;
}

export function mapRestaurant(hhRestaurant: HHRestaurant, included?: any[], isDetailView: boolean = false): Restaurant {
  try {
    if (!hhRestaurant) {
      console.error('mapRestaurant: Restaurant data is null or undefined');
      throw new Error('mapRestaurant: Restaurant data is null or undefined');
    }

    const originalId = String(hhRestaurant.id || 'unknown');
    const attrs = hhRestaurant.attributes || {};

    const name = attrs?.name || hhRestaurant?.name || '';
  const cuisine = attrs.cuisine || attrs.category || hhRestaurant.cuisine || hhRestaurant.category || '';

  const originalCoverImage = extractImageUrl(attrs, hhRestaurant);
  const coverImage = proxyImageUrl(originalCoverImage);
  const heroImage = coverImage;

  const description = attrs.description || hhRestaurant.description || '';
  const maxMiles = attrs.max_miles || attrs.points || hhRestaurant.max_miles || hhRestaurant.points || 0;

  const hh_rating = isDetailView
    ? (attrs.reviews_score || attrs.rating || attrs.avg_rating || attrs.average_rating || hhRestaurant.rating || 0)
    : 0;
  const google_rating = isDetailView ? (attrs.google_rating || 0) : 0;
  const reviews_count = isDetailView ? (attrs.reviews_count || attrs.review_count || 0) : 0;

  const rating = hh_rating;
  const reviews = reviews_count;

  const distance = attrs.distance || hhRestaurant.distance || '';
  const isPremium = attrs.is_premium || attrs.premium || hhRestaurant.is_premium || hhRestaurant.premium || false;
  const isBuffet = attrs.is_buffet || attrs.buffet || hhRestaurant.is_buffet || hhRestaurant.buffet || false;

  const address = attrs.address || '';
  const latitude = attrs.lat || attrs.latitude || '';
  const longitude = attrs.lng || attrs.longitude || '';
  const neighborhood = attrs.location || attrs.neighborhood || attrs.area || attrs.zone || '';

  let packages: HHPackage[] = hhRestaurant.packages || hhRestaurant.deals || [];

  if (included && Array.isArray(included) && included.length > 0) {
    const packageRelationships = hhRestaurant.relationships?.packages?.data ||
                                 hhRestaurant.relationships?.deals?.data ||
                                 hhRestaurant.relationships?.restaurant_packages?.data || [];

    if (packageRelationships && packageRelationships.length > 0) {
      packages = included.filter((item: any) =>
        (item.type === 'package' || item.type === 'deal' || item.type === 'restaurant_packages') &&
        packageRelationships.some((rel: any) => String(rel.id) === String(item.id))
      );
    } else {
      const packageItems = included.filter((item: any) =>
        item.type === 'package' || item.type === 'deal' || item.type === 'restaurant_packages'
      );
      if (packageItems.length > 0) {
        packages = packageItems;
      }
    }
  }

  if (packages.length === 0 && attrs.price_summaries && Array.isArray(attrs.price_summaries)) {
    packages = attrs.price_summaries.map((summary: PriceSummary, index: number) => {
      const packageTypeNames: { [key: string]: string } = {
        'pp': 'Set Menu Package',
        'ayce': 'All You Can Eat',
        'xp': 'Experience Package'
      };

      const cleanPrice = (priceStr: string) => {
        const strValue = String(priceStr);
        const numericStr = strValue.replace(/[^\d.]/g, '');
        let parsed = parseFloat(numericStr) || 0;

        if (parsed > 0) {
          const hasDecimal = strValue.includes('.');

          if (hasDecimal && parsed < 200) {
            parsed = parsed * 10;
          } else if (!hasDecimal && parsed >= 100 && parsed < 300) {
            parsed = parsed * 10;
          }
        }

        if (parsed < 500) {
          const pkgType = summary.package_type || '';
          if (pkgType === 'ayce') return 990;
          if (pkgType === 'pp') return 1200;
          return 850;
        }

        return Math.round(parsed);
      };

      const lowestPriceThb = cleanPrice(summary.lowest_price || '0');
      const highestPriceThb = cleanPrice(summary.highest_price || '0');
      const lowestPriceSgd = Math.round(lowestPriceThb * 0.041);
      const highestPriceSgd = Math.round(highestPriceThb * 0.041);

      return {
        id: `${originalId}-${summary.package_type || index}`,
        type: 'price_summary',
        attributes: {
          name: packageTypeNames[summary.package_type || ''] || 'Dining Package',
          description: `${summary.pricing_type === 'per_person' ? 'Per person' : 'Per package'} pricing`,
          price: lowestPriceSgd,
          original_price: highestPriceSgd,
          miles: 0,
          points: 0,
          features: [
            `Price range: S$${lowestPriceSgd} - S$${highestPriceSgd}`,
            `Type: ${summary.package_type || 'standard'}`
          ]
        }
      } as HHPackage;
    });
  }

    return {
      id: originalId,
      hr_id: originalId,
      name: scrubText(name),
      cuisine: scrubText(cuisine),
      coverImage,
      heroImage,
      description: scrubText(description),
      maxMiles,
      hh_rating,
      google_rating,
      reviews_count,
      rating,
      reviews,
      distance,
      isPremium,
      isBuffet,
      address: scrubText(address),
      latitude,
      longitude,
      neighborhood: scrubText(neighborhood),
      packages: packages.map(pkg => mapPackage(pkg, originalId)),
    };
  } catch (error) {
    console.error('Error mapping restaurant:', error);
    console.error('Restaurant data:', JSON.stringify(hhRestaurant, null, 2).substring(0, 500));

    return {
      id: String(hhRestaurant?.id || 'error'),
      hr_id: String(hhRestaurant?.id || 'error'),
      name: 'Restaurant (Error Loading)',
      cuisine: 'Various',
      coverImage: '',
      heroImage: '',
      description: 'Unable to load restaurant details',
      maxMiles: 0,
      hh_rating: 0,
      google_rating: 0,
      reviews_count: 0,
      rating: 0,
      reviews: 0,
      distance: '',
      isPremium: false,
      isBuffet: false,
      address: '',
      latitude: '',
      longitude: '',
      neighborhood: '',
      packages: []
    };
  }
}
