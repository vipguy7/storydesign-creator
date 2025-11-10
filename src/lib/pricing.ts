export interface PricingTier {
  quantity: number;
  pricePerUnit: number;
}

export interface Product {
  id: string;
  name: string;
  category: "photo_printing" | "graphic_design";
  basePrice: number;
  unit: string;
  description: string;
  tiers?: PricingTier[];
  options?: {
    name: string;
    additionalCost: number;
  }[];
}

export interface PackageDeal {
  id: string;
  name: string;
  description: string;
  products: {
    productId: string;
    quantity: number;
  }[];
  regularPrice: number;
  discountedPrice: number;
  savingsPercent: number;
}

export const PRODUCTS: Product[] = [
  // Photo Printing Services
  {
    id: "photo-book-25",
    name: "Photo Book (25 pages)",
    category: "photo_printing",
    basePrice: 12000,
    unit: "book",
    description: "A5 dimension, premium photopaper",
    tiers: [
      { quantity: 1, pricePerUnit: 12000 },
      { quantity: 5, pricePerUnit: 11000 },
      { quantity: 10, pricePerUnit: 10000 },
    ],
  },
  {
    id: "photo-book-50",
    name: "Photo Book (50 pages)",
    category: "photo_printing",
    basePrice: 20000,
    unit: "book",
    description: "A5 dimension, premium photopaper",
    tiers: [
      { quantity: 1, pricePerUnit: 20000 },
      { quantity: 5, pricePerUnit: 18500 },
      { quantity: 10, pricePerUnit: 17000 },
    ],
  },
  {
    id: "notebook-25",
    name: "Note Book (25 pages)",
    category: "photo_printing",
    basePrice: 8000,
    unit: "book",
    description: "A5 dimension, 80g paper, custom cover",
    tiers: [
      { quantity: 1, pricePerUnit: 8000 },
      { quantity: 5, pricePerUnit: 7500 },
      { quantity: 10, pricePerUnit: 7000 },
    ],
  },
  {
    id: "notebook-50",
    name: "Note Book (50 pages)",
    category: "photo_printing",
    basePrice: 13000,
    unit: "book",
    description: "A5 dimension, 80g paper, custom cover",
    tiers: [
      { quantity: 1, pricePerUnit: 13000 },
      { quantity: 5, pricePerUnit: 12000 },
      { quantity: 10, pricePerUnit: 11000 },
    ],
  },
  {
    id: "calendar-mini",
    name: "Table Calendar (Mini)",
    category: "photo_printing",
    basePrice: 15000,
    unit: "calendar",
    description: "5in H x 7in W, 12 pages, laminated",
    options: [
      { name: "Full page photo customizable", additionalCost: 2000 },
      { name: "Myanmar version", additionalCost: 0 },
    ],
  },
  {
    id: "calendar-large",
    name: "Table Calendar (Large)",
    category: "photo_printing",
    basePrice: 25000,
    unit: "calendar",
    description: "7in H x 10in W, 12 pages, laminated",
    options: [
      { name: "Full page photo customizable", additionalCost: 3000 },
      { name: "Myanmar version", additionalCost: 0 },
    ],
  },
  {
    id: "photo-print-4x6",
    name: "Photo Print (4x6)",
    category: "photo_printing",
    basePrice: 500,
    unit: "print",
    description: "High-quality photopaper",
    tiers: [
      { quantity: 1, pricePerUnit: 500 },
      { quantity: 10, pricePerUnit: 450 },
      { quantity: 50, pricePerUnit: 400 },
      { quantity: 100, pricePerUnit: 350 },
    ],
  },
  {
    id: "photo-print-5x7",
    name: "Photo Print (5x7)",
    category: "photo_printing",
    basePrice: 1000,
    unit: "print",
    description: "High-quality photopaper",
    tiers: [
      { quantity: 1, pricePerUnit: 1000 },
      { quantity: 10, pricePerUnit: 900 },
      { quantity: 50, pricePerUnit: 850 },
    ],
  },
  {
    id: "photo-pin",
    name: "Photo Pin",
    category: "photo_printing",
    basePrice: 2000,
    unit: "pin",
    description: "Wearable photo pin, custom image",
    tiers: [
      { quantity: 1, pricePerUnit: 2000 },
      { quantity: 5, pricePerUnit: 1800 },
      { quantity: 10, pricePerUnit: 1600 },
    ],
  },
  {
    id: "photo-fan-mini",
    name: "Photo Fan (Mini)",
    category: "photo_printing",
    basePrice: 3000,
    unit: "fan",
    description: "Small handheld fan with custom photo",
  },
  {
    id: "photo-fan-big",
    name: "Photo Fan (Big)",
    category: "photo_printing",
    basePrice: 5000,
    unit: "fan",
    description: "Large handheld fan with custom photo",
  },
  {
    id: "fan-gifts",
    name: "Fan Supporting Gifts",
    category: "photo_printing",
    basePrice: 1500,
    unit: "item",
    description: "Various K-pop fan merchandise",
    tiers: [
      { quantity: 1, pricePerUnit: 1500 },
      { quantity: 5, pricePerUnit: 1300 },
      { quantity: 10, pricePerUnit: 1200 },
    ],
  },
  // Graphic Design Services
  {
    id: "logo-design",
    name: "Logo Design",
    category: "graphic_design",
    basePrice: 50000,
    unit: "project",
    description: "Professional logo with 3 concepts & unlimited revisions",
  },
  {
    id: "ad-design",
    name: "Advertisement Design",
    category: "graphic_design",
    basePrice: 30000,
    unit: "design",
    description: "Print or digital ad design",
    tiers: [
      { quantity: 1, pricePerUnit: 30000 },
      { quantity: 3, pricePerUnit: 27000 },
      { quantity: 5, pricePerUnit: 25000 },
    ],
  },
  {
    id: "branding-package",
    name: "Branding Package",
    category: "graphic_design",
    basePrice: 150000,
    unit: "package",
    description: "Complete brand identity: logo, colors, fonts, guidelines",
  },
  {
    id: "social-media-design",
    name: "Social Media Design",
    category: "graphic_design",
    basePrice: 15000,
    unit: "design",
    description: "Custom graphics for Facebook, Instagram, etc.",
    tiers: [
      { quantity: 1, pricePerUnit: 15000 },
      { quantity: 5, pricePerUnit: 13000 },
      { quantity: 10, pricePerUnit: 12000 },
    ],
  },
  {
    id: "vinyl-billboard",
    name: "Vinyl & Billboard Design",
    category: "graphic_design",
    basePrice: 80000,
    unit: "design",
    description: "Large format advertisement design",
  },
];

