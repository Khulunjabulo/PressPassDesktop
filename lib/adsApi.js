// lib/adsApi.js
export const mockAdsData = {
  banners: [
    {
      id: "banner_1",
      type: "banner",
      size: { width: 728, height: 90 },
      title: "Premium Coffee Beans",
      description: "Get 20% off your first order",
      image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=728&h=90&fit=crop",
      backgroundColor: "#8B4513",
      textColor: "#FFFFFF",
      buttonText: "Shop Now",
      link: "#coffee-ad",
      company: "Coffee Co."
    },
    {
      id: "banner_2", 
      type: "banner",
      size: { width: 728, height: 90 },
      title: "Digital Marketing Course",
      description: "Learn from industry experts",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=728&h=90&fit=crop",
      backgroundColor: "#4A90E2",
      textColor: "#FFFFFF", 
      buttonText: "Enroll Now",
      link: "#marketing-ad",
      company: "EduTech"
    }
  ],
  rectangles: [
    {
      id: "rect_1",
      type: "rectangle", 
      size: { width: 300, height: 250 },
      title: "Travel Deals",
      description: "Book your dream vacation today. Special offers available!",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop",
      backgroundColor: "#FF6B6B",
      textColor: "#FFFFFF",
      buttonText: "Book Now",
      link: "#travel-ad",
      company: "TravelCorp"
    },
    {
      id: "rect_2",
      type: "rectangle",
      size: { width: 300, height: 250 },
      title: "Fitness Equipment",
      description: "Transform your home into a gym. Free shipping!",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      backgroundColor: "#4ECDC4",
      textColor: "#FFFFFF",
      buttonText: "Shop Fitness",
      link: "#fitness-ad", 
      company: "FitGear"
    },
    {
      id: "rect_3",
      type: "rectangle",
      size: { width: 300, height: 250 },
      title: "Online Courses",
      description: "Learn new skills from anywhere. Start today!",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop",
      backgroundColor: "#9B59B6",
      textColor: "#FFFFFF",
      buttonText: "Start Learning",
      link: "#education-ad",
      company: "LearnHub"
    }
  ],
  skyscrapers: [
    {
      id: "sky_1",
      type: "skyscraper",
      size: { width: 300, height: 600 },
      title: "Tech Gadgets Sale",
      description: "Latest smartphones, laptops, and accessories at unbeatable prices.",
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&h=400&fit=crop",
      backgroundColor: "#34495E",
      textColor: "#FFFFFF",
      buttonText: "Shop Tech",
      link: "#tech-ad",
      company: "TechStore"
    },
    {
      id: "sky_2", 
      type: "skyscraper",
      size: { width: 300, height: 600 },
      title: "Fashion Trends 2025",
      description: "Discover the latest fashion trends. Free returns on all orders.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop",
      backgroundColor: "#E74C3C",
      textColor: "#FFFFFF",
      buttonText: "Shop Fashion",
      link: "#fashion-ad",
      company: "StyleHub"
    }
  ]
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions that simulate real AdSense API calls
export const fetchAds = async (adType = 'all', count = null) => {
  // Simulate network delay
  await delay(100);
  
  try {
    let ads = [];
    
    switch (adType) {
      case 'banner':
        ads = mockAdsData.banners;
        break;
      case 'rectangle':
        ads = mockAdsData.rectangles;
        break;
      case 'skyscraper':
        ads = mockAdsData.skyscrapers;
        break;
      case 'all':
      default:
        ads = [
          ...mockAdsData.banners,
          ...mockAdsData.rectangles,
          ...mockAdsData.skyscrapers
        ];
        break;
    }
    
    // If count is specified, return only that many ads
    if (count) {
      ads = ads.slice(0, count);
    }
    
    return {
      success: true,
      data: ads,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get ads by specific size
export const fetchAdsBySize = async (width, height) => {
  await delay(100);
  
  const allAds = [
    ...mockAdsData.banners,
    ...mockAdsData.rectangles,
    ...mockAdsData.skyscrapers
  ];
  
  const matchingAds = allAds.filter(ad => 
    ad.size.width === width && ad.size.height === height
  );
  
  return {
    success: true,
    data: matchingAds,
    timestamp: new Date().toISOString()
  };
};

// Get random ad for a slot
export const fetchRandomAd = async (preferredType = null) => {
  await delay(50);
  
  let availableAds = [];
  
  if (preferredType) {
    availableAds = mockAdsData[preferredType] || [];
  } else {
    availableAds = [
      ...mockAdsData.banners,
      ...mockAdsData.rectangles,
      ...mockAdsData.skyscrapers
    ];
  }
  
  if (availableAds.length === 0) {
    return {
      success: false,
      error: 'No ads available',
      data: null
    };
  }
  
  const randomAd = availableAds[Math.floor(Math.random() * availableAds.length)];
  
  return {
    success: true,
    data: randomAd,
    timestamp: new Date().toISOString()
  };
};

// Track ad impression (for future AdSense integration)
export const trackAdImpression = async (adId) => {
  await delay(50);
  
  // This would integrate with AdSense tracking
  console.log(`Ad impression tracked: ${adId}`);
  
  return {
    success: true,
    adId,
    timestamp: new Date().toISOString()
  };
};

// Track ad click (for future AdSense integration)
export const trackAdClick = async (adId) => {
  await delay(50);
  
  // This would integrate with AdSense tracking
  console.log(`Ad click tracked: ${adId}`);
  
  return {
    success: true,
    adId,
    timestamp: new Date().toISOString()
  };
};