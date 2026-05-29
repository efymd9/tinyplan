// ── Quiz Screen Data (Spanish) ─────────────────────────────────────────────
// Locale-specific Spanish data. Types live in ./questions.ts.
// Neutral Latin American Spanish, informal "tú", warm and encouraging.
// IDs, option values, types, conditions, stage keys, and DISPLAY map keys are
// IDENTICAL to the English version — only human-readable text is translated.

import type { QuizScreen } from './questions';
import { answerIncludes, answerIs, getFirst } from './questions';

// ── Display maps (Spanish) ──────────────────────────────────────────────────

export const PAIN_DISPLAY_ES: Record<string, string> = {
  screen_time: 'reducir las peleas por las pantallas',
  transitions: 'transiciones más tranquilas',
  no_ideas: 'ideas de juego nuevas',
  boredom: 'mantener a tu peque interesado',
  independent_play: 'fomentar el juego independiente',
  bedtime: 'una hora de dormir más fácil',
  connection: 'una conexión más significativa',
};

export const MOMENT_DISPLAY_ES: Record<string, string> = {
  morning: 'las mañanas',
  after_preschool: 'después del preescolar',
  before_dinner: 'antes de la cena',
  bedtime: 'la hora de dormir',
  weekends: 'los fines de semana',
  hard_moments: 'los momentos difíciles',
};

export const AGE_DISPLAY_ES: Record<string, string> = {
  '2': 'peque de 2 años',
  '3': 'peque de 3 años',
  '4': 'peque de 4 años',
  '5': 'peque de 5 años',
  '6': 'peque de 6 años',
  multi: 'peques',
};

export const CHILD_STYLE_TO_PROFILE_ES: Record<string, { name: string; desc: string }> = {
  active_explorer: { name: 'Explorador Activo', desc: 'actividades con movimiento, juegos físicos y exploración práctica' },
  curious_builder: { name: 'Constructor Curioso', desc: 'actividades prácticas, construcción sencilla, clasificar y opciones que tu peque pueda controlar' },
  story_seeker: { name: 'Buscador de Historias', desc: 'contar cuentos, juego de imaginación, personajes y escenarios imaginarios' },
  routine_seeker: { name: 'Amante de la Rutina', desc: 'actividades predecibles, pasos claros y juego estructurado' },
  sensitive_starter: { name: 'Comienzo Sensible', desc: 'actividades suaves que construyen confianza paso a paso' },
  fast_bored: { name: 'Explorador de Ritmo Rápido', desc: 'variedad rápida, momentos atractivos y actividades de arranque ágil' },
};

export const TIME_DISPLAY_ES: Record<string, string> = {
  '3_5': 'de 3 a 5 min',
  '7_10': 'de 7 a 10 min',
  '10_15': 'de 10 a 15 min',
  '15_plus': 'de más de 15 min',
  depends: 'flexibles',
};

// ── Quiz Screens (Spanish) ──────────────────────────────────────────────────

