import type { Locale } from "@/lib/i18n/config";

/**
 * Self-contained, per-locale content for the Privacy Policy page.
 *
 * This module intentionally does NOT depend on the shared i18n dictionary so
 * the legal pages can be edited and reviewed in isolation. Each locale returns
 * the same structured shape; only the human-readable copy differs. The legal
 * meaning (UK GDPR / CCPA / PIPEDA / Australian Privacy Act compliance, COPPA,
 * no child PII, Stripe handling card data, deletion within 30 days, etc.) is
 * preserved identically across both languages.
 */

/** A run of inline content: plain text and/or links, rendered in order. */
export type Inline =
  | string
  | { bold: string }
  | { text: string; href: string; external?: boolean };

export interface PrivacySection {
  heading: string;
  /** Optional intro/standalone paragraphs (rendered as muted <p>). */
  paragraphs?: Inline[][];
  /** Optional bulleted list (each item is a run of inline content). */
  list?: Inline[][];
  /** Optional paragraph(s) rendered AFTER the list. */
  afterList?: Inline[][];
}

export interface PrivacyContent {
  /** Document chrome. */
  backToHome: string;
  title: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  /** Footer. */
  copyright: string;
  footerPrivacy: string;
  footerTerms: string;
  homeAriaLabel: string;
  /** Body. */
  sections: PrivacySection[];
}

const EN: PrivacyContent = {
  backToHome: "Back to home",
  title: "Privacy Policy",
  lastUpdatedLabel: "Last updated:",
  lastUpdated: "27 May 2025",
  copyright: "© 2025 TinyPlan. All rights reserved.",
  footerPrivacy: "Privacy Policy",
  footerTerms: "Terms of Service",
  homeAriaLabel: "TinyPlan home",
  sections: [
    {
      heading: "What TinyPlan is",
      paragraphs: [
        [
          "TinyPlan is a personalized play and routine planning service for parents of children aged 2–6. Parents complete a quiz, receive a play profile, and get a 7-day activity plan. The app is parent-facing—children do not interact with it directly.",
        ],
      ],
    },
    {
      heading: "Data we collect",
      list: [
        [
          { bold: "Email address" },
          " — used for account sign-in (handled by our authentication provider, Clerk), subscription management, and essential service communications.",
        ],
        [
          { bold: "Quiz answers" },
          " — your responses to the play profile quiz, used to generate your personalized plan. These include general preferences, parenting goals, and your child’s age range (e.g. 2–3, 4–5).",
        ],
        [
          { bold: "Activity log data" },
          " — which activities you mark as complete, used to track your progress and improve plan recommendations.",
        ],
        [
          { bold: "Basic analytics events" },
          " — page views and feature usage, stored in our own database. No third-party tracking scripts are loaded by default.",
        ],
      ],
    },
    {
      heading: "Data we do not collect",
      list: [
        [
          "No child names, photos, birthdates, or location data. Child age is stored only as a broad range.",
        ],
        [
          "No payment card numbers. All payment processing is handled by Stripe—TinyPlan never sees or stores your card details.",
        ],
        [
          "No data is collected from children. This app is designed for and used by parents only.",
        ],
      ],
    },
    {
      heading: "How we use your data",
      list: [
        ["To generate and deliver your personalized play plan."],
        ["To authenticate your account through Clerk-hosted sign-in."],
        ["To manage your subscription and process payments through Stripe."],
        [
          "To improve the service based on aggregate, anonymized usage patterns.",
        ],
      ],
      afterList: [
        [
          "We do not sell your data. We do not use your data for advertising.",
        ],
      ],
    },
    {
      heading: "Third parties",
      list: [
        [
          { bold: "Clerk" },
          " — Clerk, Inc. provides our hosted sign-in and authentication. Clerk receives your email address, manages your sign-in, and stores authentication sessions and cookies on our behalf, under their own ",
          {
            text: "privacy policy",
            href: "https://clerk.com/legal/privacy",
            external: true,
          },
          ".",
        ],
        [
          { bold: "Stripe" },
          " — processes payments and manages subscriptions. Stripe receives your email and payment details under their own ",
          {
            text: "privacy policy",
            href: "https://stripe.com/privacy",
            external: true,
          },
          ".",
        ],
      ],
      afterList: [
        [
          "We share data only with the processors listed above, solely to operate the service. We do not share your data with any other third parties.",
        ],
      ],
    },
    {
      heading: "Cookies and sessions",
      paragraphs: [
        [
          "Our authentication provider, Clerk, sets cookies in your browser to keep you signed in and to secure your session. We use your browser’s localStorage to save quiz progress (so you can resume if you leave the page) and to store a first-party, randomly generated analytics identifier (“tinyplan_anon_id”). This identifier lets us measure aggregate, IP-less usage of our own pages; it is not tied to your identity and is not shared with third parties. We do not use third-party advertising or tracking cookies.",
        ],
      ],
    },
    {
      heading: "Data retention",
      paragraphs: [
        [
          "Your account data (email, quiz answers, activity logs) is retained for as long as your account is active. If you cancel your subscription and request deletion, we will delete your data within 30 days. Stripe may retain payment records independently as required by law.",
        ],
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        [
          "Depending on where you live, you have rights over your personal data under laws such as the UK GDPR, the California Consumer Privacy Act (CCPA), Canada’s PIPEDA, and the Australian Privacy Act. These include:",
        ],
      ],
      list: [
        [
          { bold: "Access" },
          " — you can request a copy of the data we hold about you.",
        ],
        [
          { bold: "Deletion" },
          " — you can request that we delete your account and all associated data.",
        ],
        [
          { bold: "Correction" },
          " — you can request corrections to any inaccurate data.",
        ],
      ],
      afterList: [
        ["To exercise any of these rights, email us at the address below."],
      ],
    },
    {
      heading: "Children’s privacy (COPPA)",
      paragraphs: [
        [
          "TinyPlan is a parent-facing service. Children do not create accounts, interact with the app, or provide any data. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.",
        ],
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        [
          "We may update this policy from time to time. If we make material changes, we will notify you by email. The “last updated” date at the top of this page reflects the most recent revision.",
        ],
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        [
          "For privacy-related questions or requests, email ",
          { text: "hello@tinyplan.org", href: "mailto:hello@tinyplan.org" },
          ".",
        ],
      ],
    },
  ],
};

