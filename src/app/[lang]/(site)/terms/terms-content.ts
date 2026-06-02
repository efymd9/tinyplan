import type { Locale } from "@/lib/i18n/config";

/**
 * Self-contained, per-locale content for the Terms of Service page.
 *
 * Like the privacy module, this does NOT depend on the shared i18n dictionary.
 * Each locale returns the same structured shape; only the human-readable copy
 * differs. The legal meaning is preserved identically across both languages:
 * subscription pricing ($1 for 7 days then $14.99/month), Stripe handles card
 * data, "not medical advice or therapy" / no diagnosis claims, supervision
 * responsibility, IP/license terms, limitation of liability, 30-day wind-down
 * notice, and termination/deletion on request.
 */

/** A run of inline content: plain text and/or links, rendered in order. */
export type Inline =
  | string
  | { bold: string }
  | { text: string; href: string; external?: boolean };

/** A standard prose/list section. */
export interface TermsProseSection {
  kind?: "prose";
  heading: string;
  paragraphs?: Inline[][];
  list?: Inline[][];
}

/**
 * The highlighted "Not medical advice" section, rendered inside a styled card
 * with an intro paragraph followed by a tight bulleted list.
 */
export interface TermsCalloutSection {
  kind: "callout";
  heading: string;
  intro: Inline[];
  list: Inline[][];
}

export type TermsSection = TermsProseSection | TermsCalloutSection;

export interface TermsContent {
  backToHome: string;
  title: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  copyright: string;
  footerPrivacy: string;
  footerTerms: string;
  homeAriaLabel: string;
  sections: TermsSection[];
}

const EN: TermsContent = {
  backToHome: "Back to home",
  title: "Terms of Service",
  lastUpdatedLabel: "Last updated:",
  lastUpdated: "27 May 2025",
  copyright: "© 2025 TinyPlan. All rights reserved.",
  footerPrivacy: "Privacy Policy",
  footerTerms: "Terms of Service",
  homeAriaLabel: "TinyPlan home",
  sections: [
    {
      heading: "About TinyPlan",
      paragraphs: [
        [
          "TinyPlan provides personalized play and routine plans for parents of children aged 2–6. After completing a quiz about your parenting goals, schedule, and child’s age range, you receive a 7-day activity plan with parent scripts, materials lists, and step-by-step guidance. By using TinyPlan, you agree to these terms.",
        ],
      ],
    },
    {
      heading: "Account and access",
      paragraphs: [
        [
          "You log in using a magic link sent to your email address. You are responsible for maintaining access to your email account. Each account is for personal, non-commercial use by a single household.",
        ],
      ],
    },
    {
      heading: "Subscription and payment",
      list: [
        [
          "TinyPlan costs ",
          { bold: "$1 for the first 7 days" },
          ", then ",
          { bold: "$14.99 per month" },
          " thereafter.",
        ],
        [
          "Your subscription renews automatically each month until you cancel.",
        ],
        [
          "You can cancel anytime. Cancellation takes effect at the end of your current billing period—you keep access until then.",
        ],
        [
          "Payments are processed by Stripe. TinyPlan does not store your payment card details.",
        ],
        [
          "Refunds are handled on a case-by-case basis. If you’re unhappy, contact us and we’ll try to make it right.",
        ],
      ],
    },
    {
      kind: "callout",
      heading: "Not medical advice or therapy",
      intro: [
        "TinyPlan is a play-based enrichment tool. It is ",
        {
          bold: "not a substitute for professional medical, therapeutic, or developmental advice",
        },
        ".",
      ],
      list: [
        [
          "Activities are general play ideas, not therapy or treatment programs.",
        ],
        [
          "TinyPlan does not diagnose, treat, or claim to address any developmental condition.",
        ],
        [
          "SOS scripts provide general parenting guidance for common situations, not professional advice.",
        ],
        [
          "If you have concerns about your child’s development or well-being, consult a qualified healthcare professional.",
        ],
      ],
    },
    {
      heading: "Your responsibilities",
      list: [
        [
          "You are responsible for supervising your child during any activities suggested by TinyPlan.",
        ],
        [
          "You should use your own judgment about what is safe and appropriate for your child. Activity safety notes are provided as guidance, not guarantees.",
        ],
        [
          "You agree not to share your account or redistribute TinyPlan content commercially.",
        ],
      ],
    },
    {
      heading: "Content and intellectual property",
      paragraphs: [
        [
          "All activity plans, scripts, and content provided through TinyPlan are owned by TinyPlan. Your subscription gives you a personal, non-transferable license to use this content for your own family. You may not reproduce, distribute, or sell TinyPlan content.",
        ],
      ],
    },
    {
      heading: "Limitation of liability",
      paragraphs: [
        [
          "TinyPlan is provided “as is” without warranties of any kind, express or implied. To the fullest extent permitted by law, TinyPlan shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability is limited to the amount you have paid us in the 12 months preceding the claim.",
        ],
      ],
    },
    {
      heading: "Service availability",
      paragraphs: [
        [
          "We aim to keep TinyPlan available and reliable, but we cannot guarantee uninterrupted access. We may update, modify, or discontinue features with reasonable notice. If we discontinue the service entirely, we will provide at least 30 days’ notice and refund any prepaid amounts for unused service.",
        ],
      ],
    },
    {
      heading: "Termination",
      paragraphs: [
        [
          "You may close your account at any time by canceling your subscription and requesting account deletion. We may terminate or suspend your account if you violate these terms, with notice where reasonably possible.",
        ],
      ],
    },
    {
      heading: "Changes to these terms",
      paragraphs: [
        [
          "We may update these terms from time to time. If we make material changes, we will notify you by email at least 14 days before they take effect. Continued use of TinyPlan after changes take effect constitutes acceptance of the updated terms.",
        ],
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        [
          "Questions about these terms? Email ",
          { text: "hello@tinyplan.org", href: "mailto:hello@tinyplan.org" },
          ".",
        ],
      ],
    },
  ],
};

