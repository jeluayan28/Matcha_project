// Payment seam. Checkout talks only to this interface, so a real provider
// (Stripe, etc.) can replace the mock without touching the order flow.
//
// Real integration, roughly:
//   1. createPayment() creates a hosted checkout session / PaymentIntent for the
//      order and returns { status: "pending", redirectUrl } — checkout redirects there.
//   2. The provider calls a webhook route; that route verifies the signature and
//      marks the order "paid" using a service-role client (customers can never
//      update orders themselves).
//   3. On payment failure/expiry, a service-role job cancels the order and restocks it.

export type PaymentRequest = {
  orderId: string;
  amount: number; // major units, e.g. 32.00
  currency: "usd";
  customerEmail: string;
};

export type PaymentResult = {
  status: "pending" | "failed";
  reference: string;
  // Hosted payment page to send the customer to, if the provider uses one.
  redirectUrl?: string;
};

export interface PaymentProvider {
  readonly name: string;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
}

// Mock: nothing is charged and the order stays "pending".
const mockProvider: PaymentProvider = {
  name: "mock",
  async createPayment({ orderId }) {
    return { status: "pending", reference: `mock_${orderId}` };
  },
};

export function getPaymentProvider(): PaymentProvider {
  return mockProvider;
}
