// ── Personalized Routine Layer ──────────────────────────────────────────────

import type { Locale } from '@/lib/i18n/config';

export interface Routine {
  id: string;
  type: string;
  title: string;
  whenToUse: string;
  steps: string[]; // exactly 4 short steps
  script: string; // parent script for the routine
  relatedGoal: string;
  relatedPain: string;
}

// ── Routine Definitions ────────────────────────────────────────────────────

const screenToCalm: Routine = {
  id: 'screen-to-calm',
  type: 'transition',
  title: 'Screen-to-Calm Evening Routine',
  whenToUse: 'Use this whenever screen time ends this week.',
  steps: [
    '1. Name the ending: "Screens are resting now."',
    '2. Put the device to sleep together.',
    '3. Start one tiny offline action.',
    '4. Move into today\'s low-energy activity.',
  ],
  script:
    'The screen is going to sleep now. Let\'s put it to bed together. Now, what should we do with our hands?',
  relatedGoal: 'fewer_screens',
  relatedPain: 'screen_time',
};

const afterPreschoolReset: Routine = {
  id: 'after-preschool-reset',
  type: 'transition',
  title: 'After-Preschool Reset',
  whenToUse:
    'Use this when your child comes home from preschool or daycare.',
  steps: [
    '1. Snack and water first — no questions yet.',
    '2. Quick body reset: 3 big jumps or shake it out.',
    '3. Offer one tiny choice: "Draw or play?"',
    '4. Start a low-prep activity together.',
  ],
  script:
    "You're home! Here's your snack. When you're ready, we'll find something fun to do. No rush.",
  relatedGoal: 'calmer_transitions',
  relatedPain: 'transitions',
};

const bedtimeSoftLanding: Routine = {
  id: 'bedtime-soft-landing',
  type: 'wind-down',
  title: 'Bedtime Soft Landing',
  whenToUse: 'Use this when evenings feel chaotic.',
  steps: [
    '1. Dim the lights and lower your voice.',
    '2. Offer one small cosy choice.',
    '3. Start tonight\'s calm activity.',
    '4. End with one closing phrase: "Everything is done for today."',
  ],
  script:
    "The day is winding down. Let's make things cosy. Which story shall we pick tonight?",
  relatedGoal: 'easier_bedtime',
  relatedPain: 'bedtime',
};

const bigFeelingsReset: Routine = {
  id: 'big-feelings-reset',
  type: 'emotional',
  title: 'Big Feelings Reset',
  whenToUse: 'Use this when emotions run high.',
  steps: [
    '1. Name the feeling in simple words.',
    '2. Reduce your language — fewer words, softer voice.',
    '3. Offer a body reset: squeeze, jump, or deep breaths.',
    '4. Offer one tiny choice to move forward.',
  ],
  script:
    "You're having a big feeling right now. I'm here. Let's take a breath together.",
  relatedGoal: 'calmer_transitions',
  relatedPain: 'transitions',
};

const independentPlayStarter: Routine = {
  id: 'independent-play-starter',
  type: 'play',
  title: 'Independent Play Starter',
  whenToUse:
    'Use this when you need your child to play on their own for a bit.',
  steps: [
    '1. Set the scene: put 2-3 items within reach.',
    '2. Start playing together for 2 minutes.',
    '3. Step back: "I\'ll be right here. You keep going."',
    '4. Check back with a small comment after 5 minutes.',
  ],
  script:
    "I'll set up something fun and we'll start together. Then you take over — I'll be right here if you need me.",
  relatedGoal: 'independent_play',
  relatedPain: 'play_ideas',
};

// ── Exports ────────────────────────────────────────────────────────────────

export const allRoutines: Routine[] = [
  screenToCalm,
  afterPreschoolReset,
  bedtimeSoftLanding,
  bigFeelingsReset,
  independentPlayStarter,
];

export function getRoutineById(id: string): Routine | undefined {
  return allRoutines.find((r) => r.id === id);
}

// ── Routine Derivation ─────────────────────────────────────────────────────

