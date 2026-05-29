export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<{ id: string; success: boolean }>;
}

// ── Console provider (local / dev fallback) ─────────────────────────────────

class ConsoleEmailProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<{ id: string; success: boolean }> {
    console.log(`[EMAIL] To: ${options.to} | Subject: ${options.subject}`);
    console.log(`[EMAIL] Body preview: ${options.html.slice(0, 200)}...`);
    return { id: 'console_' + Date.now(), success: true };
  }
}

// ── Resend provider (production) ────────────────────────────────────────────

class ResendEmailProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(options: EmailOptions): Promise<{ id: string; success: boolean }> {
    const from = options.from || process.env.EMAIL_FROM || 'TinyPlan <hello@tinyplan.app>';

    const body: Record<string, string> = {
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };
    if (options.replyTo) {
      body.reply_to = options.replyTo;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[RESEND] API error ${res.status}: ${text}`);
      throw new Error(`Resend API error: ${res.status}`);
    }

    const data = await res.json() as { id?: string };
    console.log(`[RESEND] Sent to ${options.to} (id: ${data.id})`);
    return { id: data.id || 'resend_' + Date.now(), success: true };
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function getEmailProvider(): EmailProvider {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) return new ResendEmailProvider(apiKey);
  return new ConsoleEmailProvider();
}

// ── Email templates ─────────────────────────────────────────────────────────

const BRAND_COLOR = '#F97316'; // warm orange
const BG_COLOR = '#FFF7ED'; // orange-50
const TEXT_COLOR = '#1C1917'; // stone-900
const MUTED_COLOR = '#78716C'; // stone-500

function wrapTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG_COLOR};">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" style="max-width:520px;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:${BRAND_COLOR};padding:24px 32px;">
          <span style="font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.02em;">TinyPlan</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;color:${TEXT_COLOR};font-size:16px;line-height:1.6;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px 24px;text-align:center;color:${MUTED_COLOR};font-size:12px;line-height:1.5;">
          TinyPlan &mdash; Personalised play plans for your little one.<br/>
          &copy; ${new Date().getFullYear()} TinyPlan. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Magic link sign-in email.
 */
export function magicLinkEmail(url: string): { subject: string; html: string } {
  return {
    subject: 'Your TinyPlan sign-in link',
    html: wrapTemplate(`
      <p style="margin:0 0 16px;">Hi there!</p>
      <p style="margin:0 0 24px;">Click the button below to sign in to TinyPlan. This link is valid for 15 minutes.</p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${url}" style="display:inline-block;background:${BRAND_COLOR};color:#FFFFFF;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;">
          Sign in to TinyPlan
        </a>
      </p>
      <p style="margin:0 0 8px;color:${MUTED_COLOR};font-size:13px;">If you didn&rsquo;t request this link, you can safely ignore this email.</p>
      <p style="margin:0;color:${MUTED_COLOR};font-size:13px;word-break:break-all;">Or copy this URL: ${url}</p>
    `),
  };
}

/**
 * Welcome email sent after first sign-up.
 */
export function welcomeEmail(name?: string): { subject: string; html: string } {
  const greeting = name ? `Hi ${name}` : 'Welcome';
  return {
    subject: 'Welcome to TinyPlan!',
    html: wrapTemplate(`
      <p style="margin:0 0 16px;font-size:20px;font-weight:600;">${greeting}! 🎉</p>
      <p style="margin:0 0 16px;">We&rsquo;re so glad you&rsquo;re here. TinyPlan creates personalised weekly activity plans tailored to your child&rsquo;s age, interests, and your family&rsquo;s routine.</p>
      <p style="margin:0 0 16px;">Here&rsquo;s what happens next:</p>
      <ol style="margin:0 0 24px;padding-left:20px;">
        <li style="margin-bottom:8px;">Complete the quick quiz so we can learn about your child.</li>
        <li style="margin-bottom:8px;">Get a personalised play profile and goal.</li>
        <li style="margin-bottom:8px;">Receive your first week of curated activities!</li>
      </ol>
      <p style="margin:0;color:${MUTED_COLOR};font-size:14px;">Questions? Just reply to this email &mdash; we read every message.</p>
    `),
  };
}

/**
 * Notification that the child's plan is ready to view.
 */
export function planReadyEmail(
  profileName: string,
  goalText: string
): { subject: string; html: string } {
  return {
    subject: `Your child's TinyPlan is ready!`,
    html: wrapTemplate(`
      <p style="margin:0 0 16px;font-size:20px;font-weight:600;">Your plan is ready! 🗓️</p>
      <p style="margin:0 0 16px;">We&rsquo;ve put together a week of activities based on your child&rsquo;s profile:</p>
      <table role="presentation" width="100%" style="margin:0 0 24px;background:${BG_COLOR};border-radius:8px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-weight:600;color:${BRAND_COLOR};">Play Profile</p>
          <p style="margin:0 0 12px;font-size:15px;">${profileName}</p>
          <p style="margin:0 0 4px;font-weight:600;color:${BRAND_COLOR};">This Week&rsquo;s Goal</p>
          <p style="margin:0;font-size:15px;">${goalText}</p>
        </td></tr>
      </table>
      <p style="margin:0 0 24px;">Each day has a simple, fun activity you can do together &mdash; no special materials needed.</p>
      <p style="margin:0;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/plan" style="display:inline-block;background:${BRAND_COLOR};color:#FFFFFF;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;">
          View Your Plan
        </a>
      </p>
    `),
  };
}
