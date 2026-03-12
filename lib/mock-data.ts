export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  coverImage: string;
  heroImage: string;
  description: string;
  maxMiles: number;
  rating: number;
  distance: string;
  isPremium: boolean;
  isBuffet: boolean;
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

export const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "The Golden Dragon",
    cuisine: "Chinese",
    coverImage: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Experience authentic Chinese cuisine with our signature dishes prepared by master chefs. Our elegant dining space combines traditional elements with modern comfort.",
    maxMiles: 500,
    rating: 4.8,
    distance: "1.2 km",
    isPremium: true,
    isBuffet: false,
    packages: [
      {
        id: "1-1",
        name: "Standard Dine-in",
        description: "Perfect for casual dining with friends and family",
        price: 1500,
        miles: 300,
        features: ["Valid for 2 people", "À la carte menu", "Complimentary tea"]
      },
      {
        id: "1-2",
        name: "Premium Party Pack",
        description: "Celebrate special occasions with our curated menu",
        price: 4500,
        miles: 500,
        features: ["Valid for 6 people", "Set menu with premium dishes", "Complimentary dessert", "Private dining area"]
      }
    ]
  },
  {
    id: "2",
    name: "Bella Italia",
    cuisine: "Italian",
    coverImage: "https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Indulge in handcrafted pasta and wood-fired pizzas in a warm, rustic atmosphere. Every dish tells a story of Italian tradition.",
    maxMiles: 450,
    rating: 4.6,
    distance: "2.5 km",
    isPremium: true,
    isBuffet: false,
    packages: [
      {
        id: "2-1",
        name: "Lunch Special",
        description: "Great value lunch experience",
        price: 1200,
        miles: 250,
        features: ["Valid for 2 people", "Lunch menu", "Complimentary breadsticks"]
      },
      {
        id: "2-2",
        name: "Romantic Dinner",
        description: "An intimate evening for two",
        price: 3500,
        miles: 450,
        features: ["Valid for 2 people", "3-course meal", "Complimentary wine", "Candlelight setup"]
      }
    ]
  },
  {
    id: "3",
    name: "Spice Paradise",
    cuisine: "Indian",
    coverImage: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Discover the rich flavors of India with our diverse menu featuring regional specialties and tandoor delights.",
    maxMiles: 400,
    rating: 4.7,
    distance: "0.8 km",
    isPremium: false,
    isBuffet: true,
    packages: [
      {
        id: "3-1",
        name: "Buffet Lunch",
        description: "All-you-can-eat lunch buffet",
        price: 999,
        miles: 200,
        features: ["Valid for 1 person", "Unlimited buffet access", "Includes beverages"]
      },
      {
        id: "3-2",
        name: "Family Feast",
        description: "Perfect for family gatherings",
        price: 3500,
        miles: 400,
        features: ["Valid for 4 people", "Unlimited buffet access", "Premium dishes included", "Private seating"]
      }
    ]
  },
  {
    id: "4",
    name: "Sakura Sushi Bar",
    cuisine: "Japanese",
    coverImage: "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Fresh sushi and sashimi prepared by skilled chefs. Experience the art of Japanese cuisine in a zen-inspired setting.",
    maxMiles: 480,
    rating: 4.9,
    distance: "3.1 km",
    isPremium: true,
    isBuffet: false,
    packages: [
      {
        id: "4-1",
        name: "Sushi Combo",
        description: "A selection of our finest sushi",
        price: 1800,
        miles: 350,
        features: ["Valid for 2 people", "Chef's selection", "Miso soup included"]
      },
      {
        id: "4-2",
        name: "Omakase Experience",
        description: "Let the chef surprise you",
        price: 5500,
        miles: 480,
        features: ["Valid for 2 people", "15-course tasting menu", "Premium sake pairing", "Chef's table seating"]
      }
    ]
  },
  {
    id: "5",
    name: "The Grill House",
    cuisine: "Steakhouse",
    coverImage: "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Premium cuts of meat grilled to perfection. Our steakhouse offers a sophisticated dining experience for meat lovers.",
    maxMiles: 500,
    rating: 4.8,
    distance: "1.9 km",
    isPremium: true,
    isBuffet: false,
    packages: [
      {
        id: "5-1",
        name: "Classic Steak Dinner",
        description: "Traditional steakhouse experience",
        price: 2200,
        miles: 400,
        features: ["Valid for 2 people", "Choice of cuts", "Side dishes included"]
      },
      {
        id: "5-2",
        name: "VIP Grill Package",
        description: "Ultimate steakhouse indulgence",
        price: 6000,
        miles: 500,
        features: ["Valid for 4 people", "Premium aged beef", "Full course meal", "Sommelier service"]
      }
    ]
  },
  {
    id: "6",
    name: "Seafood Haven",
    cuisine: "Seafood",
    coverImage: "https://images.pexels.com/photos/1485657/pexels-photo-1485657.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/1485657/pexels-photo-1485657.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Fresh catch daily. Enjoy the finest seafood in a coastal-inspired atmosphere with ocean views.",
    maxMiles: 420,
    rating: 4.5,
    distance: "4.2 km",
    isPremium: false,
    isBuffet: true,
    packages: [
      {
        id: "6-1",
        name: "Seafood Platter",
        description: "A variety of fresh seafood",
        price: 1600,
        miles: 300,
        features: ["Valid for 2 people", "Mixed seafood platter", "House sauce"]
      },
      {
        id: "6-2",
        name: "Ocean Buffet",
        description: "All-you-can-eat seafood extravaganza",
        price: 3200,
        miles: 420,
        features: ["Valid for 4 people", "Unlimited buffet", "Live cooking stations", "Premium shellfish included"]
      }
    ]
  }
];

export const getUserMiles = () => 15420;