export const PACKAGE_DEALS: PackageDeal[] = [
  {
    id: "kpop-fan-bundle",
    name: "K-pop Fan Bundle",
    description: "Perfect starter pack for K-pop fans!",
    products: [
      { productId: "photo-book-25", quantity: 1 },
      { productId: "photo-pin", quantity: 3 },
      { productId: "photo-fan-mini", quantity: 1 },
      { productId: "fan-gifts", quantity: 2 },
    ],
    regularPrice: 23000,
    discountedPrice: 19000,
    savingsPercent: 17,
  },
  {
    id: "calendar-set",
    name: "Calendar Gift Set",
    description: "Mini & Large calendar combo for home and office",
    products: [
      { productId: "calendar-mini", quantity: 1 },
      { productId: "calendar-large", quantity: 1 },
    ],
    regularPrice: 40000,
    discountedPrice: 35000,
    savingsPercent: 13,
  },
  {
    id: "memory-keeper",
    name: "Memory Keeper Package",
    description: "Preserve your precious moments",
    products: [
      { productId: "photo-book-50", quantity: 1 },
      { productId: "photo-print-4x6", quantity: 20 },
      { productId: "photo-print-5x7", quantity: 5 },
    ],
    regularPrice: 34000,
    discountedPrice: 28000,
    savingsPercent: 18,
  },
  {
    id: "business-starter",
    name: "Business Starter Pack",
    description: "Everything you need to launch your brand",
    products: [
      { productId: "logo-design", quantity: 1 },
      { productId: "ad-design", quantity: 2 },
      { productId: "social-media-design", quantity: 5 },
    ],
    regularPrice: 185000,
    discountedPrice: 150000,
    savingsPercent: 19,
  },
  {
    id: "social-media-boost",
    name: "Social Media Boost",
    description: "1 month of consistent social media graphics",
    products: [
      { productId: "social-media-design", quantity: 12 },
    ],
    regularPrice: 180000,
    discountedPrice: 120000,
    savingsPercent: 33,
  },
];

export const calculatePrice = (productId: string, quantity: number): number => {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return 0;

  if (product.tiers) {
    // Find the applicable tier
    const applicableTier = [...product.tiers]
      .reverse()
      .find(tier => quantity >= tier.quantity);
    
    return applicableTier 
      ? applicableTier.pricePerUnit * quantity 
      : product.basePrice * quantity;
  }

  return product.basePrice * quantity;
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} MMK`;
};
