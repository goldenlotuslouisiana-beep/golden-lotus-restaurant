import { loadStripe } from '@stripe/stripe-js';

// Stripe Configuration
// Set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables
// For testing, use your Stripe test publishable key (pk_test_...)
// Test card numbers:
// - Success: 4242 4242 4242 4242
// - Decline: 4000 0000 0000 0002
// - Any future expiry date, any 3-digit CVC, any ZIP
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
    console.warn('VITE_STRIPE_PUBLISHABLE_KEY not set. Please add it to your environment variables.');
}

export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
