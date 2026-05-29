// ── Tag Profile Builder (v4) ────────────────────────────────────────────────

import type { Locale } from '@/lib/i18n/config';

export type PlayProfile =
  | 'big-feelings-explorer'
  | 'curious-builder'
  | 'story-seeker'
  | 'routine-lover'
  | 'fast-bored-sprinter'
  | 'connection-seeker';

export interface TagProfile {
  // ── Core fields (backward-compat with plan generator & dashboard) ──
  age_range: string;
  main_pain: string;
  routine_moment: string;
  time_available: string;
  play_style: string;
  child_reaction: string;
  activity_preference: string[];
  support_needed: string;
  screen_time_amount: string;
  screen_transition_difficulty: string;
  primary_goal: string;
  plan_style: string;
  materials_available: string[];
  location_context: string;
  play_profile: PlayProfile;
  is_low_time: boolean;
  is_low_energy: boolean;
  needs_scripts: boolean;
  needs_screen_help: boolean;

  // ── V4 fields ──
  child_name: string;
  main_pain_all: string[];
  child_style: string[];
  reaction_style: string;
  activity_likes: string[];
  attention_span: string;
  parent_time: string;
  parent_constraint: string[];
  support_needed_all: string[];
  avoid_tags: string[];
  materials: string[];
  location: string;
  plan_format: string;
  bedtime_challenge: string;
  independent_play_duration: string;
  focus_child: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function asString(val: string | string[] | undefined, fallback = ''): string {
  if (val === undefined) return fallback;
  return Array.isArray(val) ? val[0] ?? fallback : val;
}

function asArray(val: string | string[] | undefined): string[] {
  if (val === undefined) return [];
  return Array.isArray(val) ? val : [val];
}

// ── Play profile mapping ────────────────────────────────────────────────────

const CHILD_STYLE_TO_PLAY_STYLE: Record<string, string> = {
  active_explorer: 'moving',
  curious_builder: 'building',
  story_seeker: 'stories',
  routine_seeker: 'routine',
  sensitive_starter: 'frustrated',
  fast_bored: 'attention',
};

const PLAY_STYLE_TO_PROFILE: Record<string, PlayProfile> = {
  moving: 'big-feelings-explorer',
  stories: 'story-seeker',
  building: 'curious-builder',
  frustrated: 'big-feelings-explorer',
  routine: 'routine-lover',
  attention: 'fast-bored-sprinter',
};

function derivePlayProfile(playStyle: string): PlayProfile {
  return PLAY_STYLE_TO_PROFILE[playStyle] ?? 'connection-seeker';
}

// ── Main pain → primary goal mapping ────────────────────────────────────────

const PAIN_TO_GOAL: Record<string, string> = {
  screen_time: 'fewer_screens',
  transitions: 'calmer_transitions',
  no_ideas: 'independent_play',
  boredom: 'focus',
  independent_play: 'independent_play',
  bedtime: 'easier_bedtime',
  connection: 'connection',
};

// ── Parent time → time_available mapping ────────────────────────────────────

const PARENT_TIME_TO_TIME: Record<string, string> = {
  '3_5': '3-5',
  '7_10': '7-10',
  '10_15': '10-15',
  '15_plus': '15+',
  depends: 'depends',
};

// ── Plan format → plan_style mapping ────────────────────────────────────────

const FORMAT_TO_STYLE: Record<string, string> = {
  one_activity: 'one_per_day',
  morning_evening: 'morning_evening',
  flexible_options: 'few_options',
  sos_only: 'difficult_moments',
  weekend_focused: 'weekend_focused',
};

// ── Display helpers ─────────────────────────────────────────────────────────

const PROFILE_DISPLAY_NAMES: Record<PlayProfile, string> = {
  'big-feelings-explorer': 'Big Feelings Explorer',
  'curious-builder': 'Curious Builder',
  'story-seeker': 'Story Seeker',
  'routine-lover': 'Routine Lover',
  'fast-bored-sprinter': 'Fast-Paced Explorer',
  'connection-seeker': 'Connection Seeker',
};

const PROFILE_DISPLAY_NAMES_ES: Record<PlayProfile, string> = {
  'big-feelings-explorer': 'Explorador de Grandes Emociones',
  'curious-builder': 'Constructor Curioso',
  'story-seeker': 'Buscador de Historias',
  'routine-lover': 'Amante de las Rutinas',
  'fast-bored-sprinter': 'Explorador de Ritmo Rápido',
  'connection-seeker': 'Buscador de Conexión',
};

export function getProfileDisplayName(profile: PlayProfile, locale: Locale = 'en'): string {
  const map = locale === 'es' ? PROFILE_DISPLAY_NAMES_ES : PROFILE_DISPLAY_NAMES;
  return map[profile] ?? profile;
}

const GOAL_DISPLAY_TEXT: Record<string, string> = {
  independent_play: 'Help your child play independently',
  fewer_screens: 'Fewer screen-time battles',
  calmer_transitions: 'Calmer transitions throughout the day',
  speech: 'More speech and storytelling',
  focus: 'Better focus and attention',
  easier_bedtime: 'An easier bedtime routine',
  connection: 'More quality connection time',
};

const GOAL_DISPLAY_TEXT_ES: Record<string, string> = {
  independent_play: 'Ayudar a tu peque a jugar de forma independiente',
  fewer_screens: 'Menos peleas por las pantallas',
  calmer_transitions: 'Transiciones más tranquilas durante el día',
  speech: 'Más lenguaje y narración de historias',
  focus: 'Mejor concentración y atención',
  easier_bedtime: 'Una rutina de dormir más fácil',
  connection: 'Más tiempo de conexión de calidad',
};

export function getGoalDisplayText(goal: string, locale: Locale = 'en'): string {
  const map = locale === 'es' ? GOAL_DISPLAY_TEXT_ES : GOAL_DISPLAY_TEXT;
  return map[goal] ?? goal;
}

const MOMENT_DISPLAY: Record<string, string> = {
  morning: 'morning',
  after_preschool: 'after preschool',
  before_dinner: 'before dinner',
  bedtime: 'bedtime',
  weekends: 'weekends',
  hard_moments: 'hard moments',
};

const MOMENT_DISPLAY_ES: Record<string, string> = {
  morning: 'la mañana',
  after_preschool: 'después del preescolar',
  before_dinner: 'antes de la cena',
  bedtime: 'la hora de dormir',
  weekends: 'los fines de semana',
  hard_moments: 'los momentos difíciles',
};

export function getMomentDisplayText(moment: string, locale: Locale = 'en'): string {
  const map = locale === 'es' ? MOMENT_DISPLAY_ES : MOMENT_DISPLAY;
  return map[moment] ?? moment;
}

const PLAN_STYLE_DISPLAY: Record<string, string> = {
  one_per_day: 'one activity per day',
  one_activity: 'one activity per day',
  morning_evening: 'morning + evening routine',
  few_options: 'flexible daily options',
  flexible_options: 'flexible daily options',
  difficult_moments: 'help for hard moments',
  sos_only: 'help for hard moments',
  weekend_focused: 'weekend-focused plan',
};

const PLAN_STYLE_DISPLAY_ES: Record<string, string> = {
  one_per_day: 'una actividad por día',
  one_activity: 'una actividad por día',
  morning_evening: 'rutina de mañana + noche',
  few_options: 'opciones diarias flexibles',
  flexible_options: 'opciones diarias flexibles',
  difficult_moments: 'ayuda para los momentos difíciles',
  sos_only: 'ayuda para los momentos difíciles',
  weekend_focused: 'plan enfocado en el fin de semana',
};

export function getPlanStyleDisplayText(style: string, locale: Locale = 'en'): string {
  const map = locale === 'es' ? PLAN_STYLE_DISPLAY_ES : PLAN_STYLE_DISPLAY;
  return map[style] ?? style.replace(/_/g, ' ');
}

const SUPPORT_DISPLAY: Record<string, string> = {
  step_by_step: 'step-by-step instructions',
  exact_words: 'exact words to say',
  shorter_version: 'shorter versions for busy days',
  easier_version: 'easier alternatives',
  backup_if_refuses: 'backup ideas if refused',
};

const SUPPORT_DISPLAY_ES: Record<string, string> = {
  step_by_step: 'instrucciones paso a paso',
  exact_words: 'las palabras exactas que decir',
  shorter_version: 'versiones más cortas para los días ocupados',
  easier_version: 'alternativas más fáciles',
  backup_if_refuses: 'ideas de respaldo si se niega',
};

export function getSupportDisplayText(support: string, locale: Locale = 'en'): string {
  const map = locale === 'es' ? SUPPORT_DISPLAY_ES : SUPPORT_DISPLAY;
  return map[support] ?? support.replace(/_/g, ' ');
}

const AVOID_DISPLAY: Record<string, string> = {
  messy: 'messy activities',
  many_materials: 'many materials',
  long_instructions: 'long instructions',
  loud_play: 'loud or high-energy play',
  screen_based: 'screen-based ideas',
  homework_feel: 'homework-like activities',
};

const AVOID_DISPLAY_ES: Record<string, string> = {
  messy: 'actividades que ensucian',
  many_materials: 'muchos materiales',
  long_instructions: 'instrucciones largas',
  loud_play: 'juego ruidoso o de mucha energía',
  screen_based: 'ideas con pantallas',
  homework_feel: 'actividades que parecen tarea',
};

export function getAvoidDisplayText(avoid: string, locale: Locale = 'en'): string {
  const map = locale === 'es' ? AVOID_DISPLAY_ES : AVOID_DISPLAY;
  return map[avoid] ?? avoid.replace(/_/g, ' ');
}

const MAIN_PAIN_DISPLAY: Record<string, string> = {
  screen_time: 'fewer screen-time battles',
  transitions: 'calmer transitions',
  no_ideas: 'fresh play ideas',
  boredom: 'keeping your child engaged',
  independent_play: 'building independent play',
  bedtime: 'an easier bedtime',
  connection: 'more meaningful connection',
};

const MAIN_PAIN_DISPLAY_ES: Record<string, string> = {
  screen_time: 'menos peleas por las pantallas',
  transitions: 'transiciones más tranquilas',
  no_ideas: 'ideas frescas de juego',
  boredom: 'mantener a tu peque entretenido',
  independent_play: 'fomentar el juego independiente',
  bedtime: 'una hora de dormir más fácil',
  connection: 'una conexión más significativa',
};

export function getMainPainDisplayText(pain: string, locale: Locale = 'en'): string {
  const map = locale === 'es' ? MAIN_PAIN_DISPLAY_ES : MAIN_PAIN_DISPLAY;
  return map[pain] ?? pain.replace(/_/g, ' ');
}

const ENERGY_LEVEL_DISPLAY: Record<string, string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};

