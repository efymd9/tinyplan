// ── Deterministic 7-Day Plan Generator ──────────────────────────────────────

import type { Locale } from '@/lib/i18n/config';
import type { TagProfile } from '@/lib/quiz/tags';
import { getProfileDisplayName, getGoalDisplayText, getMomentDisplayText, getPlanStyleDisplayText } from '@/lib/quiz/tags';
import { deriveRoutine } from '@/lib/routines/routines';
import { getHardMomentDisplay } from '@/lib/personalization/personalize';

// ── Types ───────────────────────────────────────────────────────────────────

/** Shape matching the `activities` DB table from schema.ts */
export interface Activity {
  id: string;
  title: string;
  description: string | null;
  age_min: number | null;
  age_max: number | null;
  goal_tags: string | null;
  play_style_tags: string | null;
  routine_moment_tags: string | null;
  time_minutes: number | null;
  materials: string | null;
  location: string | null;
  energy_level: string | null;
  steps_json: string | null;
  parent_script: string | null;
  fallback_if_refuses: string | null;
  easier_version: string | null;
  harder_version: string | null;
  why_it_works: string | null;
  safety_note: string | null;
  category: string | null;
}

export interface PlanActivity {
  id: string;
  title: string;
  description?: string;
  time_minutes?: number;
  materials?: string;
  steps_json?: string;
  parent_script?: string;
  fallback_if_refuses?: string;
  why_it_works?: string;
  category?: string;
  energy_level?: string;
  age_min?: number;
  age_max?: number;
  easier_version?: string;
  bestFor?: string;
}

export interface DayPlan {
  dayNumber: number;
  activity: PlanActivity;
  routineMoment: string;
  timeMinutes: number;
  parentScript: string;
}

export interface RoutineData {
  id: string;
  type: string;
  title: string;
  whenToUse: string;
  steps: string[];
  script: string;
}

export interface QuizSummary {
  youToldUs: string[];
  soWeCreated: string[];
}