export const QUIZ_QUESTIONS_ES: QuizScreen[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: child — "Sobre tu peque"
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'age',
    type: 'single',
    stage: 'child',
    stageLabel: 'Sobre tu peque',
    question: '¿Qué edad tiene tu peque?',
    options: [
      { id: '2', label: '2 años', tags: { ageBand: 'toddler_2' } },
      { id: '3', label: '3 años', tags: { ageBand: 'preschool_3_4' } },
      { id: '4', label: '4 años', tags: { ageBand: 'preschool_3_4' } },
      { id: '5', label: '5 años', tags: { ageBand: 'older_preschool_5_6' } },
      { id: '6', label: '6 años', tags: { ageBand: 'older_preschool_5_6' } },
      { id: 'multi', label: 'Más de un peque', tags: { ageBand: 'multi' } },
    ],
  },

  {
    id: 'child-name',
    type: 'name-input',
    stage: 'child',
    stageLabel: 'Sobre tu peque',
    question: '¿Cómo quieres que llamemos a tu peque en el plan?',
    subtitle: 'Opcional. Puedes saltarlo: solo lo usamos para personalizar tu plan.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: pain (screens 3-5) — "Entendiendo tus metas"
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'main-pain',
    type: 'multiple',
    stage: 'pain',
    stageLabel: 'Entendiendo tus metas',
    question: '¿Qué se te hace más difícil ahora mismo?',
    instruction: 'Elige hasta 2',
    maxSelections: 2,
    options: [
      { id: 'screen_time', label: 'Dependemos demasiado de las pantallas', tags: { mainPain: 'screen_time' } },
      { id: 'transitions', label: 'Mi peque se molesta durante las transiciones', tags: { mainPain: 'transitions' } },
      { id: 'no_ideas', label: 'No sé a qué jugar', tags: { mainPain: 'no_ideas' } },
      { id: 'boredom', label: 'Mi peque se aburre rápido', tags: { mainPain: 'boredom' } },
      { id: 'independent_play', label: 'A mi peque le cuesta jugar de forma independiente', tags: { mainPain: 'independent_play' } },
      { id: 'bedtime', label: 'La hora de dormir es un caos', tags: { mainPain: 'bedtime' } },
      { id: 'connection', label: 'Quiero más tiempo significativo juntos', tags: { mainPain: 'connection' } },
    ],
  },

  {
    id: 'help-moment',
    type: 'single',
    stage: 'pain',
    stageLabel: 'Entendiendo tus metas',
    question: '¿Cuándo sueles necesitar más ayuda?',
    options: [
      { id: 'morning', label: 'La rutina de la mañana', tags: { helpMoment: 'morning' } },
      { id: 'after_preschool', label: 'Después del preescolar/guardería', tags: { helpMoment: 'after_preschool' } },
      { id: 'before_dinner', label: 'Antes de la cena', tags: { helpMoment: 'before_dinner' } },
      { id: 'bedtime', label: 'La hora de dormir', tags: { helpMoment: 'bedtime' } },
      { id: 'weekends', label: 'Los fines de semana', tags: { helpMoment: 'weekends' } },
      { id: 'hard_moments', label: 'Momentos difíciles que surgen', tags: { helpMoment: 'hard_moments' } },
    ],
  },

  {
    id: 'summary-1',
    type: 'affirmation',
    stage: 'pain',
    stageLabel: 'Entendiendo tus metas',
    dynamicText: (answers) => {
      const pains = answers['main-pain'];
      const moment = getFirst(answers, 'help-moment');
      const painArr = Array.isArray(pains) ? pains : pains ? [pains] : [];
      const painTexts = painArr.map((p) => PAIN_DISPLAY_ES[p] ?? p).join(' y ');
      const momentText = MOMENT_DISPLAY_ES[moment] ?? moment;

      if (painTexts && momentText) {
        return `Entendido. Crearemos tu plan en torno a ${painTexts}, sobre todo durante ${momentText}.\n\nActividades pequeñas y fáciles de empezar.`;
      }
      if (painTexts) {
        return `Entendido. Crearemos tu plan en torno a ${painTexts}.\n\nActividades pequeñas y fáciles de empezar.`;
      }
      return 'Entendido. Crearemos tu plan en torno a momentos pequeños y realistas, no a una crianza perfecta.';
    },
  },

  {
    id: 'email',
    type: 'email',
    stage: 'pain',
    stageLabel: 'Entendiendo tus metas',
    text: 'Estamos creando tu plan: ¿dónde lo guardamos?',
    subtitle: 'Lo usaremos para guardar tu plan personalizado y enviarte tu primera semana.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: child-style — "El estilo de juego de tu peque"
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'child-style',
    type: 'multiple',
    stage: 'child-style',
    stageLabel: 'El estilo de juego de tu peque',
    question: '¿Qué describe mejor a tu peque?',
    instruction: 'Elige hasta 2',
    maxSelections: 2,
    options: [
      { id: 'active_explorer', label: 'Siempre en movimiento y explorando', tags: { childStyle: 'active_explorer' } },
      { id: 'story_seeker', label: 'Le encantan los cuentos y el juego de imaginación', tags: { childStyle: 'story_seeker' } },
      { id: 'curious_builder', label: 'Le gusta construir, clasificar y los rompecabezas', tags: { childStyle: 'curious_builder' } },
      { id: 'sensitive_starter', label: 'Se frustra con facilidad', tags: { childStyle: 'sensitive_starter' } },
      { id: 'routine_seeker', label: 'Necesita rutina y previsibilidad', tags: { childStyle: 'routine_seeker' } },
      { id: 'fast_bored', label: 'Busca atención pero se aburre rápido', tags: { childStyle: 'fast_bored' } },
    ],
  },

  {
    id: 'reaction',
    type: 'single',
    stage: 'child-style',
    stageLabel: 'El estilo de juego de tu peque',
    question: '¿Cómo suele reaccionar tu peque ante una actividad nueva?',
    options: [
      { id: 'jumps_in', label: 'Se lanza de inmediato', tags: { reactionStyle: 'jumps_in' } },
      { id: 'watches_first', label: 'Observa primero y luego se une', tags: { reactionStyle: 'watches_first' } },
      { id: 'needs_help', label: 'Necesita ayuda para empezar', tags: { reactionStyle: 'needs_help' } },
      { id: 'says_no', label: 'Dice que no al principio', tags: { reactionStyle: 'says_no' } },
      { id: 'loses_interest', label: 'Se emociona y luego pierde el interés', tags: { reactionStyle: 'loses_interest' } },
      { id: 'mood_dependent', label: 'Depende del ánimo', tags: { reactionStyle: 'mood_dependent' } },
    ],
  },

  {
    id: 'activity-likes',
    type: 'multiple',
    stage: 'child-style',
    stageLabel: 'El estilo de juego de tu peque',
    question: '¿Qué tipo de actividades disfruta más tu peque?',
    instruction: 'Elige hasta 2',
    maxSelections: 2,
    options: [
      { id: 'movement', label: 'Correr, saltar, trepar', tags: { activityLikes: 'movement' } },
      { id: 'drawing', label: 'Dibujar, colorear, pintar', tags: { activityLikes: 'drawing' } },
      { id: 'stories', label: 'Cuentos y libros', tags: { activityLikes: 'stories' } },
      { id: 'building', label: 'Construir y armar rompecabezas', tags: { activityLikes: 'building' } },
      { id: 'helper_tasks', label: 'Ayudar con tareas de grandes', tags: { activityLikes: 'helper_tasks' } },
      { id: 'sensory', label: 'Juego con agua, sensorial o desordenado', tags: { activityLikes: 'sensory' } },
      { id: 'not_sure', label: 'Todavía no estoy seguro(a)', tags: { activityLikes: 'not_sure' } },
    ],
  },

  {
    id: 'summary-2',
    type: 'micro-insight',
    stage: 'child-style',
    stageLabel: 'El estilo de juego de tu peque',
    text: 'Estamos viendo el patrón de juego de tu peque.',
    dynamicText: (answers) => {
      const styles = answers['child-style'];
      const styleArr = Array.isArray(styles) ? styles : styles ? [styles] : [];
      const primary = styleArr[0] ?? '';
      const info = CHILD_STYLE_TO_PROFILE_ES[primary];
      if (info) {
        return `Estamos viendo un patrón de juego de ${info.name}.\n\nEso significa que tu plan debería incluir ${info.desc}.`;
      }
      return 'Estamos descubriendo cómo juega mejor tu peque.';
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: parent (screens 10-14) — "Tus límites de la vida real"
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'attention-span',
    type: 'single',
    stage: 'parent',
    stageLabel: 'Tus límites de la vida real',
    question: '¿Cuánto tiempo suele quedarse tu peque con una sola actividad?',
    options: [
      { id: 'under_3', label: 'Menos de 3 min', tags: { attentionSpan: 'under_3' } },
      { id: '3_5', label: 'De 3 a 5 min', tags: { attentionSpan: '3_5' } },
      { id: '5_10', label: 'De 5 a 10 min', tags: { attentionSpan: '5_10' } },
      { id: '10_plus', label: 'Más de 10 min', tags: { attentionSpan: '10_plus' } },
      { id: 'mood_dependent', label: 'Depende del ánimo', tags: { attentionSpan: 'mood_dependent' } },
    ],
  },

  {
    id: 'parent-time',
    type: 'single',
    stage: 'parent',
    stageLabel: 'Tus límites de la vida real',
    question: '¿Cuánto tiempo puedes dedicar de forma realista a una actividad?',
    options: [
      { id: '3_5', label: 'De 3 a 5 min', tags: { parentTime: '3_5' } },
      { id: '7_10', label: 'De 7 a 10 min', tags: { parentTime: '7_10' } },
      { id: '10_15', label: 'De 10 a 15 min', tags: { parentTime: '10_15' } },
      { id: '15_plus', label: 'Más de 15 min', tags: { parentTime: '15_plus' } },
      { id: 'depends', label: 'Depende del día', tags: { parentTime: 'depends' } },
    ],
  },

  {
    id: 'obstacles',
    type: 'multiple',
    stage: 'parent',
    stageLabel: 'Tus límites de la vida real',
    question: '¿Qué suele interponerse en el camino?',
    instruction: 'Elige hasta 2',
    maxSelections: 2,
    options: [
      { id: 'loses_interest', label: 'Mi peque pierde el interés rápido', tags: { parentConstraint: 'loses_interest' } },
      { id: 'child_refuses', label: 'Mi peque dice que no o se niega', tags: { parentConstraint: 'child_refuses' } },
      { id: 'low_energy', label: 'Estoy demasiado cansado(a)', tags: { parentConstraint: 'low_energy' } },
      { id: 'needs_scripts', label: 'No sé cómo empezar', tags: { parentConstraint: 'needs_scripts' } },
      { id: 'low_time', label: 'No tengo tiempo', tags: { parentConstraint: 'low_time' } },
      { id: 'no_materials', label: 'No tenemos los materiales adecuados', tags: { parentConstraint: 'no_materials' } },
      { id: 'inconsistent', label: 'No somos constantes', tags: { parentConstraint: 'inconsistent' } },
    ],
  },

  {
    id: 'support-needed',
    type: 'multiple',
    stage: 'parent',
    stageLabel: 'Tus límites de la vida real',
    question: '¿Qué te ayudaría más durante una actividad?',
    instruction: 'Elige hasta 2',
    maxSelections: 2,
    options: [
      { id: 'step_by_step', label: 'Instrucciones paso a paso', tags: { supportNeeded: 'step_by_step' } },
      { id: 'exact_words', label: 'Las palabras exactas para decirle a mi peque', tags: { supportNeeded: 'exact_words' } },
      { id: 'shorter_version', label: 'Una versión más corta si vamos justos de tiempo', tags: { supportNeeded: 'shorter_version' } },
      { id: 'easier_version', label: 'Una forma de hacerlo más fácil si a mi peque le cuesta', tags: { supportNeeded: 'easier_version' } },
      { id: 'backup_if_refuses', label: 'Una idea de respaldo si mi peque se niega', tags: { supportNeeded: 'backup_if_refuses' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: plan — "Creando tu plan"
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'plan-format',
    type: 'single',
    stage: 'plan',
    stageLabel: 'Creando tu plan',
    question: '¿Qué tipo de plan seguirías de verdad?',
    options: [
      { id: 'one_activity', label: 'Una actividad por día', tags: { planFormat: 'one_activity' } },
      { id: 'morning_evening', label: 'Una rutina de mañana y noche', tags: { planFormat: 'morning_evening' } },
      { id: 'flexible_options', label: 'Varias opciones para elegir cada día', tags: { planFormat: 'flexible_options' } },
      { id: 'sos_only', label: 'Solo ayuda para los momentos difíciles', tags: { planFormat: 'sos_only' } },
      { id: 'weekend_focused', label: 'Un plan enfocado en el fin de semana', tags: { planFormat: 'weekend_focused' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: conditional — Pantallas de ramificación condicional
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'cond-screen-time',
    type: 'single',
    stage: 'conditional',
    stageLabel: 'Creando tu plan',
    question: '¿Cuánto tiempo de pantalla tiene tu peque en un día normal?',
    condition: (answers) =>
      answerIncludes(answers, 'main-pain', 'screen_time'),
    options: [
      { id: 'almost_none', label: 'Casi nada', tags: { screenTimeAmount: 'almost_none' } },
      { id: 'under_30', label: 'Menos de 30 minutos', tags: { screenTimeAmount: 'under_30' } },
      { id: '30_60', label: 'De 30 a 60 minutos', tags: { screenTimeAmount: '30_60' } },
      { id: '1_2hrs', label: 'De 1 a 2 horas', tags: { screenTimeAmount: '1_2hrs' } },
      { id: 'over_2hrs', label: 'Más de 2 horas', tags: { screenTimeAmount: 'over_2hrs' } },
      { id: 'varies', label: 'Varía mucho', tags: { screenTimeAmount: 'varies' } },
    ],
  },

  {
    id: 'cond-screen-transition',
    type: 'single',
    stage: 'conditional',
    stageLabel: 'Creando tu plan',
    question: '¿Cómo suelen ir las transiciones al apagar las pantallas?',
    condition: (answers) =>
      answerIncludes(answers, 'main-pain', 'screen_time'),
    options: [
      { id: 'easy', label: 'Bastante fáciles', tags: { screenTransition: 'easy' } },
      { id: 'some_resistance', label: 'Con algo de resistencia', tags: { screenTransition: 'some_resistance' } },
      { id: 'often_emotional', label: 'A menudo con emociones fuertes', tags: { screenTransition: 'often_emotional' } },
      { id: 'very_hard', label: 'Muy difíciles: terminan en rabietas', tags: { screenTransition: 'very_hard' } },
    ],
  },

  {
    id: 'cond-bedtime',
    type: 'single',
    stage: 'conditional',
    stageLabel: 'Creando tu plan',
    question: '¿Qué hace que la hora de dormir sea más difícil?',
    condition: (answers) =>
      answerIncludes(answers, 'main-pain', 'bedtime') ||
      answerIs(answers, 'help-moment', 'bedtime'),
    options: [
      { id: 'wont_stop', label: 'No deja de pedir agua o cuentos', tags: { bedtimeChallenge: 'wont_stop' } },
      { id: 'scared', label: 'Le da miedo la oscuridad o estar solo(a)', tags: { bedtimeChallenge: 'scared' } },
      { id: 'wont_stay', label: 'No se queda en la cama / se levanta una y otra vez', tags: { bedtimeChallenge: 'wont_stay' } },
      { id: 'overtired', label: 'Se sobrecansa y se acelera', tags: { bedtimeChallenge: 'overtired' } },
      { id: 'parent_tired', label: 'Estoy demasiado cansado(a) para manejarlo con calma', tags: { bedtimeChallenge: 'parent_tired' } },
    ],
  },

  {
    id: 'cond-independent',
    type: 'single',
    stage: 'conditional',
    stageLabel: 'Creando tu plan',
    question: '¿Cuánto tiempo puede jugar tu peque por su cuenta ahora mismo?',
    condition: (answers) =>
      answerIncludes(answers, 'main-pain', 'independent_play'),
    options: [
      { id: 'under_1', label: 'Menos de 1 minuto', tags: { independentDuration: 'under_1' } },
      { id: '1_3', label: 'De 1 a 3 min', tags: { independentDuration: '1_3' } },
      { id: '3_5', label: 'De 3 a 5 min', tags: { independentDuration: '3_5' } },
      { id: '5_10', label: 'De 5 a 10 min', tags: { independentDuration: '5_10' } },
      { id: '10_plus', label: 'Más de 10 min', tags: { independentDuration: '10_plus' } },
    ],
  },

  {
    id: 'cond-multi-child',
    type: 'single',
    stage: 'conditional',
    stageLabel: 'Creando tu plan',
    question: '¿Para qué peque creamos el primer plan?',
    subtitle: 'Empezamos con uno y luego puedes agregar más.',
    condition: (answers) => answerIs(answers, 'age', 'multi'),
    options: [
      { id: '2', label: 'El de 2 años', tags: { focusChild: '2' } },
      { id: '3', label: 'El de 3 años', tags: { focusChild: '3' } },
      { id: '4', label: 'El de 4 años', tags: { focusChild: '4' } },
      { id: '5', label: 'El de 5 años', tags: { focusChild: '5' } },
      { id: '6', label: 'El de 6 años', tags: { focusChild: '6' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: preview — Vista previa, email, carga
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'mini-preview',
    type: 'preview',
    stage: 'preview',
    stageLabel: 'Vista previa de tu plan',
    text: 'Tu plan está casi listo.',
    dynamicText: (answers) => {
      const age = getFirst(answers, 'age');
      const pain = getFirst(answers, 'main-pain');
      const moment = getFirst(answers, 'help-moment');
      const time = getFirst(answers, 'parent-time');

      const ageStr = AGE_DISPLAY_ES[age] ?? 'tu peque';
      const painStr = PAIN_DISPLAY_ES[pain] ?? 'tus metas';
      const momentStr = MOMENT_DISPLAY_ES[moment] ?? 'tu día';
      const timeStr = TIME_DISPLAY_ES[time] ?? 'flexibles';

      return [
        `Un plan de 7 días para tu ${ageStr}`,
        `Enfocado en ${painStr}`,
        `Ideal para ${momentStr}`,
        `Con actividades ${timeStr}`,
        'Más guiones para mamás y papás, ideas de respaldo y apoyo SOS',
      ].join('\n');
    },
  },

  {
    id: 'loading',
    type: 'loading',
    stage: 'result',
    stageLabel: 'Tu plan está listo',
    dynamicLoadingTexts: (answers) => {
      const age = getFirst(answers, 'age');
      const pain = getFirst(answers, 'main-pain');
      const moment = getFirst(answers, 'help-moment');
      const styles = answers['child-style'];
      const primaryStyle = Array.isArray(styles) ? styles[0] ?? '' : styles ?? '';
      const profileInfo = CHILD_STYLE_TO_PROFILE_ES[primaryStyle];

      const ageStr = AGE_DISPLAY_ES[age] ?? 'tu peque';
      const painStr = PAIN_DISPLAY_ES[pain] ?? 'tus metas';
      const momentStr = MOMENT_DISPLAY_ES[moment] ?? 'tu rutina';
      const profileStr = profileInfo?.name ?? 'personalizado';

      return [
        `Buscando actividades para un ${ageStr}...`,
        `Dando prioridad a ${painStr}...`,
        `Adaptándolo para ${momentStr}...`,
        'Agregando guiones para mamás y papás e ideas de respaldo...',
        `Creando tu plan ${profileStr}...`,
      ];
    },
    text: JSON.stringify([
      'Buscando actividades...',
      'Dando prioridad a tus metas...',
      'Agregando guiones para mamás y papás...',
      'Creando tu plan...',
    ]),
  },
];