export function deriveRoutine(tags: {
  main_pain: string;
  primary_goal: string;
  routine_moment: string;
  needs_screen_help: boolean;
}): Routine {
  // Screen help takes priority
  if (
    tags.needs_screen_help ||
    tags.main_pain === 'screen_time' ||
    tags.primary_goal === 'fewer_screens'
  ) {
    return screenToCalm;
  }

  // Bedtime
  if (
    tags.main_pain === 'bedtime' ||
    tags.primary_goal === 'easier_bedtime' ||
    tags.routine_moment === 'bedtime'
  ) {
    return bedtimeSoftLanding;
  }

  // Transitions
  if (
    tags.main_pain === 'transitions' ||
    tags.primary_goal === 'calmer_transitions'
  ) {
    return tags.routine_moment === 'after_preschool'
      ? afterPreschoolReset
      : bigFeelingsReset;
  }

  // Independent play
  if (
    tags.main_pain === 'independent_play' ||
    tags.primary_goal === 'independent_play'
  ) {
    return independentPlayStarter;
  }

  // After-preschool moment
  if (tags.routine_moment === 'after_preschool') {
    return afterPreschoolReset;
  }

  // Default
  return bedtimeSoftLanding;
}

// ── Localization (Spanish text by routine id) ────────────────────────────────

const ROUTINE_TEXT_ES: Record<
  string,
  { title: string; whenToUse: string; steps: string[]; script: string }
> = {
  'screen-to-calm': {
    title: 'Rutina de Pantalla a la Calma para la Noche',
    whenToUse: 'Usa esto cada vez que termine el tiempo de pantalla esta semana.',
    steps: [
      '1. Nombra el final: "Las pantallas ya están descansando".',
      '2. Pongan el dispositivo a dormir juntos.',
      '3. Empieza una pequeña acción sin pantalla.',
      '4. Pasen a la actividad de baja energía de hoy.',
    ],
    script:
      'La pantalla se va a dormir ahora. Vamos a acostarla juntos. Y ahora, ¿qué hacemos con nuestras manos?',
  },
  'after-preschool-reset': {
    title: 'Reinicio Después del Preescolar',
    whenToUse:
      'Usa esto cuando tu peque llegue a casa del preescolar o la guardería.',
    steps: [
      '1. Primero merienda y agua, nada de preguntas todavía.',
      '2. Reinicio rápido del cuerpo: 3 saltos grandes o sacúdanse.',
      '3. Ofrece una pequeña elección: "¿Dibujar o jugar?".',
      '4. Empiecen juntos una actividad sencilla.',
    ],
    script:
      '¡Ya estás en casa! Aquí está tu merienda. Cuando estés listo(a), buscamos algo divertido que hacer. Sin prisa.',
  },
  'bedtime-soft-landing': {
    title: 'Aterrizaje Suave para Dormir',
    whenToUse: 'Usa esto cuando las noches se sientan caóticas.',
    steps: [
      '1. Baja las luces y baja la voz.',
      '2. Ofrece una pequeña elección acogedora.',
      '3. Empiecen la actividad tranquila de esta noche.',
      '4. Termina con una frase de cierre: "Todo está hecho por hoy".',
    ],
    script:
      'El día está terminando. Vamos a ponernos cómodos. ¿Qué cuento elegimos esta noche?',
  },
  'big-feelings-reset': {
    title: 'Reinicio de Grandes Emociones',
    whenToUse: 'Usa esto cuando las emociones están a flor de piel.',
    steps: [
      '1. Nombra la emoción con palabras sencillas.',
      '2. Reduce tu lenguaje: menos palabras, voz más suave.',
      '3. Ofrece un reinicio del cuerpo: un apretón, saltar o respirar profundo.',
      '4. Ofrece una pequeña elección para seguir adelante.',
    ],
    script:
      'Estás sintiendo una emoción muy grande ahora mismo. Aquí estoy. Vamos a respirar juntos.',
  },
  'independent-play-starter': {
    title: 'Arranque de Juego Independiente',
    whenToUse:
      'Usa esto cuando necesitas que tu peque juegue solo(a) un rato.',
    steps: [
      '1. Prepara el escenario: pon 2 o 3 objetos al alcance.',
      '2. Empiecen a jugar juntos durante 2 minutos.',
      '3. Da un paso atrás: "Voy a estar aquí cerca. Tú sigue".',
      '4. Vuelve con un pequeño comentario después de 5 minutos.',
    ],
    script:
      'Voy a preparar algo divertido y empezamos juntos. Después tú sigues; voy a estar aquí cerca si me necesitas.',
  },
};

export function localizeRoutine<
  T extends {
    id: string;
    title: string;
    whenToUse: string;
    steps: string[];
    script: string;
  },
>(routine: T, locale: Locale): T {
  if (locale === 'en') return routine;
  const tx = ROUTINE_TEXT_ES[routine.id];
  return tx ? { ...routine, ...tx } : routine;
}
