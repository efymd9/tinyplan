// Shell-specific bilingual copy for the quiz UI chrome.
//
// Generic chrome shared with the rest of the product (Back / Next / Continue /
// Skip / Loading / error messages) comes from the typed dictionary via `useT()`.
// This module holds only the copy that is unique to the quiz shell and not
// present in the quiz screen data itself (email-capture screen, validation,
// preview / name-input labels, "select up to N", progress counter, etc.).
//
// Neutral Latin American Spanish, informal "tú", warm and encouraging.
// "TinyPlan" is never translated.

import type { Locale } from "@/lib/i18n/config";

const COPY = {
  es: {
    goBack: "Volver",
    progressCounter: (current: number, total: number) => `${current}/${total}`,
    selectUpTo: (max: number) => `Selecciona hasta ${max}`,
    // Email-capture screen
    emailTitle: "¿Dónde guardamos tu plan?",
    emailSubtitle:
      "Guardaremos tu plan personalizado y te enviaremos tu primera semana.",
    emailPlaceholder: "tu@email.com",
    emailInvalid: "Ingresa un correo electrónico válido",
    saveMyPlan: "Guardar mi plan",
    privacyNote: "Cuidamos tus datos.",
    privacyLink: "Política de privacidad",
    // Name-input screen
    namePlaceholder: "Nombre o apodo",
    // Preview screen
    previewSubtitle: "Según tus respuestas, estamos creando:",
    previewImageAlt: "Descubriendo el perfil de juego único de tu peque",
  },
  en: {
    goBack: "Go back",
    progressCounter: (current: number, total: number) => `${current}/${total}`,
    selectUpTo: (max: number) => `Select up to ${max}`,
    // Email-capture screen
    emailTitle: "Where should we save your plan?",
    emailSubtitle:
      "We'll save your personalized plan and send your first week.",
    emailPlaceholder: "your@email.com",
    emailInvalid: "Please enter a valid email address",
    saveMyPlan: "Save my plan",
    privacyNote: "We respect your data.",
    privacyLink: "Privacy Policy",
    // Name-input screen
    namePlaceholder: "First name or nickname",
    // Preview screen
    previewSubtitle: "Based on your answers, we're building:",
    previewImageAlt: "Discovering your child's unique play profile",
  },
} as const;

export type ShellCopy = (typeof COPY)[Locale];

export function getShellCopy(locale: Locale): ShellCopy {
  return COPY[locale] ?? COPY.es;
}