const ES: PrivacyContent = {
  backToHome: "Volver al inicio",
  title: "Política de privacidad",
  lastUpdatedLabel: "Última actualización:",
  lastUpdated: "27 de mayo de 2025",
  copyright: "© 2025 TinyPlan. Todos los derechos reservados.",
  footerPrivacy: "Política de privacidad",
  footerTerms: "Términos del servicio",
  homeAriaLabel: "Inicio de TinyPlan",
  sections: [
    {
      heading: "Qué es TinyPlan",
      paragraphs: [
        [
          "TinyPlan es un servicio de planificación personalizada de juego y rutinas para madres y padres de niños de 2 a 6 años. Las familias responden un test, reciben un perfil de juego y obtienen un plan semanal de actividades de 7 días. La app está dirigida a madres y padres: los niños no interactúan con ella directamente.",
        ],
      ],
    },
    {
      heading: "Datos que recopilamos",
      list: [
        [
          { bold: "Correo electrónico" },
          " — se usa para iniciar sesión en tu cuenta (gestionado por nuestro proveedor de autenticación, Clerk), gestionar la suscripción y enviarte comunicaciones esenciales del servicio.",
        ],
        [
          { bold: "Respuestas del test" },
          " — tus respuestas al test de perfil de juego, que usamos para generar tu plan personalizado. Incluyen preferencias generales, metas de crianza y el rango de edad de tu peque (por ejemplo, 2–3, 4–5).",
        ],
        [
          { bold: "Datos del registro de actividades" },
          " — qué actividades marcas como completadas, que usamos para seguir tu progreso y mejorar las recomendaciones de tu plan.",
        ],
        [
          { bold: "Eventos básicos de analítica" },
          " — vistas de página y uso de funciones, almacenados en nuestra propia base de datos. No se cargan scripts de seguimiento de terceros de forma predeterminada.",
        ],
      ],
    },
    {
      heading: "Datos que no recopilamos",
      list: [
        [
          "No recopilamos nombres, fotos, fechas de nacimiento ni datos de ubicación de los niños. La edad del niño se guarda únicamente como un rango amplio.",
        ],
        [
          "No recopilamos números de tarjetas de pago. Todo el procesamiento de pagos lo realiza Stripe: TinyPlan nunca ve ni almacena los datos de tu tarjeta.",
        ],
        [
          "No se recopilan datos de los niños. Esta app está diseñada para madres y padres, y solo ellos la usan.",
        ],
      ],
    },
    {
      heading: "Cómo usamos tus datos",
      list: [
        ["Para generar y entregar tu plan de juego personalizado."],
        ["Para autenticar tu cuenta mediante el inicio de sesión alojado por Clerk."],
        ["Para gestionar tu suscripción y procesar los pagos a través de Stripe."],
        [
          "Para mejorar el servicio a partir de patrones de uso agregados y anónimos.",
        ],
      ],
      afterList: [
        [
          "No vendemos tus datos. No usamos tus datos con fines publicitarios.",
        ],
      ],
    },
    {
      heading: "Terceros",
      list: [
        [
          { bold: "Clerk" },
          " — Clerk, Inc. proporciona nuestro inicio de sesión y autenticación alojados. Clerk recibe tu correo electrónico, gestiona tu inicio de sesión y almacena las sesiones y cookies de autenticación en nuestro nombre, conforme a su propia ",
          {
            text: "política de privacidad",
            href: "https://clerk.com/legal/privacy",
            external: true,
          },
          ".",
        ],
        [
          { bold: "Stripe" },
          " — procesa los pagos y gestiona las suscripciones. Stripe recibe tu correo electrónico y tus datos de pago conforme a su propia ",
          {
            text: "política de privacidad",
            href: "https://stripe.com/privacy",
            external: true,
          },
          ".",
        ],
      ],
      afterList: [
        [
          "Solo compartimos datos con los proveedores indicados arriba, únicamente para operar el servicio. No compartimos tus datos con ningún otro tercero.",
        ],
      ],
    },
    {
      heading: "Cookies y sesiones",
      paragraphs: [
        [
          "Nuestro proveedor de autenticación, Clerk, coloca cookies en tu navegador para mantener tu sesión iniciada y protegerla. Usamos el localStorage de tu navegador para guardar el progreso del test (de modo que puedas continuar si sales de la página) y para almacenar un identificador de analítica propio, generado de forma aleatoria (“tinyplan_anon_id”). Este identificador nos permite medir el uso agregado y sin IP de nuestras propias páginas; no está vinculado a tu identidad ni se comparte con terceros. No usamos cookies de publicidad ni de seguimiento de terceros.",
        ],
      ],
    },
    {
      heading: "Conservación de datos",
      paragraphs: [
        [
          "Los datos de tu cuenta (correo electrónico, respuestas del test, registros de actividad) se conservan mientras tu cuenta esté activa. Si cancelas tu suscripción y solicitas la eliminación, borraremos tus datos en un plazo de 30 días. Stripe puede conservar los registros de pago de forma independiente, según lo exija la ley.",
        ],
      ],
    },
    {
      heading: "Tus derechos",
      paragraphs: [
        [
          "Según el lugar donde vivas, tienes derechos sobre tus datos personales en virtud de leyes como el RGPD del Reino Unido, la Ley de Privacidad del Consumidor de California (CCPA), la PIPEDA de Canadá y la Ley de Privacidad de Australia. Entre ellos:",
        ],
      ],
      list: [
        [
          { bold: "Acceso" },
          " — puedes solicitar una copia de los datos que tenemos sobre ti.",
        ],
        [
          { bold: "Eliminación" },
          " — puedes solicitar que eliminemos tu cuenta y todos los datos asociados.",
        ],
        [
          { bold: "Corrección" },
          " — puedes solicitar correcciones de cualquier dato inexacto.",
        ],
      ],
      afterList: [
        [
          "Para ejercer cualquiera de estos derechos, escríbenos al correo que aparece más abajo.",
        ],
      ],
    },
    {
      heading: "Privacidad de los niños (COPPA)",
      paragraphs: [
        [
          "TinyPlan es un servicio dirigido a madres y padres. Los niños no crean cuentas, no interactúan con la app ni proporcionan ningún dato. No recopilamos a sabiendas información personal de niños menores de 13 años. Si crees que un niño nos ha proporcionado información personal, contáctanos y la eliminaremos de inmediato.",
        ],
      ],
    },
    {
      heading: "Cambios en esta política",
      paragraphs: [
        [
          "Es posible que actualicemos esta política de vez en cuando. Si hacemos cambios importantes, te lo notificaremos por correo electrónico. La fecha de “última actualización” en la parte superior de esta página refleja la revisión más reciente.",
        ],
      ],
    },
    {
      heading: "Contacto",
      paragraphs: [
        [
          "Para preguntas o solicitudes relacionadas con la privacidad, escribe a ",
          { text: "hello@tinyplan.org", href: "mailto:hello@tinyplan.org" },
          ".",
        ],
      ],
    },
  ],
};

export function getPrivacyContent(locale: Locale): PrivacyContent {
  return locale === "en" ? EN : ES;
}

export const privacyMeta: Record<
  Locale,
  { title: string; description: string }
> = {
  en: {
    title: "Privacy Policy — TinyPlan",
    description:
      "How TinyPlan collects, uses, and protects your data. We collect minimal information and never store child personal data.",
  },
  es: {
    title: "Política de privacidad — TinyPlan",
    description:
      "Cómo TinyPlan recopila, usa y protege tus datos. Recopilamos la mínima información y nunca almacenamos datos personales de niños.",
  },
};
