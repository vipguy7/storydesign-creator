export enum PostType {
  PROMOTION = "Promotion",
  NEW_PRODUCT = "New Product Introduction",
  SPECIAL_SALES = "Special Sales",
  SALE_PACKAGE_PROMO = "Sale Package Promo",
  ENGAGING_CONTENT = "Engaging Content",
  KNOWLEDGE_SHARING = "Knowledge Sharing",
  TRADITIONAL_EVENT = "Myanmar Traditional Event",
  SEASONAL_CONTENT = "Seasonal Content",
  BEHIND_THE_SCENES = "Behind The Scenes",
  CUSTOMER_TESTIMONIAL = "Customer Testimonial",
}

export enum PostTone {
  FRIENDLY = "Friendly & Casual",
  EMOTIONAL = "Emotional & Heartfelt",
  PROFESSIONAL = "Professional & Polished",
  URGENT = "Urgent & Action-Driven",
  PLAYFUL = "Playful & Fun",
  INSPIRATIONAL = "Inspirational & Motivating",
  TRENDY = "Trendy & Hip",
  LUXURIOUS = "Luxurious & Premium",
}

export enum ContentStyle {
  STORYTELLING = "Storytelling (ပုံပြင်ပုံစံ)",
  QUESTION_HOOK = "Question Hook (မေးခွန်းပုံစံ)",
  BOLD_STATEMENT = "Bold Statement (တောင့်တင်းသော ပြောဆို)",
  TRENDING_MOMENT = "Trending Moment (လက်ရှိခေတ်စားနေသော)",
  EMOTIONAL_APPEAL = "Emotional Appeal (စိတ်ခံစားမှု ထိတွေ့)",
  PROBLEM_SOLUTION = "Problem Solution (ပြဿနာ & အဖြေ)",
  FOMO_TRIGGER = "FOMO Trigger (လက်လွတ်မခံချင်စိတ်)",
  EXCLUSIVE_REVEAL = "Exclusive Reveal (သီးသန့် ထုတ်ဖော်)",
}

export const PRODUCTS = [
  // Photo Printing Services
  {
    name: "Photo Book",
    description: "Premium photo books - 25 or 50 pages, A5 dimension, high-quality photopaper. Perfect for memories and gifts."
  },
  {
    name: "Note Book",
    description: "Custom notebooks - 25 or 50 pages, A5 dimension, 80g paper. Personalized covers with your photos."
  },
  {
    name: "Table Calendar (Mini)",
    description: "Compact desk calendar - 12 pages, 5in H x 7in W, English/Myanmar versions, full/half page photo customizable, laminated."
  },
  {
    name: "Table Calendar (Large)",
    description: "Premium desk calendar - 12 pages, 7in H x 10in W, English/Myanmar versions, full/half page photo customizable, laminated."
  },
  {
    name: "Customized Photo Printing",
    description: "High-quality photo prints in various sizes. Perfect for framing, display, or gifts."
  },
  {
    name: "Customized Photo Pin",
    description: "Wearable photo pins with your favorite images. Great for K-pop fans and personal collections."
  },
  {
    name: "Customized Photo Fan",
    description: "Photo fans in big and mini sizes. Popular for K-pop events and personal use."
  },
  {
    name: "Fan Supporting Gifts",
    description: "Various fan merchandise and supporting gifts. Perfect for K-pop concerts and fan meetings."
  },
  {
    name: "Customized Keychain",
    description: "Personalized keychains - 2.5in W x 1.5in H. Perfect for bags, keys, and K-pop collections."
  },
  {
    name: "Mini Notebook",
    description: "Customized mini notebook with photo overlay - 4in W x 6in H, lined pages. Perfect for daily notes and journaling."
  },
  {
    name: "Photocards Mini",
    description: "Mini photocards - 2in W x 3in H. Collect and trade your favorite designs, perfect for K-pop fans."
  },
  // Graphic Design Services
  {
    name: "Logo Design",
    description: "Professional logo design services. Create a unique and memorable brand identity."
  },
  {
    name: "Advertisement Designs",
    description: "Eye-catching advertisement designs for print and digital media. Boost your marketing impact."
  },
  {
    name: "Branding Design",
    description: "Complete branding solutions including visual identity, style guides, and brand materials."
  },
  {
    name: "Social Media Designs",
    description: "Promotional designs for Facebook, Instagram, and other platforms. Engaging visuals that drive results."
  },
  {
    name: "Vinyl & Billboard Designs",
    description: "Large format advertisement designs for vinyl prints and billboards. Maximum visibility and impact."
  }
];

export const BUSINESS_CONTEXT = {
  name: "Story Design",
  location: "Myanmar",
  facebook: "www.facebook.com/storydesignmm",
  description: "A vibrant printing and graphic design business specializing in creative solutions for K-pop fans and young Myanmar audiences.",
  primaryAudience: "K-pop fans aged 15-30, looking for trendy and creative design products",
  secondaryAudience: "Small businesses and individuals needing professional printing services",
  style: "Friendly, emotional, trendy with Burmese cultural elements"
};
