require('dotenv').config();
const { MongoClient } = require('mongodb');

const ds = {
  hero: { title: 'Experience Authentic Flavors', subtitle: 'Golden Lotus brings you a modern take on traditional Asian cuisine.', backgroundImage: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=1920' },
  about: { title: 'Welcome to Golden Lotus 🪷', content: 'Golden Lotus is your destination for authentic Asian cuisine...', image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800' },
  awards: { years: ['2023', '2024'], title: 'Citys Best Dim Sum', description: 'Voted Best Dim Sum...', link: '#' },
  cuisine: { title: 'Masterful Wok & Dim Sum', description: 'Our menu is a celebration of Asia...', image: 'https://images.unsplash.com/photo-1546250328-7bef2f3b9e42?w=800' },
  bar: { title: 'Full Bar', description: 'Pair your meal with our carefully curated...', image: 'https://images.unsplash.com/photo-1558855567-1a3af1b54a37?w=800' },
  ambience: { title: 'Modern Elegance', description: 'Dine in a space that balances modern elegance...', images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=600'] },
  catering: { title: 'Catering for Every Occasion', description: 'Elevate your next event with Golden Lotus catering...', image: 'https://images.unsplash.com/photo-1555244162-803279f50793?w=800' },
  events: { hennaParty: { title: 'Henna Party Events', description: 'Host a memorable celebration...', image: 'https://images.unsplash.com/photo-1548142723-aae7678afa53?w=800' } },
  visitUs: { title: 'Dine With Us', content: 'Whether you\'re grabbing a quick boba...' },
  rewards: { title: 'Golden Lotus Rewards', description: 'Join the Golden Lotus Rewards program...' },
  story: { sections: [{ id: '1', title: 'A Culinary Tradition', content: 'Golden Lotus began with a simple mission...', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800' }, { id: '2', title: 'The Art of Dim Sum', content: 'Our dim sum chefs begin arriving hours before taking up the wok...' }, { id: '3', title: 'Community First', content: 'Beyond the food, Golden Lotus is about community...' }] },
  orderCTA: { title: 'Order From Our Website!', description: 'Craving something bold and delicious? Skip the wait and order straight from our website!...', buttonText: 'Order Now', enabled: true },
  settings: { showHero: true, showFeaturedDishes: true, showAbout: true, showOrderCTA: true, showGallery: true, showAmbience: true, showCatering: true, showTestimonials: true, showFeatures: true, showRewards: true, showFAQ: false },
  legal: { termsOfService: '<h2 class="text-2xl font-bold mb-4">Terms of Service</h2><p class="mb-4">Welcome to Golden Lotus...</p>', privacyPolicy: '<h2 class="text-2xl font-bold mb-4">Privacy Policy</h2><p class="mb-4">Golden Lotus Indian Restaurant...</p>' },
  footerSettings: { showGiftCards: true, showHiring: true },
  socialLinks: { facebook: 'https://facebook.com', instagram: 'https://instagram.com' },
  contactInfo: { email: 'golden_lotusmiami@gmail.com', phone: '(318) 555-0123', address: '1473 Dorchester Dr', city: 'Alexandria', state: 'LA', zip: '71301' }
};

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('goldenlotus');
    const count = await db.collection('site_content').countDocuments();
    if (count === 0) {
        await db.collection('site_content').insertOne(ds);
        console.log('Seeded site_content!');
    } else {
        console.log('Already seeded.');
    }
    client.close();
}
seed();
