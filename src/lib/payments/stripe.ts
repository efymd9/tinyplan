import Stripe from 'stripe';

export interface CheckoutConfig {
  userEmail: string;
  userId: string;
  quizSessionId?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
  mock?: boolean;
}

export const PRICE_DISPLAY = {
  intro_days: 7,
  intro_price: '$1',
  monthly_price: '$14.99',
  currency: 'USD',
} as const;

/**
 * Create a Stripe checkout session for the subscription.
 *
 * $1 for 7 days, then $14.99/month.
 *
 * When STRIPE_SECRET_KEY is not set, returns a mock result so local
 * development works without a Stripe account.
 */
export async function createCheckoutSession(
  config: CheckoutConfig
): Promise<CheckoutResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  // ── No key in production → hard error (unless demo bypass is on) ─────────
  if (
    !secretKey &&
    process.env.NODE_ENV === 'production' &&
    process.env.DEV_BYPASS_PAYWALL !== 'true'
  ) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
  }

  // ── Mock fallback for local / dev environments ──────────────────────────
  if (!secretKey) {
    const mockId = 'mock_' + Date.now();
    let url = config.successUrl;
    if (url.includes('{CHECKOUT_SESSION_ID}')) {
      url = url.replace('{CHECKOUT_SESSION_ID}', mockId);
    } else {
      const sep = url.includes('?') ? '&' : '?';
      url = url + sep + 'session_id=' + mockId;
    }
    return {
      url,
      sessionId: mockId,
      mock: true,
    };
  }

  // ── Real Stripe checkout session ────────────────────────────────────────
  const stripe = new Stripe(secretKey);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: config.userEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'TinyPlan — 7-day intro',
            description:
              '7-day introductory access to your personalised weekly activity plans.',
          },
          unit_amount: 100,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'TinyPlan Monthly',
            description:
              'Personalised weekly activity plans for your child — $14.99/month after introductory period.',
          },
          unit_amount: 1499,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        userId: config.userId,
        ...(config.quizSessionId
          ? { quizSessionId: config.quizSessionId }
          : {}),
      },
    },
    success_url: config.successUrl.includes('{CHECKOUT_SESSION_ID}')
      ? config.successUrl
      : config.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: config.cancelUrl,
    metadata: {
      userId: config.userId,
      ...(config.quizSessionId
        ? { quizSessionId: config.quizSessionId }
        : {}),
    },
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

/**
 * Verify a Stripe webhook signature and return the parsed event.
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    throw new Error(
      'STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must be configured'
    );
  }

  const stripe = new Stripe(secretKey);

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
