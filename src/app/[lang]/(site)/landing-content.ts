import type {
  IconTileTint,
  LandingIconName,
} from "@/components/landing/landing-icons";
import type { Locale } from "@/lib/i18n/config";

/* ── Types ────────────────────────────────────────────────── */

export interface LandingContent {
  meta: { title: string; description: string };
  nav: {
    howItWorks: string;
    whatYouGet: string;
    pricing: string;
    logIn: string;
    buildMyPlan: string;
    homeAria: string;
    primaryAria: string;
  };
  hero: {
    badge: string;
    headingLead: string;
    headingAccent: string;
    subhead: string;
    cta: string;
    ctaNote1: string;
    ctaNote2: string;
    illustrationAlt: string;
    floatToolkitLabel: string;
    floatToolkitFocus: string;
    floatToolkitSkillLabel: string;
    floatToolkitSkillValue: string;
    floatSosLabel: string;
    floatSosValue: string;
  };
  trustChips: { name: LandingIconName; label: string }[];
  pain: {
    eyebrow: string;
    heading: string;
    cards: {
      name: LandingIconName;
      tint: IconTileTint;
      title: string;
      text: string;
    }[];
  };
  dayPreview: {
    eyebrow: string;
    heading: string;
    body: string;
    chips: string[];
    tapHint: string;
    phoneToolkitLabel: string;
    phoneFocus: string;
    items: {
      n: number;
      name: string;
      value: string;
      icon: LandingIconName;
      tint: IconTileTint;
      body?: string;
      steps?: string[];
      open?: boolean;
    }[];
  };
  toolkit: {
    eyebrow: string;
    heading: string;
    body: string;
    cards: {
      name: LandingIconName;
      tint: IconTileTint;
      title: string;
      text: string;
    }[];
    ctaCardText: string;
    ctaCardButton: string;
  };
  howItWorks: {
    eyebrow: string;
    heading: string;
    body: string;
    steps: { name: LandingIconName; title: string; text: string }[];
    quizImageAlt: string;
    personalization: {
      name: LandingIconName;
      tint: IconTileTint;
      input: string;
      output: string;
    }[];
  };
  growthPath: {
    eyebrow: string;
    heading: string;
    body: string;
    dayLabel: string;
    items: { day: number; skill: string; text: string }[];
    closingText: string;
  };
  sos: {
    eyebrow: string;
    heading: string;
    body: string;
    chatUser: string;
    chatReply: string;
    footnote: string;
    cardsLabel: string;
    cards: { name: LandingIconName; label: string }[];
  };
  insights: {
    eyebrow: string;
    heading: string;
    body: string;
    items: { feedback: string; adjustment: string }[];
  };
  library: {
    eyebrow: string;
    heading: string;
    body: string;
    imageAlt: string;
    tabs: {
      name: LandingIconName;
      tint: IconTileTint;
      title: string;
      text: string;
    }[];
  };
  safety: {
    eyebrow: string;
    heading: string;
    points: {
      name: LandingIconName;
      tint: IconTileTint;
      title: string;
      text: string;
    }[];
  };
  pricing: {
    eyebrow: string;
    heading: string;
    price: string;
    priceUnit: string;
    priceNote: string;
    includes: string[];
    cta: string;
    seeFull: string;
  };
  faq: {
    eyebrow: string;
    heading: string;
    items: { q: string; a: string }[];
  };
  finalCta: {
    headingLead: string;
    headingAccent: string;
    body: string;
    cta: string;
    note: string;
  };
  footer: {
    rights: string;
    privacy: string;
    terms: string;
    contact: string;
  };
}

/* ── Content ──────────────────────────────────────────────── */

