import Stripe from 'stripe';

export interface CheckoutConfig {
  userEmail: string;
  userId: string;
  quizSessionId?: string;
  successUrl: string;
  cancelUrl: string;
  clickId?: string;
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

// Amounts in cents. The introductory charge collected up-front and the
// recurring monthly price the subscription renews at after the intro window.
const INTRO_AMOUNT_CENTS = 100; // $1.00
const MONTHLY_AMOUNT_CENTS = 1499; // $14.99
const INTRO_DAYS = 7;

/**
 * Create a Stripe checkout session for the subscription.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PRICING MODEL — "$1 for 7 days, then $14.99/month"
 * ─────────────────────────────────────────────────────────────────────────
 * ONE coherent subscription is created: a single recurring $14.99/month Price
 * with a 7-day trial, plus a one-time $1 "intro" charge collected up-front so
 * the customer pays something today (the advertised "$1 for 7 days").
 *
 * EXACT charge timeline this produces:
 *   • Today (checkout completes):  $1.00 charged immediately.
 *       - In subscription mode, the one-time line item is collected up-front
 *         (the customer enters a card and the $1 is captured now), while the
 *         recurring $14.99 line item is placed on trial for 7 days.
 *   • Days 0–7:                    Subscription is in `trialing` status; the
 *                                  customer has full access; nothing further
 *                                  is charged.
 *   • Day 7 (trial end):           First recurring invoice for $14.99 is
 *                                  finalized and charged; status → `active`.
 *   • Every month after:           $14.99 charged on the renewal date.
 *
 * Net: $1 today, then $14.99/month starting one week later — matching the
 * pricing copy. The subscription carries `metadata.userId` so the webhook can
 * resolve the local user even when no customer email is available.
 *
 * VALIDATED in Stripe TEST MODE (test clock, 2026-06-03): the one-time $1 line
 * item IS captured at checkout — it produces a `subscription_create` invoice of
 * $1.00 paid on day 0, the recurring price stays `trialing`, and a separate
 * `subscription_cycle` invoice of $14.99 is paid at trial end (~day 7), after
 * which status → `active`. The Checkout Session's amount_total at creation is
 * $1.00. So the charge schedule matches the pricing copy exactly — there is NO
 * $15.99 day-7 surprise. Re-confirm once against the LIVE account before the
 * first real charge (account-level invoice settings can in theory differ).
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

  const metadata = {
    userId: config.userId,
    ...(config.quizSessionId ? { quizSessionId: config.quizSessionId } : {}),
    // Affiliate-network click id (when the visitor arrived via a partner link).
    // Spread into BOTH the session metadata and subscription_data.metadata below,
    // so the Stripe webhook can read it off the invoice's subscription details.
    ...(config.clickId ? { click_id: config.clickId } : {}),
  };

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: config.userEmail || undefined,
    line_items: [
      // One-time $1 intro charge collected up-front ("$1 for 7 days").
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'TinyPlan — 7-day intro',
            description:
              '7-day introductory access to your personalised weekly activity plans.',
          },
          unit_amount: INTRO_AMOUNT_CENTS,
        },
        quantity: 1,
      },
      // Recurring $14.99/month — placed on a 7-day trial below.
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'TinyPlan Monthly',
            description:
              'Personalised weekly activity plans for your child — $14.99/month after your 7-day intro.',
          },
          unit_amount: MONTHLY_AMOUNT_CENTS,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      // 7-day trial on the recurring price → first $14.99 invoice lands on day 7.
      trial_period_days: INTRO_DAYS,
      // metadata.userId is the primary key the webhook resolves the local user by.
      metadata,
    },
    success_url: config.successUrl.includes('{CHECKOUT_SESSION_ID}')
      ? config.successUrl
      : config.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: config.cancelUrl,
    metadata,
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

/**
 * Create a Stripe Billing Portal session so a customer can manage / cancel
 * their subscription and update payment details. Requires a Stripe customer id
 * (set on the local user by the webhook after the first paid event).
 */
export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return { url: session.url };
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

/**
 * Resolve the Stripe invoice id behind a charge — used to attribute affiliate
 * refunds / chargebacks back to the same `external_payment_id` (the invoice id)
 * that was reported at conversion time.
 *
 * In the current Stripe API (Basil) the Charge and PaymentIntent objects no
 * longer carry an `invoice` field; the link now lives on InvoicePayment. So we
 * walk: charge → payment_intent → the InvoicePayment whose payment references
 * that PI → its invoice id.
 *
 * Fail-safe: returns null on any missing key or error (never throws).
 */
export async function getInvoiceIdForCharge(
  chargeId: string
): Promise<string | null> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !chargeId) return null;
  try {
    const stripe = new Stripe(secretKey);
    const charge = await stripe.charges.retrieve(chargeId);
    const pi = charge.payment_intent;
    const piId = typeof pi === 'string' ? pi : (pi?.id ?? null);
    if (!piId) return null;

    const list = await stripe.invoicePayments.list({
      payment: { type: 'payment_intent', payment_intent: piId },
      limit: 1,
    });
    const inv = list.data[0]?.invoice;
    return typeof inv === 'string' ? inv : (inv?.id ?? null);
  } catch {
    return null;
  }
}
