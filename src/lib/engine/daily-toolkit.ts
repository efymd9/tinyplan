// ── Daily Parent Toolkit Selection ───────────────────────────────────────────
// Each day pairs the play activity with one Parent Skill, one Emotional Tool, and
// one backup move ("If It Gets Hard"). Selection is deterministic per day and
// driven by quiz tags / profile, with feedback nudging and full fallback logic so
// every day always has all three.

import {
  type ParentTool,
  getParentToolById,
  parentSkillTools,
  emotionalToolCards,
  backupToolIds,
  toolMatchesAge,
  localizeParentTool,
} from "@/data/parent-tools";
import type { Locale } from "@/lib/i18n/config";

export interface DailyToolkit {
  title: string;
  personalisedFor: string[];
  whyThisFits: string;
  parentSkill: ParentTool;
  emotionalTool: ParentTool;
  backup: ParentTool;
}

export interface ToolkitContext {
  primaryGoal: string;
  mainPain: string;
  mainPainAll?: string[];
  routineMoment: string;
  ageRange?: string;
  isLowEnergy?: boolean;
  needsScripts?: boolean;
  parentConstraints?: string[];
  /** Feedback signal: a recent day was too hard / refused → lean gentler. */
  struggle?: boolean;
}

// ── Signal → candidate tool groups (mirrors the spec mapping table) ───────────

const TIRED_GROUP = ["clear_steps", "what_is_our_plan", "quiet_lighthouse", "parent_self_talk", "blow_out_five_candles", "split_the_feeling"];
const BEDTIME_GROUP = ["what_is_our_plan", "quiet_lighthouse", "two_choices", "blow_out_five_candles", "the_sand_timer"];
const REFUSES_GROUP = ["two_choices", "where_do_we_start", "plan_b", "talk_in_calm_not_storm", "name_and_step_back"];
const SCREEN_GROUP = ["what_is_our_plan", "plan_b", "small_control", "two_choices", "what_can_we_do"];
const BORED_GROUP = ["small_control", "one_more_step", "plan_b", "what_can_we_do", "what_if"];
const TRANSITIONS_GROUP = ["what_is_our_plan", "small_control", "clear_steps", "two_choices", "what_next", "the_sand_timer"];
const ROUTINE_GROUP = ["what_is_our_plan", "clear_steps", "two_choices", "the_sand_timer"];
const FRUSTRATED_GROUP = ["one_more_step", "the_attempt_mark", "what_did_we_learn", "name_and_step_back"];
const CONNECTION_GROUP = ["name_and_share", "small_control", "split_the_feeling", "capture_the_win", "remember_when"];

function activeGroups(ctx: ToolkitContext): string[][] {
  const groups: string[][] = [];
  const constraints = ctx.parentConstraints ?? [];
  const pains = ctx.mainPainAll && ctx.mainPainAll.length > 0 ? ctx.mainPainAll : [ctx.mainPain];
  const has = (p: string) => pains.includes(p);

  const tired = ctx.isLowEnergy || constraints.includes("low_energy");
  const refuses = constraints.includes("child_refuses");
  const bored = has("boredom") || constraints.includes("loses_interest");
  const bedtime = has("bedtime") || ctx.routineMoment === "bedtime" || ctx.primaryGoal === "easier_bedtime";
  const screen = has("screen_time") || ctx.primaryGoal === "fewer_screens";
  const transitions = has("transitions") || ctx.primaryGoal === "calmer_transitions";
  const needsRoutine = has("no_ideas") || has("independent_play") || ctx.primaryGoal === "independent_play" || ctx.needsScripts;
  const connection = has("connection") || ctx.primaryGoal === "connection";

  // Struggle/tired comes first so gentler tools win the rotation.
  if (ctx.struggle || tired) groups.push(TIRED_GROUP);
  if (bedtime) groups.push(BEDTIME_GROUP);
  if (refuses) groups.push(REFUSES_GROUP);
  if (screen) groups.push(SCREEN_GROUP);
  if (bored) groups.push(BORED_GROUP);
  if (transitions) groups.push(TRANSITIONS_GROUP);
  if (connection) groups.push(CONNECTION_GROUP);
  if (needsRoutine) groups.push(ROUTINE_GROUP);
  if (ctx.struggle || refuses || bored) groups.push(FRUSTRATED_GROUP);

  return groups;
}

