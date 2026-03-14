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
}

const defaultSEO = {
  title: 'Golden Lotus Indian Restaurant | Authentic Indian Cuisine in Alexandria, LA',
  description: 'Golden Lotus offers authentic Indian cuisine, catering services, and unforgettable dining experiences in Alexandria, Louisiana. Wedding catering, corporate events, private parties. Visit us at 1473 Dorchester Dr!',
  keywords: 'Indian restaurant Alexandria LA, Indian food Louisiana, catering Alexandria, wedding catering Louisiana, corporate catering Alexandria, Indian cuisine, halal food, vegetarian, vegan, 71301',
  image: 'https://www.goldenlotusgrill.com/golden_lotus_logo.png',
  url: 'https://www.goldenlotusgrill.com',
};

export default function SEO({
  title = defaultSEO.title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  image = defaultSEO.image,
  url = defaultSEO.url,
  type = 'website',
  schema,
  noIndex = false,
}: SEOProps) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Golden Lotus Indian Restaurant" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="theme-color" content="#e67e22" />
      <meta name="msapplication-TileColor" content="#e67e22" />
      
      {/* Structured Data / JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

// Pre-defined schemas for different page types
export const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Golden Lotus Indian Restaurant',
  image: 'https://www.goldenlotusgrill.com/golden_lotus_logo.png',
  '@id': 'https://www.goldenlotusgrill.com',
  url: 'https://www.goldenlotusgrill.com',
  telephone: '+1-318-555-0123',
  priceRange: '$$',
  servesCuisine: ['Indian', 'Pakistani', 'Asian'],
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
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '11:30',
      closes: '22:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '11:00',
      closes: '23:00',
    },
  ],
  acceptsReservations: 'True',
  menu: 'https://www.goldenlotusgrill.com/menu',
};

export const cateringServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Catering',
  provider: {
    '@type': 'Restaurant',
    name: 'Golden Lotus Indian Restaurant',
    telephone: '+1-318-555-0123',
  },
  areaServed: {
    '@type': 'City',
    name: 'Alexandria',
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
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Corporate Catering',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Private Event Catering',
        },
      },
    ],
  },
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