const ENERGY_LEVEL_DISPLAY_ES: Record<string, string> = {
  low: 'baja',
  medium: 'media',
  high: 'alta',
};

export function getEnergyLevelDisplay(level: string, locale: Locale = 'en'): string {
  const map = locale === 'es' ? ENERGY_LEVEL_DISPLAY_ES : ENERGY_LEVEL_DISPLAY;
  return map[level?.toLowerCase?.()] ?? level;
}

// ── Main builder ────────────────────────────────────────────────────────────

export function buildTagProfile(
  answers: Record<string, string | string[]>,
): TagProfile {
  // V4 string-keyed answers
  const child_name = asString(answers['child-name']);
  const ageRaw = asString(answers['age']);
  const main_pain_all = asArray(answers['main-pain']);
  const main_pain = main_pain_all[0] ?? '';
  const helpMoment = asString(answers['help-moment']);
  const childStyleAll = asArray(answers['child-style']);
  const reactionRaw = asString(answers['reaction']);
  const activityLikesAll = asArray(answers['activity-likes']);
  const attentionSpan = asString(answers['attention-span']);
  const parentTimeRaw = asString(answers['parent-time']);
  const obstaclesAll = asArray(answers['obstacles']);
  const supportAll = asArray(answers['support-needed']);
  const avoidAll = asArray(answers['avoid-list']);
  const materialsAll = asArray(answers['materials']);
  const locationRaw = asString(answers['location']);
  const planFormatRaw = asString(answers['plan-format']);
  const screenTimeAmt = asString(answers['cond-screen-time']);
  const screenTransition = asString(answers['cond-screen-transition']);
  const bedtimeChallenge = asString(answers['cond-bedtime']);
  const independentDuration = asString(answers['cond-independent']);
  const focusChild = asString(answers['cond-multi-child']);

  // Map to backward-compat fields
  const age_range = ageRaw === 'multi' && focusChild ? focusChild : ageRaw;
  const play_style = CHILD_STYLE_TO_PLAY_STYLE[childStyleAll[0] ?? ''] ?? '';
  const primary_goal = PAIN_TO_GOAL[main_pain] ?? main_pain;
  const time_available = PARENT_TIME_TO_TIME[parentTimeRaw] ?? parentTimeRaw;
  const plan_style = FORMAT_TO_STYLE[planFormatRaw] ?? planFormatRaw;

  // Computed
  const play_profile = derivePlayProfile(play_style);
  const is_low_time = ['3-5', '7-10', '3_5', '7_10'].includes(time_available) ||
    ['3_5', '7_10'].includes(parentTimeRaw);
  const is_low_energy =
    obstaclesAll.includes('low_energy');
  const needs_scripts =
    supportAll.includes('exact_words') ||
    supportAll.includes('step_by_step') ||
    obstaclesAll.includes('needs_scripts');
  const needs_screen_help =
    main_pain_all.includes('screen_time');

  return {
    // Backward-compat
    age_range,
    main_pain,
    routine_moment: helpMoment,
    time_available,
    play_style,
    child_reaction: reactionRaw,
    activity_preference: activityLikesAll,
    support_needed: supportAll[0] ?? '',
    screen_time_amount: screenTimeAmt,
    screen_transition_difficulty: screenTransition,
    primary_goal,
    plan_style,
    materials_available: materialsAll,
    location_context: locationRaw,
    play_profile,
    is_low_time,
    is_low_energy,
    needs_scripts,
    needs_screen_help,

    // V4 fields
    child_name,
    main_pain_all,
    child_style: childStyleAll,
    reaction_style: reactionRaw,
    activity_likes: activityLikesAll,
    attention_span: attentionSpan,
    parent_time: parentTimeRaw,
    parent_constraint: obstaclesAll,
    support_needed_all: supportAll,
    avoid_tags: avoidAll,
    materials: materialsAll,
    location: locationRaw,
    plan_format: planFormatRaw,
    bedtime_challenge: bedtimeChallenge,
    independent_play_duration: independentDuration,
    focus_child: focusChild,
  };
}
