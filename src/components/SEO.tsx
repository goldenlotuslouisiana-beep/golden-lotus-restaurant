import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object | object[];
  noIndex?: boolean;
  breadcrumbs?: { name: string; url: string }[];
}

// Default SEO settings for Golden Lotus Grill
const defaultSEO = {
  title: 'Golden Lotus Grill | Authentic Indian Restaurant in Alexandria, LA',
  description: 'Golden Lotus Grill offers authentic Indian cuisine, catering services, and unforgettable dining experiences in Alexandria, Louisiana. Visit us at 1473 Dorchester Dr for lunch, dinner, and special events.',
  keywords: 'Indian restaurant Alexandria LA, Golden Lotus Grill, Indian food Louisiana, catering Alexandria, best Indian restaurant, tandoori, curry, biryani, 71301',
  image: 'https://www.goldenlotusgrill.com/golden_lotus_logo.png',
  url: 'https://www.goldenlotusgrill.com',
};

/**
 * SEO Component - Handles all meta tags and structured data
 * This component is crucial for Google Sitelinks as it provides
 * rich structured data that helps Google understand your site structure
 */
export default function SEO({
  title = defaultSEO.title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  image = defaultSEO.image,
  url = defaultSEO.url,
  type = 'website',
  schema,
  noIndex = false,
  breadcrumbs,
}: SEOProps) {
  
  // Generate schemas for Sitelinks optimization
  const generateSchemas = () => {
    const schemas: object[] = [];
    
    // 1. Organization Schema - Helps Google identify your business
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Golden Lotus Grill',
      url: 'https://www.goldenlotusgrill.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.goldenlotusgrill.com/golden_lotus_logo.png',
        width: 512,
        height: 512,
      },
      image: 'https://www.goldenlotusgrill.com/golden_lotus_logo.png',
      description: 'Authentic Indian restaurant in Alexandria, Louisiana offering dine-in, takeout, and catering services.',
      sameAs: [
        'https://www.facebook.com/goldenlotusgrill',
        'https://www.instagram.com/goldenlotusgrill',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-318-555-0123',
        contactType: 'Restaurant',
        availableLanguage: ['English'],
        areaServed: {
          '@type': 'City',
          name: 'Alexandria',
        },
      },
    });
    
    // 2. Restaurant Schema - Critical for restaurant Sitelinks
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: 'Golden Lotus Grill',
      image: 'https://www.goldenlotusgrill.com/golden_lotus_logo.png',
      '@id': 'https://www.goldenlotusgrill.com',
      url: 'https://www.goldenlotusgrill.com',
      telephone: '+1-318-555-0123',
      priceRange: '$$',
      servesCuisine: ['Indian', 'Pakistani', 'Asian', 'Halal'],
      acceptsReservations: 'True',
      hasMenu: 'https://www.goldenlotusgrill.com/menu',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1473 Dorchester Dr',
        addressLocality: 'Alexandria',
        addressRegion: 'LA',
        postalCode: '71301',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 31.2944,
        longitude: -92.4626,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          opens: '11:00',
          closes: '21:30',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Friday', 'Saturday'],
          opens: '11:00',
          closes: '22:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday'],
          opens: '11:30',
          closes: '21:00',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: '127',
      },
    });
    
    // 3. CateringService Schema - For catering Sitelinks
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'CateringService',
      name: 'Golden Lotus Grill Catering',
      provider: {
        '@type': 'Restaurant',
        name: 'Golden Lotus Grill',
        telephone: '+1-318-555-0123',
      },
      serviceType: 'Catering',
      areaServed: {
        '@type': 'City',
        name: 'Alexandria',
        '@id': 'https://en.wikipedia.org/wiki/Alexandria,_Louisiana',
      },
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: 'https://www.goldenlotusgrill.com/catering',
        serviceSmsNumber: '+1-318-555-0123',
        serviceType: 'Catering Inquiry',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Catering Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Wedding Catering',
              description: 'Full-service Indian catering for weddings',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Corporate Catering',
              description: 'Business lunch and event catering',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Private Party Catering',
              description: 'Birthdays, anniversaries, and special events',
            },
          },
        ],
      },
    });
    
    // 4. SiteLinks SearchBox Schema - Helps Google show search box in results
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Golden Lotus Grill',
      url: 'https://www.goldenlotusgrill.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.goldenlotusgrill.com/menu?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    });
    
    // 5. BreadcrumbList Schema - Critical for Sitelinks navigation
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      });
    }
    
    // Add any additional custom schemas passed as props
    if (schema) {
      if (Array.isArray(schema)) {
        schemas.push(...schema);
      } else {
        schemas.push(schema);
      }
    }
    
    return schemas;
  };

  const schemas = generateSchemas();

  return (
    <Helmet>
      {/* Basic Meta Tags - Essential for SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook - Improves social sharing */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Golden Lotus Grill" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card - Twitter visibility */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Robots Meta - Controls search engine crawling */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Theme Colors - Mobile browser theming */}
      <meta name="theme-color" content="#e67e22" />
      <meta name="msapplication-TileColor" content="#e67e22" />
      
      {/* Google Site Verification - Required for Google Search Console */}
      <meta name="google-site-verification" content="9ozD_HPSQPqAM9wQh3X6MW_70B55mcv7AKq7gjneoDo" />
      
      {/* Structured Data / JSON-LD - CRITICAL for Sitelinks */}
      {schemas.map((s, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}

// Pre-defined breadcrumb generators for common page types
export const generateBreadcrumbs = (pageName: string, pageUrl: string) => [
  { name: 'Home', url: 'https://www.goldenlotusgrill.com' },
  { name: pageName, url: pageUrl },
];

export const generateCateringBreadcrumbs = (subpage?: string) => {
  const crumbs = [
    { name: 'Home', url: 'https://www.goldenlotusgrill.com' },
    { name: 'Catering', url: 'https://www.goldenlotusgrill.com/catering' },
  ];
  if (subpage) {
    crumbs.push({ name: subpage, url: `https://www.goldenlotusgrill.com/catering/${subpage.toLowerCase().replace(/\s+/g, '-')}` });
  }
  return crumbs;
};

// Schema generators for external use

/**
 * Generate BreadcrumbList schema for structured data
 * Accepts items with either 'url' or 'item' property
 */
export function breadcrumbSchema(items: { name: string; item?: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item || item.url,
    })),
  };
}

/**
 * Generate Restaurant schema for structured data
 */
export function restaurantSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Golden Lotus Grill',
    image: 'https://www.goldenlotusgrill.com/golden_lotus_logo.png',
    '@id': 'https://www.goldenlotusgrill.com',
    url: 'https://www.goldenlotusgrill.com',
    telephone: '+1-318-555-0123',
    priceRange: '$$',
    servesCuisine: ['Indian', 'Pakistani', 'Asian', 'Halal'],
    acceptsReservations: 'True',
    hasMenu: 'https://www.goldenlotusgrill.com/menu',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1473 Dorchester Dr',
      addressLocality: 'Alexandria',
      addressRegion: 'LA',
      postalCode: '71301',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 31.2944,
      longitude: -92.4626,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '11:00',
        closes: '21:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Friday', 'Saturday'],
        opens: '11:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '11:30',
        closes: '21:00',
      },
    ],
  };
}