export interface WeeklyPlan {
  profile: string;
  profileDisplayName: string;
  goal: string;
  goalDisplayText: string;
  plan_style: string;
  planStyleDisplay: string;
  bestMoment: string;
  bestMomentDisplay: string;
  hardMoment?: string;
  hardMomentDisplay?: string;
  days: DayPlan[];
  routine?: RoutineData;
  quizSummary?: QuizSummary;
  tagProfile: TagProfile;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseCsvTags(csv: string | null): string[] {
  if (!csv) return [];
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getAgeNumber(ageRange: string): number | null {
  const num = parseInt(ageRange, 10);
  return isNaN(num) ? null : num;
}

/**
 * Deterministic seeded shuffle (Fisher-Yates with simple hash seed).
 * Uses the tag profile to produce a stable but varied ordering.
 */
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const result = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const next = () => {
    hash = (hash * 1103515245 + 12345) | 0;
    return ((hash >>> 16) & 0x7fff) / 0x7fff;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ── Filtering & Scoring ─────────────────────────────────────────────────────

function filterByAge(activities: Activity[], ageRange: string): Activity[] {
  const age = getAgeNumber(ageRange);
  if (age === null) return activities; // 'multi' or unknown — return all
  return activities.filter((a) => {
    const min = a.age_min ?? 0;
    const max = a.age_max ?? 99;
    return age >= min && age <= max;
  });
}

function matchesTag(activity: Activity, field: 'goal_tags' | 'play_style_tags' | 'routine_moment_tags', values: string[]): boolean {
  const tags = parseCsvTags(activity[field]);
  return values.some((v) => tags.includes(v));
}

function selectByTag(
  pool: Activity[],
  field: 'goal_tags' | 'play_style_tags' | 'routine_moment_tags',
  values: string[],
  count: number,
  exclude: Set<string>,
): Activity[] {
  const matches = pool.filter(
    (a) => !exclude.has(a.id) && matchesTag(a, field, values),
  );
  return matches.slice(0, count);
}

function selectBonding(pool: Activity[], exclude: Set<string>): Activity | undefined {
  return pool.find(
    (a) =>
      !exclude.has(a.id) &&
      (parseCsvTags(a.goal_tags).includes('connection') ||
        parseCsvTags(a.category ? a.category : '').includes('bonding') ||
        (a.category ?? '').toLowerCase().includes('bonding') ||
        (a.category ?? '').toLowerCase().includes('connection')),
  );
}

function selectFallback(pool: Activity[], exclude: Set<string>): Activity | undefined {
  return pool.find((a) => !exclude.has(a.id));
}

export function deriveBestFor(activity: Activity, locale: Locale = 'en'): string {
  const moment = parseCsvTags(activity.routine_moment_tags)[0] || '';
  const goal = parseCsvTags(activity.goal_tags)[0] || '';
  const category = (activity.category || '').toLowerCase();
  const energy = (activity.energy_level || '').toLowerCase();

  const BEST_FOR: Record<string, string> = {
    connection: 'calm shared connection',
    independent_play: 'independent play time',
    fewer_screens: 'screen-free engagement',
    calmer_transitions: 'smooth transitions',
    speech: 'speech and storytelling',
    focus: 'focused attention',
    easier_bedtime: 'calm bedtime wind-down',
  };

  const BEST_FOR_ES: Record<string, string> = {
    connection: 'una conexión tranquila y compartida',
    independent_play: 'tiempo de juego independiente',
    fewer_screens: 'disfrutar sin pantallas',
    calmer_transitions: 'transiciones suaves',
    speech: 'lenguaje y narración de historias',
    focus: 'atención concentrada',
    easier_bedtime: 'una hora de dormir tranquila',
  };

  if (locale === 'es') {
    const goalLabel = BEST_FOR_ES[goal] || '';
    const momentLabel = moment === 'bedtime' ? 'la hora de dormir' : moment === 'evening' ? 'la noche' : '';
    const energyLabel = energy === 'low' ? 'momentos tranquilos' : energy === 'high' ? 'momentos activos' : '';

    const parts = [energyLabel, momentLabel, goalLabel || category].filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : 'tiempo de juego de calidad';
  }

  const goalLabel = BEST_FOR[goal] || '';
  const momentLabel = moment === 'bedtime' ? 'bedtime' : moment === 'evening' ? 'evening' : '';
  const energyLabel = energy === 'low' ? 'calm' : energy === 'high' ? 'active' : '';

  const parts = [energyLabel, momentLabel, goalLabel || category].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'quality play time';
}

// ── Quiz Summary Builder ───────────────────────────────────────────────────

export function buildQuizSummary(tagProfile: TagProfile, locale: Locale = 'en'): QuizSummary {
  const isEs = locale === 'es';
  const youToldUs: string[] = [];

  const MOMENT_TEXT: Record<string, string> = {
    morning: 'mornings work best for your family',
    afternoon: 'afternoons are your key time',
    after_preschool: 'after preschool is your key moment',
    evening: 'evenings are the best time for your family',
    bedtime: 'bedtime is your focus time',
    weekend: 'weekends are when you have the most time',
  };
  const MOMENT_TEXT_ES: Record<string, string> = {
    morning: 'las mañanas funcionan mejor para tu familia',
    afternoon: 'las tardes son tu momento clave',
    after_preschool: 'después del preescolar es tu momento clave',
    evening: 'las noches son el mejor momento para tu familia',
    bedtime: 'la hora de dormir es tu momento de enfoque',
    weekend: 'los fines de semana son cuando tienes más tiempo',
  };
  const momentText = isEs ? MOMENT_TEXT_ES : MOMENT_TEXT;
  if (tagProfile.routine_moment && momentText[tagProfile.routine_moment]) {
    youToldUs.push(momentText[tagProfile.routine_moment]);
  }

  const GOAL_TEXT: Record<string, string> = {
    connection: 'your main goal is more connection',
    independent_play: 'you want more independent play',
    fewer_screens: 'you want fewer screen battles',
    calmer_transitions: 'calmer transitions matter most',
    speech: 'building speech and storytelling is your priority',
    focus: 'improving focus and attention is your main goal',
    easier_bedtime: 'an easier bedtime is what you need most',
  };
  const GOAL_TEXT_ES: Record<string, string> = {
    connection: 'tu objetivo principal es más conexión',
    independent_play: 'quieres más juego independiente',
    fewer_screens: 'quieres menos peleas por las pantallas',
    calmer_transitions: 'las transiciones más tranquilas son lo que más importa',
    speech: 'fomentar el lenguaje y la narración de historias es tu prioridad',
    focus: 'mejorar la concentración y la atención es tu objetivo principal',
    easier_bedtime: 'una hora de dormir más fácil es lo que más necesitas',
  };
  const goalText = isEs ? GOAL_TEXT_ES : GOAL_TEXT;
  if (tagProfile.primary_goal && goalText[tagProfile.primary_goal]) {
    youToldUs.push(goalText[tagProfile.primary_goal]);
  }

  const STYLE_TEXT: Record<string, string> = {
    quick_easy: 'you want simple ideas without big preparation',
    structured: 'you like structured play with clear steps',
    creative: 'you prefer creative, open-ended play',
    active: 'you enjoy active, high-energy play',
    calm: 'you prefer calm, low-energy activities',
  };
  const STYLE_TEXT_ES: Record<string, string> = {
    quick_easy: 'quieres ideas sencillas sin mucha preparación',
    structured: 'te gusta el juego estructurado con pasos claros',
    creative: 'prefieres el juego creativo y abierto',
    active: 'disfrutas del juego activo y de mucha energía',
    calm: 'prefieres actividades tranquilas y de baja energía',
  };
  const styleText = isEs ? STYLE_TEXT_ES : STYLE_TEXT;
  if (tagProfile.plan_style && styleText[tagProfile.plan_style]) {
    youToldUs.push(styleText[tagProfile.plan_style]);
  }

  if (tagProfile.is_low_energy) {
    youToldUs.push(isEs ? 'prefieres actividades de baja energía' : 'you prefer low-energy activities');
  }

  const PAIN_TEXT: Record<string, string> = {
    bedtime: 'bedtime is your hardest moment',
    screen_time: 'screen time endings are tricky',
    transitions: 'transitions between activities are tough',
    play_ideas: 'you run out of play ideas during the week',
    boredom: 'boredom and restlessness are a challenge',
    independent_play: 'getting independent play started is hard',
    connection: 'finding connection time feels difficult',
  };
  const PAIN_TEXT_ES: Record<string, string> = {
    bedtime: 'la hora de dormir es tu momento más difícil',
    screen_time: 'el fin del tiempo de pantalla es complicado',
    transitions: 'las transiciones entre actividades son difíciles',
    play_ideas: 'te quedas sin ideas de juego durante la semana',
    boredom: 'el aburrimiento y la inquietud son un desafío',
    independent_play: 'lograr que empiece el juego independiente es difícil',
    connection: 'encontrar tiempo de conexión se siente difícil',
  };
  const painText = isEs ? PAIN_TEXT_ES : PAIN_TEXT;
  if (tagProfile.main_pain && painText[tagProfile.main_pain]) {
    youToldUs.push(painText[tagProfile.main_pain]);
  }

  if (tagProfile.is_low_time) {
    youToldUs.push(isEs ? 'tienes poco tiempo durante el día' : 'you have limited time during the day');
  }

  if (tagProfile.needs_scripts) {
    youToldUs.push(isEs ? 'quieres las palabras exactas que usar' : 'you want exact words to use');
  }

  if (tagProfile.needs_screen_help) {
    youToldUs.push(isEs ? 'las transiciones de pantalla son un desafío' : 'screen transitions are a challenge');
  }

  const soWeCreated: string[] = [];

  const MOMENT_CREATED: Record<string, string> = {
    morning: 'energising morning starters',
    afternoon: 'easy afternoon activities',
    after_preschool: 'after-preschool wind-down play',
    evening: 'cosy evening activities',
    bedtime: 'calming bedtime rituals',
    weekend: 'weekend family play ideas',
  };
  const MOMENT_CREATED_ES: Record<string, string> = {
    morning: 'arranques de mañana llenos de energía',
    afternoon: 'actividades fáciles para la tarde',
    after_preschool: 'juego para relajarse después del preescolar',
    evening: 'actividades acogedoras para la noche',
    bedtime: 'rituales calmantes para la hora de dormir',
    weekend: 'ideas de juego en familia para el fin de semana',
  };
  const momentCreated = isEs ? MOMENT_CREATED_ES : MOMENT_CREATED;
  if (tagProfile.routine_moment && momentCreated[tagProfile.routine_moment]) {
    soWeCreated.push(momentCreated[tagProfile.routine_moment]);
  }

  const STYLE_CREATED: Record<string, string> = {
    quick_easy: 'short, no-prep activities',
    structured: 'step-by-step structured activities',
    creative: 'open-ended creative play',
    active: 'high-energy movement games',
    calm: 'gentle, calming activities',
  };
  const STYLE_CREATED_ES: Record<string, string> = {
    quick_easy: 'actividades cortas y sin preparación',
    structured: 'actividades estructuradas paso a paso',
    creative: 'juego creativo y abierto',
    active: 'juegos de movimiento de mucha energía',
    calm: 'actividades suaves y calmantes',
  };
  const styleCreated = isEs ? STYLE_CREATED_ES : STYLE_CREATED;
  if (tagProfile.plan_style && styleCreated[tagProfile.plan_style]) {
    soWeCreated.push(styleCreated[tagProfile.plan_style]);
  }

  if (tagProfile.is_low_energy) {
    soWeCreated.push(isEs ? 'momentos de conexión con poca preparación' : 'low-prep bonding moments');
  }

  const PAIN_CREATED: Record<string, string> = {
    bedtime: 'SOS help for bedtime struggles',
    screen_time: 'screen-to-calm transitions',
    transitions: 'smoother transition strategies',
    play_ideas: 'fresh play ideas for every day',
    boredom: 'boredom-busting activities',
    independent_play: 'independent play starters',
    connection: 'connection-building moments',
  };
  const PAIN_CREATED_ES: Record<string, string> = {
    bedtime: 'ayuda SOS para las dificultades a la hora de dormir',
    screen_time: 'transiciones de la pantalla a la calma',
    transitions: 'estrategias para transiciones más suaves',
    play_ideas: 'ideas frescas de juego para cada día',
    boredom: 'actividades para combatir el aburrimiento',
    independent_play: 'arranques de juego independiente',
    connection: 'momentos para fortalecer la conexión',
  };
  const painCreated = isEs ? PAIN_CREATED_ES : PAIN_CREATED;
  if (tagProfile.main_pain && painCreated[tagProfile.main_pain]) {
    soWeCreated.push(painCreated[tagProfile.main_pain]);
  }

  soWeCreated.push(isEs ? 'qué decir, listo para usar' : 'ready-to-use parent scripts');

  return {
    youToldUs: youToldUs.slice(0, 4),
    soWeCreated: soWeCreated.slice(0, 4),
  };
}

// ── Main Generator ──────────────────────────────────────────────────────────

export function generateWeeklyPlan(
  tagProfile: TagProfile,
  activities: Activity[],
): WeeklyPlan {
  // Step 1: filter by age
  let pool = filterByAge(activities, tagProfile.age_range);

  // If low-time, prefer activities <= 10 min (but keep others as fallback)
  if (tagProfile.is_low_time) {
    const shortActivities = pool.filter(
      (a) => (a.time_minutes ?? 15) <= 10,
    );
    // Only use the short pool if we have enough activities
    if (shortActivities.length >= 7) {
      pool = shortActivities;
    } else {
      // Sort short activities first
      pool = [
        ...shortActivities,
        ...pool.filter((a) => (a.time_minutes ?? 15) > 10),
      ];
    }
  }

  // Create a seeded shuffle for variety
  const seed = `${tagProfile.primary_goal}-${tagProfile.play_style}-${tagProfile.age_range}`;
  pool = seededShuffle(pool, seed);

  const selected: Activity[] = [];
  const usedIds = new Set<string>();

  function addActivities(acts: Activity[]) {
    for (const a of acts) {
      if (!usedIds.has(a.id)) {
        selected.push(a);
        usedIds.add(a.id);
      }
    }
  }

  // Step 2: 3 activities matching primary_goal
  const goalActivities = selectByTag(
    pool,
    'goal_tags',
    [tagProfile.primary_goal],
    3,
    usedIds,
  );
  addActivities(goalActivities);

  // Step 3: 2 matching play_style
  const styleActivities = selectByTag(
    pool,
    'play_style_tags',
    [tagProfile.play_style],
    2,
    usedIds,
  );
  addActivities(styleActivities);

  // Step 4: 1 matching routine_moment
  const routineActivities = selectByTag(
    pool,
    'routine_moment_tags',
    [tagProfile.routine_moment],
    1,
    usedIds,
  );
  addActivities(routineActivities);

  // Step 5: 1 bonding/connection activity
  const bonding = selectBonding(pool, usedIds);
  if (bonding) {
    addActivities([bonding]);
  }

  // Fill remaining slots to reach 7 days
  while (selected.length < 7) {
    const fallback = selectFallback(pool, usedIds);
    if (!fallback) break;
    addActivities([fallback]);
  }

  // Build day plans
  const days: DayPlan[] = selected.slice(0, 7).map((activity, index) => ({
    dayNumber: index + 1,
    activity: {
      id: activity.id,
      title: activity.title,
      description: activity.description ?? undefined,
      time_minutes: activity.time_minutes ?? undefined,
      materials: activity.materials ?? undefined,
      steps_json: activity.steps_json ?? undefined,
      parent_script: activity.parent_script ?? undefined,
      fallback_if_refuses: activity.fallback_if_refuses ?? undefined,
      why_it_works: activity.why_it_works ?? undefined,
      category: activity.category ?? undefined,
      energy_level: activity.energy_level ?? undefined,
      age_min: activity.age_min ?? undefined,
      age_max: activity.age_max ?? undefined,
      easier_version: activity.easier_version ?? undefined,
      bestFor: deriveBestFor(activity),
    },
    routineMoment: parseCsvTags(activity.routine_moment_tags)[0] || tagProfile.routine_moment || 'anytime',
    timeMinutes: activity.time_minutes ?? 10,
    parentScript: activity.parent_script ?? '',
  }));

  const routine = deriveRoutine({
    main_pain: tagProfile.main_pain,
    primary_goal: tagProfile.primary_goal,
    routine_moment: tagProfile.routine_moment,
    needs_screen_help: tagProfile.needs_screen_help,
  });

  const quizSummary = buildQuizSummary(tagProfile);

  return {
    profile: tagProfile.play_profile,
    profileDisplayName: getProfileDisplayName(tagProfile.play_profile),
    goal: tagProfile.primary_goal,
    goalDisplayText: getGoalDisplayText(tagProfile.primary_goal),
    plan_style: tagProfile.plan_style,
    planStyleDisplay: getPlanStyleDisplayText(tagProfile.plan_style),
    bestMoment: tagProfile.routine_moment,
    bestMomentDisplay: getMomentDisplayText(tagProfile.routine_moment),
    hardMoment: tagProfile.main_pain,
    hardMomentDisplay: getHardMomentDisplay(tagProfile.main_pain),
    days,
    routine: routine ? {
      id: routine.id,
      type: routine.type,
      title: routine.title,
      whenToUse: routine.whenToUse,
      steps: routine.steps,
      script: routine.script,
    } : undefined,
    quizSummary,
    tagProfile,
  };
}
