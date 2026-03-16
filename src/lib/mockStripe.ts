// Mock Stripe for testing without actual Stripe account
// This simulates Stripe payments for demo purposes

export interface MockPaymentResult {
  success: boolean;
  paymentIntentId: string;
  error?: string;
}

// Test card numbers for mock payments
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINE: '4000000000000002',
  INSUFFICIENT: '4000000000009995',
};

// Simulate creating a payment intent
export async function mockCreatePaymentIntent(_amount: number): Promise<{
  clientSecret: string;
  paymentIntentId: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const clientSecret = `${paymentIntentId}_secret_mock`;
  
  return { clientSecret, paymentIntentId };
}

// Simulate confirming card payment
export async function mockConfirmCardPayment(
  clientSecret: string,
  cardNumber: string,
  _cardName: string
): Promise<MockPaymentResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Remove spaces from card number
  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  
  // Check test card scenarios
  if (cleanCardNumber === TEST_CARDS.DECLINE) {
    return {
      success: false,
      paymentIntentId: clientSecret.split('_secret')[0],
      error: 'Your card was declined. Please try a different card.',
    };
  }
  
  if (cleanCardNumber === TEST_CARDS.INSUFFICIENT) {
    return {
      success: false,
      paymentIntentId: clientSecret.split('_secret')[0],
      error: 'Your card has insufficient funds.',
    };
  }
  
  // Any other 16-digit card number will succeed (for demo purposes)
  if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
    return {
      success: false,
      paymentIntentId: '',
      error: 'Please enter a valid card number.',
    };
  }
  
  return {
    success: true,
    paymentIntentId: clientSecret.split('_secret')[0],
  };
}

// Validate card number (Luhn algorithm)
export function isValidCardNumber(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\s/g, '');
  if (clean.length !== 16) return false;
  if (!/^\d+$/.test(clean)) return false;
  
  // Simple Luhn check
  let sum = 0;
  let isEven = false;
  
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}