const ES: TermsContent = {
  backToHome: "Volver al inicio",
  title: "Términos del servicio",
  lastUpdatedLabel: "Última actualización:",
  lastUpdated: "27 de mayo de 2025",
  copyright: "© 2025 TinyPlan. Todos los derechos reservados.",
  footerPrivacy: "Política de privacidad",
  footerTerms: "Términos del servicio",
  homeAriaLabel: "Inicio de TinyPlan",
  sections: [
    {
      heading: "Acerca de TinyPlan",
      paragraphs: [
        [
          "TinyPlan ofrece planes personalizados de juego y rutinas para madres y padres de niños de 2 a 6 años. Después de completar un test sobre tus metas de crianza, tu horario y el rango de edad de tu peque, recibes un plan semanal de actividades de 7 días con guiones de qué decir, listas de qué necesitas y orientación paso a paso. Al usar TinyPlan, aceptas estos términos.",
        ],
      ],
    },
    {
      heading: "Cuenta y acceso",
      paragraphs: [
        [
          "Inicias sesión mediante un enlace mágico que se envía a tu correo electrónico. Eres responsable de mantener el acceso a tu cuenta de correo. Cada cuenta es para uso personal y no comercial de un solo hogar.",
        ],
      ],
    },
    {
      heading: "Suscripción y pago",
      list: [
        [
          "TinyPlan cuesta ",
          { bold: "$1 los primeros 7 días" },
          ", y luego ",
          { bold: "$14.99 al mes" },
          ".",
        ],
        [
          "Tu suscripción se renueva automáticamente cada mes hasta que la canceles.",
        ],
        [
          "Puedes cancelar cuando quieras. La cancelación entra en vigor al final de tu período de facturación actual: conservas el acceso hasta entonces.",
        ],
        [
          "Los pagos los procesa Stripe. TinyPlan no almacena los datos de tu tarjeta de pago.",
        ],
        [
          "Los reembolsos se gestionan caso por caso. Si no estás conforme, contáctanos e intentaremos solucionarlo.",
        ],
      ],
    },
    {
      kind: "callout",
      heading: "No es consejo médico ni terapia",
      intro: [
        "TinyPlan es una herramienta de enriquecimiento basada en el juego. ",
        {
          bold: "No sustituye el consejo profesional médico, terapéutico ni de desarrollo",
        },
        ".",
      ],
      list: [
        [
          "Las actividades son ideas de juego generales, no programas de terapia ni de tratamiento.",
        ],
        [
          "TinyPlan no diagnostica, no trata ni afirma abordar ninguna condición del desarrollo.",
        ],
        [
          "Los guiones SOS ofrecen orientación general de crianza para situaciones comunes, no consejo profesional.",
        ],
        [
          "Si tienes inquietudes sobre el desarrollo o el bienestar de tu peque, consulta a un profesional de la salud calificado.",
        ],
      ],
    },
    {
      heading: "Tus responsabilidades",
      list: [
        [
          "Eres responsable de supervisar a tu peque durante cualquier actividad sugerida por TinyPlan.",
        ],
        [
          "Debes usar tu propio criterio sobre lo que es seguro y apropiado para tu peque. Las notas de seguridad de las actividades se ofrecen como orientación, no como garantías.",
        ],
        [
          "Aceptas no compartir tu cuenta ni redistribuir comercialmente el contenido de TinyPlan.",
        ],
      ],
    },
    {
      heading: "Contenido y propiedad intelectual",
      paragraphs: [
        [
          "Todos los planes de actividades, guiones y contenidos ofrecidos a través de TinyPlan son propiedad de TinyPlan. Tu suscripción te otorga una licencia personal e intransferible para usar este contenido con tu propia familia. No puedes reproducir, distribuir ni vender el contenido de TinyPlan.",
        ],
      ],
    },
    {
      heading: "Limitación de responsabilidad",
      paragraphs: [
        [
          "TinyPlan se ofrece “tal cual”, sin garantías de ningún tipo, expresas o implícitas. En la máxima medida permitida por la ley, TinyPlan no será responsable de daños indirectos, incidentales o consecuentes que surjan del uso del servicio. Nuestra responsabilidad total se limita al importe que nos hayas pagado en los 12 meses anteriores a la reclamación.",
        ],
      ],
    },
    {
      heading: "Disponibilidad del servicio",
      paragraphs: [
        [
          "Procuramos mantener TinyPlan disponible y confiable, pero no podemos garantizar un acceso ininterrumpido. Podemos actualizar, modificar o suspender funciones con un aviso razonable. Si suspendemos el servicio por completo, daremos un aviso de al menos 30 días y reembolsaremos cualquier importe pagado por adelantado por el servicio no utilizado.",
        ],
      ],
    },
    {
      heading: "Terminación",
      paragraphs: [
        [
          "Puedes cerrar tu cuenta en cualquier momento cancelando tu suscripción y solicitando la eliminación de la cuenta. Podemos cancelar o suspender tu cuenta si incumples estos términos, con aviso previo cuando sea razonablemente posible.",
        ],
      ],
    },
    {
      heading: "Cambios en estos términos",
      paragraphs: [
        [
          "Es posible que actualicemos estos términos de vez en cuando. Si hacemos cambios importantes, te lo notificaremos por correo electrónico al menos 14 días antes de que entren en vigor. El uso continuado de TinyPlan después de que los cambios entren en vigor constituye la aceptación de los términos actualizados.",
        ],
      ],
    },
    {
      heading: "Contacto",
      paragraphs: [
        [
          "¿Tienes preguntas sobre estos términos? Escribe a ",
          { text: "hello@tinyplan.org", href: "mailto:hello@tinyplan.org" },
          ".",
        ],
      ],
    },
  ],
};

export function getTermsContent(locale: Locale): TermsContent {
  return locale === "en" ? EN : ES;
}

export const termsMeta: Record<
  Locale,
  { title: string; description: string }
> = {
  en: {
    title: "Terms of Service — TinyPlan",
    description:
      "Terms of Service for TinyPlan, a personalized play and routine planning service for parents.",
  },
  es: {
    title: "Términos del servicio — TinyPlan",
    description:
      "Términos del servicio de TinyPlan, un servicio de planificación personalizada de juego y rutinas para madres y padres.",
  },
};
