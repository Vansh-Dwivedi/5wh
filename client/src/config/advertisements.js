// Advertisement configuration
export const advertisementConfig = {
  hero: {
    left: {
      id: 'hero-left',
      title: 'Premium Brand',
      subtitle: 'Click to learn more',
      imageUrl: null, // Replace with actual image URL
      link: 'https://example-advertiser.com',
      width: '100%',
      height: '400px'
    },
    right: {
      id: 'hero-right',
      title: 'Special Offer',
      subtitle: 'Limited time only',
      imageUrl: null, // Replace with actual image URL
      link: 'https://another-advertiser.com',
      width: '100%',
      height: '400px'
    }
  },
  sidebar: {
    top: {
      id: 'sidebar-top',
      title: 'Sidebar Ad',
      subtitle: 'Banner Space',
      imageUrl: null,
      link: null,
      width: '100%',
      height: '250px'
    },
    middle: {
      id: 'sidebar-middle',
      title: 'Sidebar Ad 2',
      subtitle: 'Banner Space',
      imageUrl: null,
      link: null,
      width: '100%',
      height: '300px'
    },
    bottom: {
      id: 'sidebar-bottom',
      title: 'Sidebar Ad 3',
      subtitle: 'Banner Space',
      imageUrl: null,
      link: null,
      width: '100%',
      height: '200px'
    }
  },
  footer: {
    banner: {
      id: 'footer-banner',
      title: 'Footer Advertisement',
      subtitle: 'Full width banner',
      imageUrl: null,
      link: null,
      width: '100%',
      height: '120px'
    }
  }
};

// Analytics tracking function for ad clicks
export const trackAdClick = (adId, adTitle, targetUrl) => {
  // Add your analytics tracking code here
  console.log('Ad clicked:', { adId, adTitle, targetUrl });
  
  // Example: Google Analytics event tracking
  // if (window.gtag) {
  //   window.gtag('event', 'ad_click', {
  //     ad_id: adId,
  //     ad_title: adTitle,
  //     target_url: targetUrl
  //   });
  // }
};

// Function to handle ad clicks with analytics
export const handleAdClick = (adConfig) => {
  trackAdClick(adConfig.id, adConfig.title, adConfig.link);
  
  if (adConfig.link) {
    window.open(adConfig.link, '_blank');
  }
};
