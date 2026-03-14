#!/usr/bin/env node

/**
 * XML Sitemap Generator
 * 
 * This script generates:
 * 1. sitemap.xml - For search engines to discover all pages
 * 2. robots.txt - To guide search engine crawlers
 * 
 * Run this after building: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Website configuration
const SITE_URL = 'https://www.goldenlotusgrill.com';
const DIST_PATH = path.resolve(__dirname, '../dist');

// Pages with their priority and change frequency
// These pages should be indexed by search engines
const pages = [
  // Homepage - highest priority
  { path: '', priority: 1.0, changefreq: 'weekly' },
  
  // Main navigation pages - high priority
  { path: '/menu', priority: 0.9, changefreq: 'weekly' },
  { path: '/catering', priority: 0.9, changefreq: 'weekly' },
  { path: '/locations', priority: 0.9, changefreq: 'monthly' },
  { path: '/story', priority: 0.8, changefreq: 'monthly' },
  { path: '/events', priority: 0.8, changefreq: 'weekly' },
  
  // Information pages - medium priority
  { path: '/contact', priority: 0.7, changefreq: 'monthly' },
  { path: '/careers', priority: 0.6, changefreq: 'monthly' },
  { path: '/gift-cards', priority: 0.7, changefreq: 'monthly' },
  
  // Utility pages - lower priority but important for SEO
  { path: '/sitemap', priority: 0.5, changefreq: 'monthly' },
  { path: '/terms', priority: 0.4, changefreq: 'yearly' },
  { path: '/privacy', priority: 0.4, changefreq: 'yearly' },
  { path: '/accessibility', priority: 0.4, changefreq: 'yearly' },
  
  // Auth pages - lowest priority for indexing
  { path: '/login', priority: 0.3, changefreq: 'yearly' },
  { path: '/signup', priority: 0.3, changefreq: 'yearly' },
];

// Current date in W3C format (YYYY-MM-DD)
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Generate XML Sitemap
const generateSitemap = () => {
  const lastmod = getCurrentDate();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!--
  Golden Lotus Grill XML Sitemap
  Generated: ${new Date().toISOString()}
  Website: ${SITE_URL}
  
  This sitemap helps search engines discover and index all important pages
  on the Golden Lotus Grill website for better visibility in search results.
-->
`;

  pages.forEach(page => {
    xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>
`;
  });

  xml += '</urlset>';
  
  return xml;
};

// Generate robots.txt
const generateRobotsTxt = () => {
  return `# robots.txt for Golden Lotus Grill
# ${SITE_URL}
# Generated: ${new Date().toISOString()}

# Allow all search engine crawlers
User-agent: *

# Allow access to all public pages
Allow: /

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay (optional, helps prevent server overload)
# Crawl-delay: 10

# Disallow admin and private areas
Disallow: /admin/
Disallow: /admin
Disallow: /checkout
Disallow: /order/*/confirmed
Disallow: /order/*/track
Disallow: /profile
Disallow: /api/

# Disallow common patterns that shouldn't be indexed
Disallow: /*?*order=true
Disallow: /*?*search=
Disallow: /*?*tab=

# Disallow old or deprecated paths (if any)
# Disallow: /old-page-name

# Allow specific file types for indexing
Allow: /*.js$
Allow: /*.css$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.gif$
Allow: /*.svg$
Allow: /*.webp$
Allow: /*.pdf$
`;
};

// Ensure dist directory exists
if (!fs.existsSync(DIST_PATH)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(DIST_PATH, { recursive: true });
}

// Write sitemap.xml
const sitemapPath = path.join(DIST_PATH, 'sitemap.xml');
const sitemapContent = generateSitemap();
fs.writeFileSync(sitemapPath, sitemapContent);
console.log(`✓ Generated sitemap.xml at ${sitemapPath}`);
console.log(`  Contains ${pages.length} URLs`);

// Write robots.txt
const robotsPath = path.join(DIST_PATH, 'robots.txt');
const robotsContent = generateRobotsTxt();
fs.writeFileSync(robotsPath, robotsContent);
console.log(`✓ Generated robots.txt at ${robotsPath}`);

// Summary
console.log('\n📊 SEO Files Summary:');
console.log('====================');
console.log(`Site URL: ${SITE_URL}`);
console.log(`Pages in sitemap: ${pages.length}`);
console.log(`Highest priority: ${Math.max(...pages.map(p => p.priority))} (Homepage)`);
console.log(`Lowest priority: ${Math.min(...pages.map(p => p.priority))} (Auth pages)`);
console.log('\n✅ All SEO files generated successfully!');
console.log('\nNext steps:');
console.log('1. Deploy the dist folder to your web server');
console.log('2. Submit sitemap to Google Search Console:');
console.log(`   ${SITE_URL}/sitemap.xml`);
console.log('3. Verify robots.txt is accessible:');
console.log(`   ${SITE_URL}/robots.txt`);