const en: LandingContent = {
  meta: {
    title: "TinyPlan — A personalized 7-day parent toolkit",
    description:
      "TinyPlan builds a personalized 7-day toolkit around your child's age, your routine, and what feels hardest right now — play moments, parent skills, ready-to-use scripts, and SOS support. For ages 2–6.",
  },
  nav: {
    howItWorks: "How it works",
    whatYouGet: "What you get",
    pricing: "Pricing",
    logIn: "Log in",
    buildMyPlan: "Build my plan",
    homeAria: "TinyPlan home",
    primaryAria: "Primary",
  },
  hero: {
    badge: "A 7-day parent toolkit",
    headingLead: "Know what to do — and what to say —",
    headingAccent: "during the hard moments.",
    subhead:
      "TinyPlan builds a 7-day parent toolkit around your child's age, your routine, and what feels hardest right now. Every day you get one play moment, one parent skill, ready-to-use scripts, and SOS support.",
    cta: "Build my free plan",
    ctaNote1: "Takes 3 minutes.",
    ctaNote2: "No signup to start.",
    illustrationAlt:
      "A calm parent and child enjoying an offline play moment together",
    floatToolkitLabel: "Today's Toolkit",
    floatToolkitFocus: "Focus: Calmer transitions",
    floatToolkitSkillLabel: "Parent Skill",
    floatToolkitSkillValue: "Small Control",
    floatSosLabel: "SOS ready",
    floatSosValue: "Help in the moment",
  },
  trustChips: [
    { name: "calendar", label: "Ages 2–6" },
    { name: "shield", label: "No child diagnosis" },
    { name: "screen-off", label: "No extra screen time" },
    { name: "heart", label: "Parent-first" },
    { name: "refresh", label: "Cancel anytime" },
  ],
  pain: {
    eyebrow: "Does this sound familiar?",
    heading: "You want calmer days, but real life gets messy fast.",
    cards: [
      {
        name: "screen-off",
        tint: "lavender",
        title: "Screens became the default",
        text: "You want fewer screen battles, but need realistic alternatives that actually work.",
      },
      {
        name: "transition",
        tint: "peach",
        title: "Transitions turn emotional",
        text: "Leaving the park, stopping a show, starting bedtime — tiny moments can become huge.",
      },
      {
        name: "lightbulb",
        tint: "gold",
        title: "You run out of play ideas",
        text: "You don't need 100 ideas. You need the right next idea for today.",
      },
      {
        name: "speech",
        tint: "sage",
        title: "You feel unsure what to say",
        text: "TinyPlan gives you exact words for the moments where you usually freeze.",
      },
    ],
  },
  dayPreview: {
    eyebrow: "The daily toolkit",
    heading: "Here's what one day looks like",
    body: "Real parenting doesn't need more pressure. It needs a next step. TinyPlan turns “what do I do now?” into one small, doable plan — with the exact words to go with it.",
    chips: ["7–10 min", "Low prep", "Age 5"],
    tapHint: "Tap any card below to see how a single day unfolds.",
    phoneToolkitLabel: "Today's Toolkit",
    phoneFocus: "Focus: Calmer transitions",
    items: [
      {
        n: 1,
        name: "Play Moment",
        value: "Tiny City Choices",
        icon: "blocks",
        tint: "peach",
        body: "A quick build-and-choose game matched to your child's age and energy.",
      },
      {
        n: 2,
        name: "Parent Skill",
        value: "Small Control",
        icon: "spark",
        tint: "lavender",
        open: true,
        steps: ["Name the limit", "Name the feeling", "Offer two choices"],
      },
      {
        n: 3,
        name: "Scripts",
        value: "What to say if they resist",
        icon: "script",
        tint: "sage",
        body: "First / then / done — plus the exact words to use if your child pushes back.",
      },
      {
        n: 4,
        name: "If It Gets Hard",
        value: "Backup reset",
        icon: "lifebuoy",
        tint: "blush",
        body: "A calmer fallback for when they say no, lose interest, or melt down.",
      },
      {
        n: 5,
        name: "Tiny Check-in",
        value: "Adjust tomorrow",
        icon: "check-circle",
        tint: "gold",
        body: "One tap tells TinyPlan how it went — and shapes tomorrow's plan.",
      },
    ],
  },
  toolkit: {
    eyebrow: "What you get every day",
    heading: "One complete parent toolkit, every day",
    body: "Not just an activity. A small plan for what to do, what to say, and how to respond.",
    cards: [
      {
        name: "blocks",
        tint: "peach",
        title: "Play Moment",
        text: "A realistic activity matched to your child's age, energy, and the time you actually have.",
      },
      {
        name: "spark",
        tint: "lavender",
        title: "Parent Skill",
        text: "A tiny parenting move to practice today — like Small Control or Predictable Start.",
      },
      {
        name: "script",
        tint: "sage",
        title: "Ready-to-use Scripts",
        text: "Exact words for starting, resistance, big feelings, and transitions.",
      },
      {
        name: "lifebuoy",
        tint: "blush",
        title: "If It Gets Hard",
        text: "A backup plan for when your child says no, loses interest, or melts down.",
      },
      {
        name: "check-circle",
        tint: "gold",
        title: "Tiny Check-in",
        text: "Your feedback helps TinyPlan adjust tomorrow's plan.",
      },
    ],
    ctaCardText:
      "Five pieces. One simple plan. Built fresh for each of your 7 days.",
    ctaCardButton: "Build my free plan",
  },
  howItWorks: {
    eyebrow: "How it works",
    heading: "Built from your answers",
    body: "TinyPlan uses your child's age, your routine, available time, materials, and hardest moments to build a plan you can actually follow.",
    steps: [
      {
        name: "check-circle",
        title: "Take the 3-minute quiz",
        text: "Tell us your child's age, your routine, and what feels hardest right now.",
      },
      {
        name: "spark",
        title: "Get your personalized toolkit",
        text: "A 7-day plan built from your answers — play, scripts, skills, and SOS support.",
      },
      {
        name: "refresh",
        title: "Open one small plan a day",
        text: "Check in after each day and TinyPlan adjusts tomorrow to fit real life.",
      },
    ],
    quizImageAlt:
      "A few simple quiz answers shaping a personalized weekly plan",
    personalization: [
      {
        name: "calendar",
        tint: "sage",
        input: "Child's age",
        output:
          "Age-appropriate activities and scripts — no reading-heavy tasks for 2-year-olds.",
      },
      {
        name: "alert",
        tint: "peach",
        input: "Hardest moment",
        output:
          "Your daily focus and SOS cards are prioritized around that pain point.",
      },
      {
        name: "clock",
        tint: "lavender",
        input: "Time available",
        output: "3-minute, 7-minute, and 15-minute versions of every plan.",
      },
      {
        name: "user",
        tint: "gold",
        input: "Child's play style",
        output:
          "A play profile: Curious Builder, Active Explorer, Routine Seeker, or Story Starter.",
      },
      {
        name: "lifebuoy",
        tint: "blush",
        input: "Parent obstacle",
        output:
          "Backup cards for “child refuses,” “I'm too tired,” or “no materials.”",
      },
      {
        name: "home",
        tint: "sage",
        input: "Materials at home",
        output: "Activities filtered to what your family can actually do.",
      },
    ],
  },
  growthPath: {
    eyebrow: "Parent growth path",
    heading: "TinyPlan helps you build your parent toolkit",
    body: "Each day teaches one small skill you can use beyond the activity — during bedtime, screen transitions, refusals, and everyday chaos.",
    dayLabel: "Day",
    items: [
      {
        day: 1,
        skill: "Small Control",
        text: "Give one small choice when something can't change.",
      },
      {
        day: 2,
        skill: "Predictable Start",
        text: "Make the next step clear with first / then / done.",
      },
      {
        day: 3,
        skill: "Name Before Fixing",
        text: "Help feelings settle before trying to solve.",
      },
      {
        day: 4,
        skill: "Say Less, Show More",
        text: "Use fewer words and more simple action.",
      },
      {
        day: 5,
        skill: "Start Smaller",
        text: "Make the first step so easy your child can join.",
      },
      {
        day: 6,
        skill: "Calm Boundary",
        text: "Hold the line without turning it into a lecture.",
      },
      {
        day: 7,
        skill: "Repair & Repeat",
        text: "Notice what worked and build your family rhythm.",
      },
    ],
    closingText: "Seven small skills that add up to a calmer family rhythm.",
  },
  sos: {
    eyebrow: "SOS coach",
    heading: "When the plan falls apart, TinyPlan stays useful",
    body: "Ask what to say when screen time ends, bedtime explodes, your child refuses, or you are too tired to think.",
    chatUser: "My child is melting down because screen time ended.",
    chatReply:
      "First, don't explain yet. Name the want, hold the boundary, then offer one small choice.",
    footnote:
      "You get the first 30 seconds, exact words, what __not__ to do, a tiny next step — and whether to adjust tomorrow.",
    cardsLabel: "Quick SOS cards, ready when you need them:",
    cards: [
      { name: "screen-off", label: "Screen time ending" },
      { name: "clock", label: "Bedtime battle" },
      { name: "alert", label: "Child says no" },
      { name: "speech", label: "Public meltdown" },
      { name: "transition", label: "Sibling conflict" },
      { name: "heart", label: "Parent needs a moment" },
    ],
  },
  insights: {
    eyebrow: "Adaptive insights",
    heading: "Your plan learns from what actually happens",
    body: "After each tiny check-in, TinyPlan can make tomorrow shorter, calmer, more active, or easier to start.",
    items: [
      {
        feedback: "“Too hard”",
        adjustment: "Tomorrow starts with a shorter version and fewer steps.",
      },
      {
        feedback: "“Child refused”",
        adjustment:
          "Tomorrow includes a gentler entry point and a backup script.",
      },
      {
        feedback: "“Loved it”",
        adjustment:
          "TinyPlan keeps the same play style and adds slight variety.",
      },
      {
        feedback: "“I'm too tired”",
        adjustment: "Tomorrow prioritizes no-prep, parent-light activities.",
      },
      {
        feedback: "SOS used twice for bedtime",
        adjustment: "Next week adds more bedtime transition support.",
      },
    ],
  },
  library: {
    eyebrow: "Library & parent tools",
    heading: "A structured toolkit, not a pile of random games",
    body: "Everything is organized so you can find the right support in seconds — whatever today throws at you.",
    imageAlt: "An organized library of activities, skills, scripts, and resets",
    tabs: [
      {
        name: "grid",
        tint: "peach",
        title: "Activities",
        text: "Age-appropriate play moments, no-prep ideas, indoor and outdoor, bedtime, and movement.",
      },
      {
        name: "spark",
        tint: "lavender",
        title: "Parent Skills",
        text: "Small Control, Predictable Start, Calm Boundary, Repair After No, and Start Smaller.",
      },
      {
        name: "script",
        tint: "sage",
        title: "Scripts",
        text: "Exact words for transitions, refusals, ending screen time, and bedtime.",
      },
      {
        name: "timer",
        tint: "gold",
        title: "3-Min Resets",
        text: "Fast tools for hard moments when you have no energy left.",
      },
      {
        name: "lifebuoy",
        tint: "blush",
        title: "SOS Cards",
        text: "Ready-made response flows for the most common difficult situations.",
      },
    ],
  },
  safety: {
    eyebrow: "Safety & trust",
    heading:
      "Built for real parents. Not medical advice. Not another screen for your child.",
    points: [
      {
        name: "shield",
        tint: "sage",
        title: "No diagnosis",
        text: "TinyPlan does not diagnose, treat, or replace professional support.",
      },
      {
        name: "user",
        tint: "peach",
        title: "Parent-first",
        text: "The app is for the parent. Activities happen offline, with your child.",
      },
      {
        name: "lock",
        tint: "sage",
        title: "No unnecessary child data",
        text: "We ask only what is needed to build your plan — never a child's name or photo.",
      },
      {
        name: "heart",
        tint: "blush",
        title: "No guilt",
        text: "Realistic small moments, not a picture of perfect parenting.",
      },
      {
        name: "calendar",
        tint: "lavender",
        title: "Age-appropriate",
        text: "Activities change based on age and attention span.",
      },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    heading: "Your personalized 7-day toolkit is ready after the quiz",
    price: "$1",
    priceUnit: "for 7 days",
    priceNote: "Then $14.99/month. Cancel anytime.",
    includes: [
      "A daily parent toolkit",
      "Age-appropriate activities",
      "Parent skill lessons",
      "Ready-to-use scripts",
      "SOS coach",
      "Adaptive insights",
      "Weekly check-ins",
    ],
    cta: "Build my free plan",
    seeFull: "See full plan & pricing",
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions, answered",
    items: [
      {
        q: "Is TinyPlan for my child or for me?",
        a: "TinyPlan is for parents and caregivers. Your child doesn't need to use the app — you use it to get offline play ideas, scripts, and support.",
      },
      {
        q: "What ages is it for?",
        a: "TinyPlan is designed for ages 2–6. The quiz changes activities and scripts based on age and attention span.",
      },
      {
        q: "Is this therapy or medical advice?",
        a: "No. TinyPlan does not diagnose, treat, or replace professional advice. It gives practical parent support for everyday routines and hard moments.",
      },
      {
        q: "Do I need special toys?",
        a: "No. TinyPlan can build plans around what you already have: paper, blocks, books, kitchen items, or nothing special.",
      },
      {
        q: "How much time do I need?",
        a: "Most plans include 3-minute, 7-minute, and longer versions, depending on your quiz answers and feedback.",
      },
      {
        q: "Can I cancel?",
        a: "Yes. Start for $1 for 7 days, then $14.99/month. Cancel anytime.",
      },
      {
        q: "Will this add screen time?",
        a: "No. TinyPlan is for the parent. The activities are designed to happen offline.",
      },
    ],
  },
  finalCta: {
    headingLead: "Less guessing.",
    headingAccent: "More confident parenting.",
    body: "Start with a free quiz and unlock a personalized 7-day toolkit built around your real life.",
    cta: "Build my free plan",
    note: "Takes 3 minutes. No signup to start.",
  },
  footer: {
    rights: "© 2026 TinyPlan. All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact",
  },
};

const es: LandingContent = {
  meta: {
    title: "TinyPlan — Un kit de herramientas para mamás y papás, 7 días personalizados",
    description:
      "TinyPlan crea un kit de herramientas de 7 días personalizado según la edad de tu peque, tu rutina y lo que hoy se te hace más difícil: momentos de juego, habilidades para mamás y papás, qué decir listo para usar y apoyo SOS. Para niños de 2 a 6 años.",
  },
  nav: {
    howItWorks: "Cómo funciona",
    whatYouGet: "Qué incluye",
    pricing: "Precios",
    logIn: "Iniciar sesión",
    buildMyPlan: "Crear mi plan",
    homeAria: "Inicio de TinyPlan",
    primaryAria: "Principal",
  },
  hero: {
    badge: "Un kit de herramientas de 7 días",
    headingLead: "Ten claro qué hacer — y qué decir —",
    headingAccent: "en los momentos difíciles.",
    subhead:
      "TinyPlan crea un kit de herramientas de 7 días alrededor de la edad de tu peque, tu rutina y lo que hoy se te hace más difícil. Cada día recibes un momento de juego, una habilidad para mamás y papás, qué decir listo para usar y apoyo SOS.",
    cta: "Crear mi plan gratis",
    ctaNote1: "Toma 3 minutos.",
    ctaNote2: "Sin registro para empezar.",
    illustrationAlt:
      "Una mamá o papá tranquilo y su peque disfrutando juntos de un momento de juego sin pantallas",
    floatToolkitLabel: "Kit de hoy",
    floatToolkitFocus: "Enfoque: Transiciones más tranquilas",
    floatToolkitSkillLabel: "Habilidad para mamás y papás",
    floatToolkitSkillValue: "Control pequeño",
    floatSosLabel: "SOS listo",
    floatSosValue: "Ayuda en el momento",
  },
  trustChips: [
    { name: "calendar", label: "De 2 a 6 años" },
    { name: "shield", label: "Sin diagnóstico infantil" },
    { name: "screen-off", label: "Sin pantallas extra" },
    { name: "heart", label: "Primero tú, mamá o papá" },
    { name: "refresh", label: "Cancela cuando quieras" },
  ],
  pain: {
    eyebrow: "¿Te suena familiar?",
    heading: "Quieres días más tranquilos, pero la vida real se complica rápido.",
    cards: [
      {
        name: "screen-off",
        tint: "lavender",
        title: "Las pantallas se volvieron la opción fácil",
        text: "Quieres menos peleas por las pantallas, pero necesitas alternativas realistas que de verdad funcionen.",
      },
      {
        name: "transition",
        tint: "peach",
        title: "Las transiciones se vuelven emocionales",
        text: "Salir del parque, apagar la tele, empezar la hora de dormir: los momentos pequeños pueden volverse enormes.",
      },
      {
        name: "lightbulb",
        tint: "gold",
        title: "Te quedas sin ideas de juego",
        text: "No necesitas 100 ideas. Necesitas la idea correcta para hoy.",
      },
      {
        name: "speech",
        tint: "sage",
        title: "No sabes bien qué decir",
        text: "TinyPlan te da las palabras exactas para esos momentos en que sueles quedarte en blanco.",
      },
    ],
  },
  dayPreview: {
    eyebrow: "El kit diario",
    heading: "Así se ve un día",
    body: "Criar no necesita más presión. Necesita un siguiente paso. TinyPlan convierte el “¿y ahora qué hago?” en un plan pequeño y realista, con las palabras exactas para acompañarlo.",
    chips: ["7–10 min", "Poca preparación", "5 años"],
    tapHint: "Toca cualquier tarjeta para ver cómo se desarrolla un solo día.",
    phoneToolkitLabel: "Kit de hoy",
    phoneFocus: "Enfoque: Transiciones más tranquilas",
    items: [
      {
        n: 1,
        name: "Momento de juego",
        value: "Pequeñas decisiones de ciudad",
        icon: "blocks",
        tint: "peach",
        body: "Un juego rápido de construir y elegir, ajustado a la edad y la energía de tu peque.",
      },
      {
        n: 2,
        name: "Habilidad para mamás y papás",
        value: "Control pequeño",
        icon: "spark",
        tint: "lavender",
        open: true,
        steps: ["Nombra el límite", "Nombra la emoción", "Ofrece dos opciones"],
      },
      {
        n: 3,
        name: "Qué decir",
        value: "Qué decir si se resiste",
        icon: "script",
        tint: "sage",
        body: "Primero / luego / listo, más las palabras exactas para usar si tu peque se opone.",
      },
      {
        n: 4,
        name: "Si se pone difícil",
        value: "Reinicio de respaldo",
        icon: "lifebuoy",
        tint: "blush",
        body: "Una alternativa más tranquila para cuando dice que no, pierde el interés o se desborda.",
      },
      {
        n: 5,
        name: "Mini check-in",
        value: "Ajusta para mañana",
        icon: "check-circle",
        tint: "gold",
        body: "Con un toque le dices a TinyPlan cómo fue, y eso da forma al plan de mañana.",
      },
    ],
  },
  toolkit: {
    eyebrow: "Qué recibes cada día",
    heading: "Un kit de herramientas completo, cada día",
    body: "No solo una actividad. Un plan pequeño de qué hacer, qué decir y cómo responder.",
    cards: [
      {
        name: "blocks",
        tint: "peach",
        title: "Momento de juego",
        text: "Una actividad realista ajustada a la edad y la energía de tu peque, y al tiempo que de verdad tienes.",
      },
      {
        name: "spark",
        tint: "lavender",
        title: "Habilidad para mamás y papás",
        text: "Un pequeño gesto de crianza para practicar hoy, como Control pequeño o Inicio predecible.",
      },
      {
        name: "script",
        tint: "sage",
        title: "Qué decir, listo para usar",
        text: "Palabras exactas para empezar, para la resistencia, para las emociones intensas y para las transiciones.",
      },
      {
        name: "lifebuoy",
        tint: "blush",
        title: "Si se pone difícil",
        text: "Un plan de respaldo para cuando tu peque dice que no, pierde el interés o se desborda.",
      },
      {
        name: "check-circle",
        tint: "gold",
        title: "Mini check-in",
        text: "Tu comentario ayuda a que TinyPlan ajuste el plan de mañana.",
      },
    ],
    ctaCardText:
      "Cinco piezas. Un plan sencillo. Creado de cero para cada uno de tus 7 días.",
    ctaCardButton: "Crear mi plan gratis",
  },
  howItWorks: {
    eyebrow: "Cómo funciona",
    heading: "Creado a partir de tus respuestas",
    body: "TinyPlan usa la edad de tu peque, tu rutina, el tiempo disponible, los materiales y los momentos más difíciles para crear un plan que de verdad puedas seguir.",
    steps: [
      {
        name: "check-circle",
        title: "Haz el test de 3 minutos",
        text: "Cuéntanos la edad de tu peque, tu rutina y lo que hoy se te hace más difícil.",
      },
      {
        name: "spark",
        title: "Recibe tu kit personalizado",
        text: "Un plan de 7 días creado a partir de tus respuestas: juego, qué decir, habilidades y apoyo SOS.",
      },
      {
        name: "refresh",
        title: "Abre un plan pequeño al día",
        text: "Haz tu check-in después de cada día y TinyPlan ajusta el mañana para que se adapte a la vida real.",
      },
    ],
    quizImageAlt:
      "Unas pocas respuestas sencillas del test dando forma a un plan semanal personalizado",
    personalization: [
      {
        name: "calendar",
        tint: "sage",
        input: "Edad de tu peque",
        output:
          "Actividades y qué decir apropiados para su edad: nada de tareas con mucha lectura para niños de 2 años.",
      },
      {
        name: "alert",
        tint: "peach",
        input: "Momento más difícil",
        output:
          "Tu enfoque diario y las tarjetas SOS se priorizan según ese punto de dolor.",
      },
      {
        name: "clock",
        tint: "lavender",
        input: "Tiempo disponible",
        output: "Versiones de 3, 7 y 15 minutos de cada plan.",
      },
      {
        name: "user",
        tint: "gold",
        input: "Estilo de juego de tu peque",
        output:
          "Un perfil de juego: Constructor curioso, Explorador activo, Buscador de rutina o Narrador de historias.",
      },
      {
        name: "lifebuoy",
        tint: "blush",
        input: "Tu obstáculo como mamá o papá",
        output:
          "Tarjetas de respaldo para “se niega”, “estoy muy cansado(a)” o “no tengo materiales”.",
      },
      {
        name: "home",
        tint: "sage",
        input: "Materiales en casa",
        output: "Actividades filtradas según lo que tu familia de verdad puede hacer.",
      },
    ],
  },
  growthPath: {
    eyebrow: "Tu camino de crecimiento",
    heading: "TinyPlan te ayuda a armar tu kit de herramientas",
    body: "Cada día aprendes una pequeña habilidad que puedes usar más allá de la actividad: en la hora de dormir, en las transiciones de pantalla, ante las negativas y en el caos de todos los días.",
    dayLabel: "Día",
    items: [
      {
        day: 1,
        skill: "Control pequeño",
        text: "Ofrece una pequeña opción cuando algo no se puede cambiar.",
      },
      {
        day: 2,
        skill: "Inicio predecible",
        text: "Deja claro el siguiente paso con primero / luego / listo.",
      },
      {
        day: 3,
        skill: "Nombrar antes de resolver",
        text: "Ayuda a que las emociones se calmen antes de intentar resolver.",
      },
      {
        day: 4,
        skill: "Habla menos, muestra más",
        text: "Usa menos palabras y más acciones simples.",
      },
      {
        day: 5,
        skill: "Empieza más pequeño",
        text: "Haz el primer paso tan fácil que tu peque quiera sumarse.",
      },
      {
        day: 6,
        skill: "Límite con calma",
        text: "Mantén el límite sin convertirlo en un sermón.",
      },
      {
        day: 7,
        skill: "Reparar y repetir",
        text: "Nota qué funcionó y construye el ritmo de tu familia.",
      },
    ],
    closingText:
      "Siete pequeñas habilidades que suman un ritmo familiar más tranquilo.",
  },
  sos: {
    eyebrow: "Coach SOS",
    heading: "Cuando el plan se cae, TinyPlan sigue siendo útil",
    body: "Pregunta qué decir cuando se acaba el tiempo de pantalla, la hora de dormir explota, tu peque se niega o estás demasiado cansado(a) para pensar.",
    chatUser: "Mi peque está teniendo un berrinche porque se acabó el tiempo de pantalla.",
    chatReply:
      "Primero, no expliques todavía. Nombra el deseo, mantén el límite y luego ofrece una pequeña opción.",
    footnote:
      "Recibes los primeros 30 segundos, las palabras exactas, qué __no__ hacer, un siguiente paso pequeño, y si conviene ajustar mañana.",
    cardsLabel: "Tarjetas SOS rápidas, listas cuando las necesites:",
    cards: [
      { name: "screen-off", label: "Se acaba el tiempo de pantalla" },
      { name: "clock", label: "Batalla a la hora de dormir" },
      { name: "alert", label: "Tu peque dice que no" },
      { name: "speech", label: "Berrinche en público" },
      { name: "transition", label: "Conflicto entre hermanos" },
      { name: "heart", label: "Mamá o papá necesita un respiro" },
    ],
  },
  insights: {
    eyebrow: "Ajustes inteligentes",
    heading: "Tu plan aprende de lo que de verdad pasa",
    body: "Después de cada mini check-in, TinyPlan puede hacer que mañana sea más corto, más tranquilo, más activo o más fácil de empezar.",
    items: [
      {
        feedback: "“Muy difícil”",
        adjustment: "Mañana empieza con una versión más corta y menos pasos.",
      },
      {
        feedback: "“Se negó”",
        adjustment:
          "Mañana incluye un punto de entrada más suave y un guion de respaldo.",
      },
      {
        feedback: "“Le encantó”",
        adjustment:
          "TinyPlan mantiene el mismo estilo de juego y agrega un poco de variedad.",
      },
      {
        feedback: "“Estoy muy cansado(a)”",
        adjustment: "Mañana prioriza actividades sin preparación y con poco esfuerzo para ti.",
      },
      {
        feedback: "Usaste SOS dos veces para la hora de dormir",
        adjustment: "La próxima semana agrega más apoyo para la transición a la hora de dormir.",
      },
    ],
  },
  library: {
    eyebrow: "Biblioteca y herramientas para mamás y papás",
    heading: "Un kit organizado, no un montón de juegos al azar",
    body: "Todo está organizado para que encuentres el apoyo correcto en segundos, sin importar lo que traiga el día de hoy.",
    imageAlt:
      "Una biblioteca organizada de actividades, habilidades, qué decir y reinicios",
    tabs: [
      {
        name: "grid",
        tint: "peach",
        title: "Actividades",
        text: "Momentos de juego apropiados para la edad, ideas sin preparación, de interior y exterior, para dormir y para moverse.",
      },
      {
        name: "spark",
        tint: "lavender",
        title: "Habilidades para mamás y papás",
        text: "Control pequeño, Inicio predecible, Límite con calma, Reparar después del no y Empieza más pequeño.",
      },
      {
        name: "script",
        tint: "sage",
        title: "Qué decir",
        text: "Palabras exactas para las transiciones, las negativas, el fin del tiempo de pantalla y la hora de dormir.",
      },
      {
        name: "timer",
        tint: "gold",
        title: "Reinicios de 3 min",
        text: "Herramientas rápidas para los momentos difíciles cuando ya no te queda energía.",
      },
      {
        name: "lifebuoy",
        tint: "blush",
        title: "Tarjetas SOS",
        text: "Respuestas listas para las situaciones difíciles más comunes.",
      },
    ],
  },
  safety: {
    eyebrow: "Seguridad y confianza",
    heading:
      "Hecho para mamás y papás reales. No es consejo médico. No es otra pantalla para tu peque.",
    points: [
      {
        name: "shield",
        tint: "sage",
        title: "Sin diagnósticos",
        text: "TinyPlan no diagnostica, no trata ni reemplaza el apoyo profesional.",
      },
      {
        name: "user",
        tint: "peach",
        title: "Primero tú, mamá o papá",
        text: "La app es para ti. Las actividades pasan sin pantallas, junto a tu peque.",
      },
      {
        name: "lock",
        tint: "sage",
        title: "Sin datos innecesarios del peque",
        text: "Solo pedimos lo necesario para crear tu plan: nunca el nombre ni una foto de tu peque.",
      },
      {
        name: "heart",
        tint: "blush",
        title: "Sin culpa",
        text: "Momentos pequeños y realistas, no una imagen de crianza perfecta.",
      },
      {
        name: "calendar",
        tint: "lavender",
        title: "Apropiado para la edad",
        text: "Las actividades cambian según la edad y la capacidad de atención.",
      },
    ],
  },
  pricing: {
    eyebrow: "Precios",
    heading: "Tu kit de 7 días personalizado queda listo después del test",
    price: "$1",
    priceUnit: "por 7 días",
    priceNote: "Luego $14.99 al mes. Cancela cuando quieras.",
    includes: [
      "Un kit de herramientas diario",
      "Actividades apropiadas para la edad",
      "Lecciones de habilidades para mamás y papás",
      "Qué decir, listo para usar",
      "Coach SOS",
      "Ajustes inteligentes",
      "Check-ins semanales",
    ],
    cta: "Crear mi plan gratis",
    seeFull: "Ver el plan completo y los precios",
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    heading: "Tus preguntas, respondidas",
    items: [
      {
        q: "¿TinyPlan es para mi peque o para mí?",
        a: "TinyPlan es para mamás, papás y cuidadores. Tu peque no necesita usar la app: tú la usas para obtener ideas de juego sin pantallas, qué decir y apoyo.",
      },
      {
        q: "¿Para qué edades es?",
        a: "TinyPlan está diseñado para niños de 2 a 6 años. El test cambia las actividades y qué decir según la edad y la capacidad de atención.",
      },
      {
        q: "¿Esto es terapia o consejo médico?",
        a: "No. TinyPlan no diagnostica, no trata ni reemplaza el consejo profesional. Te da apoyo práctico para las rutinas de todos los días y los momentos difíciles.",
      },
      {
        q: "¿Necesito juguetes especiales?",
        a: "No. TinyPlan puede crear planes con lo que ya tienes: papel, bloques, libros, cosas de cocina o nada en especial.",
      },
      {
        q: "¿Cuánto tiempo necesito?",
        a: "La mayoría de los planes incluyen versiones de 3 minutos, 7 minutos y más largas, según tus respuestas del test y tus comentarios.",
      },
      {
        q: "¿Puedo cancelar?",
        a: "Sí. Empieza con $1 por 7 días, luego $14.99 al mes. Cancela cuando quieras.",
      },
      {
        q: "¿Esto agrega tiempo de pantalla?",
        a: "No. TinyPlan es para ti, mamá o papá. Las actividades están pensadas para hacerse sin pantallas.",
      },
    ],
  },
  finalCta: {
    headingLead: "Menos adivinar.",
    headingAccent: "Más confianza al criar.",
    body: "Empieza con un test gratis y desbloquea un kit de 7 días personalizado, creado alrededor de tu vida real.",
    cta: "Crear mi plan gratis",
    note: "Toma 3 minutos. Sin registro para empezar.",
  },
  footer: {
    rights: "© 2026 TinyPlan. Todos los derechos reservados.",
    privacy: "Política de privacidad",
    terms: "Términos del servicio",
    contact: "Contacto",
  },
};

/* ── Getter ───────────────────────────────────────────────── */

export function getLandingContent(locale: Locale): LandingContent {
  return { es, en }[locale];
}
