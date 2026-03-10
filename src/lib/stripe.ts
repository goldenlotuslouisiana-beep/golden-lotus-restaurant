import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51MqKXvSIWhmCSNykFjkCPJfE9hLXGChyfnqOGz2V1X7v1k1C3EJ2HzpV3DRrw6MZHFboVH9kYKj0wfXz5LBjz2Gm00DfS8ZQKZ';

export const stripePromise = loadStripe(publishableKey);