function orderedUnique(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

function pickRotating(
  ids: string[],
  dayNumber: number,
  ageRange: string | undefined,
  exclude: string[],
  fallbackPool: ParentTool[],
): ParentTool {
  const resolve = (list: string[]) =>
    list
      .map((id) => getParentToolById(id))
      .filter((t): t is ParentTool => Boolean(t) && !exclude.includes(t!.id));

  let valid = resolve(ids).filter((t) => toolMatchesAge(t, ageRange ?? "multi"));
  if (valid.length === 0) valid = resolve(ids); // drop age filter
  if (valid.length === 0) {
    valid = fallbackPool.filter(
      (t) => !exclude.includes(t.id) && toolMatchesAge(t, ageRange ?? "multi"),
    );
  }
  if (valid.length === 0) valid = fallbackPool.filter((t) => !exclude.includes(t.id));
  if (valid.length === 0) valid = fallbackPool;

  const index = Math.abs(dayNumber - 1) % valid.length;
  return valid[index];
}

// ── Display copy ──────────────────────────────────────────────────────────────

const MOMENT_CHIP: Record<string, string> = {
  morning: "mornings",
  after_preschool: "after preschool",
  before_dinner: "before dinner",
  bedtime: "bedtime",
  weekends: "weekends",
  hard_moments: "hard moments",
};

const MOMENT_CHIP_ES: Record<string, string> = {
  morning: "las mañanas",
  after_preschool: "después del preescolar",
  before_dinner: "antes de la cena",
  bedtime: "la hora de dormir",
  weekends: "los fines de semana",
  hard_moments: "los momentos difíciles",
};

const GOAL_CHIP: Record<string, string> = {
  independent_play: "independent play",
  fewer_screens: "fewer screens",
  calmer_transitions: "calmer transitions",
  speech: "speech & stories",
  focus: "focus",
  easier_bedtime: "easier bedtime",
  connection: "more connection",
};

const GOAL_CHIP_ES: Record<string, string> = {
  independent_play: "juego independiente",
  fewer_screens: "menos pantallas",
  calmer_transitions: "transiciones más tranquilas",
  speech: "habla y cuentos",
  focus: "concentración",
  easier_bedtime: "una hora de dormir más fácil",
  connection: "más conexión",
};

const PAIN_PHRASE: Record<string, string> = {
  screen_time: "screen-time endings feel hard",
  transitions: "transitions feel hard",
  no_ideas: "it's tricky to know what to play",
  boredom: "your child gets bored quickly",
  independent_play: "solo play is hard to start",
  bedtime: "bedtime feels chaotic",
  connection: "you want more time together",
};

const PAIN_PHRASE_ES: Record<string, string> = {
  screen_time: "terminar el tiempo de pantalla se siente difícil",
  transitions: "las transiciones se sienten difíciles",
  no_ideas: "cuesta saber a qué jugar",
  boredom: "tu peque se aburre rápido",
  independent_play: "cuesta empezar a jugar solo",
  bedtime: "la hora de dormir se siente caótica",
  connection: "quieres más tiempo juntos",
};

const TITLE_BY_GOAL: Record<string, string> = {
  easier_bedtime: "Calm Evening Start",
  fewer_screens: "Screen-Free Reset",
  calmer_transitions: "Smoother Transitions",
  connection: "Connect and Play",
  independent_play: "Confident Solo Play",
  focus: "Focused Play Moment",
  speech: "Words and Stories",
};

const TITLE_BY_GOAL_ES: Record<string, string> = {
  easier_bedtime: "Comienzo de Tarde Tranquilo",
  fewer_screens: "Reinicio Sin Pantallas",
  calmer_transitions: "Transiciones Más Suaves",
  connection: "Conectar y Jugar",
  independent_play: "Juego Solo con Confianza",
  focus: "Momento de Juego Concentrado",
  speech: "Palabras y Cuentos",
};

function dailyTitle(ctx: ToolkitContext, locale: Locale): string {
  if (locale === "es") {
    if (ctx.routineMoment === "bedtime") return "Comienzo de Tarde Tranquilo";
    return TITLE_BY_GOAL_ES[ctx.primaryGoal] ?? "Kit de hoy";
  }
  if (ctx.routineMoment === "bedtime") return "Calm Evening Start";
  return TITLE_BY_GOAL[ctx.primaryGoal] ?? "Today's Toolkit";
}

function buildPersonalisedFor(ctx: ToolkitContext, locale: Locale): string[] {
  const momentMap = locale === "es" ? MOMENT_CHIP_ES : MOMENT_CHIP;
  const goalMap = locale === "es" ? GOAL_CHIP_ES : GOAL_CHIP;
  const chips: string[] = [];
  const ageNum = parseInt(ctx.ageRange ?? "", 10);
  if (!Number.isNaN(ageNum)) chips.push(locale === "es" ? `Edad ${ageNum}` : `Age ${ageNum}`);
  if (ctx.routineMoment && momentMap[ctx.routineMoment]) chips.push(momentMap[ctx.routineMoment]);
  if (ctx.primaryGoal && goalMap[ctx.primaryGoal]) chips.push(goalMap[ctx.primaryGoal]);
  if (ctx.isLowEnergy) chips.push(locale === "es" ? "poca preparación" : "low-prep");
  if (ctx.needsScripts) chips.push(locale === "es" ? "necesitas las palabras exactas" : "needs exact words");
  return chips.slice(0, 5);
}

function buildWhyThisFits(
  ctx: ToolkitContext,
  parentSkill: ParentTool,
  emotionalTool: ParentTool,
  locale: Locale,
): string {
  const momentMap = locale === "es" ? MOMENT_CHIP_ES : MOMENT_CHIP;
  const painMap = locale === "es" ? PAIN_PHRASE_ES : PAIN_PHRASE;
  const goalMap = locale === "es" ? GOAL_CHIP_ES : GOAL_CHIP;

  const painKey = ctx.mainPainAll?.[0] ?? ctx.mainPain;
  const painPhrase = painMap[painKey];
  const goalPhrase = goalMap[ctx.primaryGoal];

  if (locale === "es") {
    const opening =
      painPhrase && goalPhrase
        ? `Dijiste que ${painPhrase} y que quieres ${goalPhrase}.`
        : painPhrase
          ? `Dijiste que ${painPhrase}.`
          : goalPhrase
            ? `Quieres ${goalPhrase}.`
            : "Armado a partir de tus respuestas del test.";

    return `${opening} Así que hoy combina el momento de juego con una acción para ti — ${parentSkill.title} — y un breve respiro, ${emotionalTool.title}, para que ${momentMap[ctx.routineMoment] ?? "el día"} se sienta un poco más tranquilo.`;
  }

  const opening =
    painPhrase && goalPhrase
      ? `You said ${painPhrase} and you want ${goalPhrase}.`
      : painPhrase
        ? `You said ${painPhrase}.`
        : goalPhrase
          ? `You want ${goalPhrase}.`
          : "Built from your quiz answers.";

  return `${opening} So today pairs the play moment with one parent move — ${parentSkill.title} — and a short reset, ${emotionalTool.title}, to keep ${momentMap[ctx.routineMoment] ?? "the day"} a little calmer.`;
}

// ── Main builder ──────────────────────────────────────────────────────────────

export function buildDailyToolkit(
  ctx: ToolkitContext,
  dayNumber: number,
  locale: Locale = "en",
): DailyToolkit {
  const groups = activeGroups(ctx);
  const flat = groups.flat();

  const skillIds = orderedUnique(flat.filter((id) => getParentToolById(id)?.category === "parent_skill"));
  const toolIds = orderedUnique(flat.filter((id) => getParentToolById(id)?.category === "emotional_tool"));
  const backupIds = orderedUnique(flat.filter((id) => backupToolIds.includes(id)));

  const rawParentSkill = pickRotating(skillIds, dayNumber, ctx.ageRange, [], parentSkillTools);
  const rawEmotionalTool = pickRotating(toolIds, dayNumber, ctx.ageRange, [], emotionalToolCards);
  const backupPool = backupIds.length > 0 ? backupIds : backupToolIds;
  const rawBackup = pickRotating(
    backupPool,
    dayNumber,
    ctx.ageRange,
    [rawParentSkill.id],
    backupToolIds.map((id) => getParentToolById(id)!).filter(Boolean),
  );

  const parentSkill = localizeParentTool(rawParentSkill, locale);
  const emotionalTool = localizeParentTool(rawEmotionalTool, locale);
  const backup = localizeParentTool(rawBackup, locale);

  return {
    title: dailyTitle(ctx, locale),
    personalisedFor: buildPersonalisedFor(ctx, locale),
    // Pass the already-localized tools so their titles read in the active locale.
    whyThisFits: buildWhyThisFits(ctx, parentSkill, emotionalTool, locale),
    parentSkill,
    emotionalTool,
    backup,
  };
}