/**
 * Generate Organization schema for structured data
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Golden Lotus Grill',
    url: 'https://www.goldenlotusgrill.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.goldenlotusgrill.com/golden_lotus_logo.png',
      width: 512,
      height: 512,
    },
    image: 'https://www.goldenlotusgrill.com/golden_lotus_logo.png',
    description: 'Authentic Indian restaurant in Alexandria, Louisiana offering dine-in, takeout, and catering services.',
    sameAs: [
      'https://www.facebook.com/goldenlotusgrill',
      'https://www.instagram.com/goldenlotusgrill',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-318-555-0123',
      contactType: 'Restaurant',
      availableLanguage: ['English'],
      areaServed: {
        '@type': 'City',
        name: 'Alexandria',
      },
    },
  };
}

/**
 * Generate CateringService schema for structured data
 */
export function cateringServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CateringService',
    name: 'Golden Lotus Grill Catering',
    provider: {
      '@type': 'Restaurant',
      name: 'Golden Lotus Grill',
      telephone: '+1-318-555-0123',
    },
    serviceType: 'Catering',
    areaServed: {
      '@type': 'City',
      name: 'Alexandria',
      '@id': 'https://en.wikipedia.org/wiki/Alexandria,_Louisiana',
    },
    serviceUrl: 'https://www.goldenlotusgrill.com/catering',
  };
}

/**
 * Generate WebSite schema with search box for structured data
 */
export function siteLinksSearchBoxSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Golden Lotus Grill',
    url: 'https://www.goldenlotusgrill.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.goldenlotusgrill.com/menu?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
