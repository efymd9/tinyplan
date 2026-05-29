// ── Parent Tools Library ─────────────────────────────────────────────────────
// 30 short, original English skill cards for parents of children aged 2–6.
// Two categories:
//   - parent_skill   → how the parent acts, structures, and stays steady
//   - emotional_tool → small resilience tools the parent can offer in the moment
//
// Guardrails: parent-facing only. These are everyday play and parenting practices,
// not therapy, diagnosis, or medical advice. Nothing here claims to treat or cure.

import type { Locale } from "@/lib/i18n/config";

export type ParentToolCategory = "parent_skill" | "emotional_tool";

/** The eight named Parent Skills used for "Parent Growth" tracking in Progress. */
export type ParentSkillType =
  | "predictable_start"
  | "calm_voice"
  | "limited_choice"
  | "emotion_naming"
  | "small_control"
  | "repair_after_refusal"
  | "self_talk_modeling"
  | "one_more_step";

export interface ParentTool {
  id: string;
  title: string;
  category: ParentToolCategory;
  /** Present on parent_skill cards — maps the card to one of the eight named skills. */
  skillType?: ParentSkillType;
  whenToUse: string;
  parentAction: string;
  exactWords: string;
  whyItHelps: string;
  tags: string[];
  ageBands: string[]; // any of '2-3','3-4','4-5','5-6'
  contraindications: string[];
}

const ALL_AGES = ["2-3", "3-4", "4-5", "5-6"];
const OLDER = ["4-5", "5-6"];
const VERBAL = ["3-4", "4-5", "5-6"];

export const PARENT_SKILL_LABELS: Record<ParentSkillType, string> = {
  predictable_start: "Predictable Start",
  calm_voice: "Calm Voice",
  limited_choice: "Limited Choice",
  emotion_naming: "Emotion Naming",
  small_control: "Small Control",
  repair_after_refusal: "Repair After Refusal",
  self_talk_modeling: "Self-Talk Modeling",
  one_more_step: "One More Step",
};

export const PARENT_SKILL_LABELS_ES: Record<ParentSkillType, string> = {
  predictable_start: "Comienzo Predecible",
  calm_voice: "Voz Tranquila",
  limited_choice: "Opciones Limitadas",
  emotion_naming: "Nombrar la Emoción",
  small_control: "Pequeño Control",
  repair_after_refusal: "Reparar Después de una Negativa",
  self_talk_modeling: "Modelar el Diálogo Interno",
  one_more_step: "Un Paso Más",
};

/**
 * Locale-aware label for one of the eight named parent skills.
 * Falls back to the English label / raw key when no translation exists.
 */
export function getParentSkillLabel(skillType: string, locale: Locale = "en"): string {
  const map = locale === "es" ? PARENT_SKILL_LABELS_ES : PARENT_SKILL_LABELS;
  return (map as Record<string, string>)[skillType]
    ?? PARENT_SKILL_LABELS[skillType as ParentSkillType]
    ?? skillType;
}

export const parentTools: ParentTool[] = [
  // ── Emotional tools ────────────────────────────────────────────────────────
  {
    id: "the_sand_timer",
    title: "The Sand Timer",
    category: "emotional_tool",
    whenToUse: "When a feeling seems like it will last forever.",
    parentAction:
      "Show a small timer, or simply remind them that feelings have a beginning and an end.",
    exactWords: "This is hard right now. We only have to ride the wave for a little while.",
    whyItHelps: "Frames a big feeling as temporary, which can make it easier to sit with.",
    tags: ["meltdown", "waiting", "big_feelings"],
    ageBands: ALL_AGES,
    contraindications: ["do_not_use_a_timer_as_a_threat"],
  },
  {
    id: "sometimes_not_always",
    title: "Sometimes, Not Always",
    category: "emotional_tool",
    whenToUse: "When your child says \"always\" or \"never\".",
    parentAction: "Gently swap the absolute word for a softer one.",
    exactWords: "It feels like always. Can we find one time it was different?",
    whyItHelps: "Keeps one hard moment from becoming the whole story.",
    tags: ["language", "frustration", "confidence"],
    ageBands: VERBAL,
    contraindications: ["do_not_argue_about_the_word"],
  },
  {
    id: "color_and_place",
    title: "Color and Place",
    category: "emotional_tool",
    whenToUse: "When the feeling is strong and words are hard to find.",
    parentAction: "Ask where the feeling lives in the body and what color it might be.",
    exactWords: "Where is the feeling right now — in your tummy, your chest, or your hands?",
    whyItHelps: "Moves a child from overwhelm into gentle noticing.",
    tags: ["emotion_naming", "body_awareness", "big_feelings"],
    ageBands: ALL_AGES,
    contraindications: ["skip_if_questions_add_pressure"],
  },
  {
    id: "what_if",
    title: "What If?",
    category: "emotional_tool",
    whenToUse: "When a child feels stuck on one outcome.",
    parentAction: "Play through a couple of small alternatives together.",
    exactWords: "What if we tried it another way?",
    whyItHelps: "Builds flexible thinking and the sense that actions can shift a situation.",
    tags: ["problem_solving", "flexibility", "boredom"],
    ageBands: VERBAL,
    contraindications: ["wait_until_the_storm_passes"],
  },
  {
    id: "three_anchors",
    title: "Three Anchors",
    category: "emotional_tool",
    whenToUse: "For worry, spiraling, or feeling overstimulated.",
    parentAction: "Name three things you see, two you hear, and one you feel in the body.",
    exactWords: "Let's find three real things around us right now.",
    whyItHelps: "Brings attention back to the room and the body.",
    tags: ["anxiety", "grounding", "waiting"],
    ageBands: ALL_AGES,
    contraindications: [],
  },
  {
    id: "what_else_could_be_true",
    title: "What Else Could Be True?",
    category: "emotional_tool",
    whenToUse: "When a child is locked onto one scary explanation.",
    parentAction: "Offer one other gentle possibility, without debating.",
    exactWords: "Maybe that's one reason. What else could be true?",
    whyItHelps: "Widens the picture and lowers the sense of threat.",
    tags: ["anxiety", "thinking", "conflict"],
    ageBands: OLDER,
    contraindications: ["do_not_dismiss_their_first_idea"],
  },
  {
    id: "rarely_not_never",
    title: "Rarely, Not Never",
    category: "emotional_tool",
    whenToUse: "When your child says \"I never can\".",
    parentAction: "Protect hope by softening the word.",
    exactWords: "Maybe not never. Maybe rarely — and we can practice.",
    whyItHelps: "Leaves room for growth and for exceptions.",
    tags: ["confidence", "language", "persistence"],
    ageBands: VERBAL,
    contraindications: [],
  },
  {
    id: "not_all_about_me",
    title: "Not All About Me",
    category: "emotional_tool",
    whenToUse: "After something didn't work out.",
    parentAction: "Separate what depended on your child from what depended on the situation.",
    exactWords: "Was this you, the situation, or a bit of both?",
    whyItHelps: "Protects self-esteem and eases shame after a setback.",
    tags: ["failure", "shame", "confidence"],
    ageBands: OLDER,
    contraindications: ["use_when_already_calm"],
  },
  {
    id: "what_can_we_do",
    title: "What Can We Do?",
    category: "emotional_tool",
    whenToUse: "For small everyday disappointments.",
    parentAction: "Name the problem out loud, then brainstorm one simple action.",
    exactWords: "The park is closed. What can we do instead?",
    whyItHelps: "Builds a habit of action rather than helplessness.",
    tags: ["problem_solving", "boredom", "disappointment"],
    ageBands: VERBAL,
    contraindications: ["acknowledge_the_feeling_first"],
  },
  {
    id: "what_next",
    title: "What Next?",
    category: "emotional_tool",
    whenToUse: "Once you've acknowledged something hard.",
    parentAction: "Move gently from the feeling toward the next small action.",
    exactWords: "Yes, that was hard. What can we do next?",
    whyItHelps: "Supports realistic hope without brushing the feeling aside.",
    tags: ["resilience", "moving_on", "transitions"],
    ageBands: VERBAL,
    contraindications: ["do_not_rush_past_the_feeling"],
  },
  {
    id: "remember_when",
    title: "Remember When",
    category: "emotional_tool",
    whenToUse: "When your child doubts themselves.",
    parentAction: "Recall one specific moment they handled before.",
    exactWords: "Remember when you tried again last time?",
    whyItHelps: "Turns a past success into support for right now.",
    tags: ["confidence", "persistence"],
    ageBands: VERBAL,
    contraindications: [],
  },
  {
    id: "capture_the_win",
    title: "Capture the Win",
    category: "emotional_tool",
    whenToUse: "Just after your child handled something hard.",
    parentAction: "Mark it — a photo, a voice note, or one spoken sentence.",
    exactWords: "You did this even when it was hard.",
    whyItHelps: "Makes a success easier to remember and lean on next time.",
    tags: ["progress", "confidence"],
    ageBands: ALL_AGES,
    contraindications: [],
  },
  {
    id: "name_and_step_back",
    title: "Name and Step Back",
    category: "emotional_tool",
    whenToUse: "When your child seems to become the feeling.",
    parentAction: "Gently separate the child from the emotion.",
    exactWords: "Anger is visiting right now. You are bigger than the anger.",
    whyItHelps: "Creates a little distance between the child and the feeling.",
    tags: ["emotion_boundary", "big_feelings"],
    ageBands: VERBAL,
    contraindications: [],
  },
  {
    id: "the_attempt_mark",
    title: "The Attempt Mark",
    category: "emotional_tool",
    whenToUse: "After a try that didn't work.",
    parentAction: "Make a small mark for \"one attempt\" and show that the page keeps going.",
    exactWords: "This was one try, not the whole story.",
    whyItHelps: "Keeps a single setback separate from who your child is.",
    tags: ["failure", "growth", "frustration"],
    ageBands: OLDER,
    contraindications: [],
  },
  {
    id: "what_did_we_learn",
    title: "What Did We Learn?",
    category: "emotional_tool",
    whenToUse: "After something didn't go to plan.",
    parentAction: "Ask one learning question instead of jumping in to solve it.",
    exactWords: "What did we learn from this try?",
    whyItHelps: "Turns a frustrating moment into useful experience.",
    tags: ["learning", "repair", "frustration"],
    ageBands: VERBAL,
    contraindications: ["wait_until_calm"],
  },
  {
    id: "blow_out_five_candles",
    title: "Blow Out Five Candles",
    category: "emotional_tool",
    whenToUse: "When feelings are too big for thinking.",
    parentAction: "Hold up five fingers and fold one down after each slow breath.",
    exactWords: "Blow out five tiny candles with me.",
    whyItHelps: "Settles the body a little before any problem-solving.",
    tags: ["breathing", "meltdown", "bedtime"],
    ageBands: ALL_AGES,
    contraindications: [],
  },
  {
    id: "split_the_feeling",
    title: "Split the Feeling",
    category: "emotional_tool",
    whenToUse: "When your child feels alone with a big emotion.",
    parentAction: "Pretend to split the feeling in two and hold half of it with them.",
    exactWords: "Give me half of that feeling. I can hold it with you.",
    whyItHelps: "Builds connection and a sense of safety in the moment.",
    tags: ["big_feelings", "connection"],
    ageBands: ALL_AGES,
    contraindications: [],
  },
  {
    id: "light_switch_thought",
    title: "Light Switch Thought",
    category: "emotional_tool",
    whenToUse: "When a thought seems to shut your child down.",
    parentAction: "Ask whether the thought turns their light on or off.",
    exactWords: "Does that thought turn your light on or off?",
    whyItHelps: "Helps notice a thought without having to fight it.",
    tags: ["self_talk", "thinking", "confidence"],
    ageBands: OLDER,
    contraindications: [],
  },
  {
    id: "mirror_moment",
    title: "Mirror Moment",
    category: "emotional_tool",
    whenToUse: "For older children who can watch themselves a little.",
    parentAction: "Look in a mirror together and name the feeling for a few seconds.",
    exactWords: "I am angry right now, and I can see it.",
    whyItHelps: "Turns a vague feeling into something they can observe.",
    tags: ["emotional_awareness", "grounding"],
    ageBands: OLDER,
    contraindications: ["skip_if_it_feels_like_too_much"],
  },

  // ── Parent skills ──────────────────────────────────────────────────────────
  {
    id: "what_is_our_plan",
    title: "What Is Our Plan?",
    category: "parent_skill",
    skillType: "predictable_start",
    whenToUse: "Before a transition or the start of the day.",
    parentAction: "Say the order out loud: now, next, finish.",
    exactWords: "First shoes, then car, then playground.",
    whyItHelps: "Predictability can lower anxiety and reduce friction.",
    tags: ["routine", "transitions", "bedtime"],
    ageBands: ALL_AGES,
    contraindications: ["keep_the_plan_short"],
  },
  {
    id: "clear_steps",
    title: "Clear Steps",
    category: "parent_skill",
    skillType: "predictable_start",
    whenToUse: "When your child hesitates before starting.",
    parentAction: "Give one simple instruction at a time.",
    exactWords: "First put the blue block here. That's all.",
    whyItHelps: "One small step at a time lowers the mental load.",
    tags: ["instructions", "focus", "transitions"],
    ageBands: ALL_AGES,
    contraindications: ["avoid_stacking_instructions"],
  },
  {
    id: "quiet_lighthouse",
    title: "Quiet Lighthouse",
    category: "parent_skill",
    skillType: "calm_voice",
    whenToUse: "During a strong emotional storm.",
    parentAction: "Get low, breathe slowly, say very little, and stay present.",
    exactWords: "I am here.",
    whyItHelps: "Your calm becomes a steady anchor your child can borrow.",
    tags: ["meltdown", "parent_skill", "big_feelings"],
    ageBands: ALL_AGES,
    contraindications: ["do_not_lecture_during_the_storm"],
  },
  {
    id: "two_choices",
    title: "Two Choices",
    category: "parent_skill",
    skillType: "limited_choice",
    whenToUse: "When your child is overwhelmed or refusing.",
    parentAction: "Offer exactly two options you can happily accept.",
    exactWords: "Do you want to start with the blocks or the blanket?",
    whyItHelps: "Gives a sense of control inside safe boundaries.",
    tags: ["choice", "refusal", "transitions"],
    ageBands: ALL_AGES,
    contraindications: ["do_not_offer_choices_you_cannot_accept"],
  },
  {
    id: "name_and_share",
    title: "Name and Share",
    category: "parent_skill",
    skillType: "emotion_naming",
    whenToUse: "When your child has a clear feeling.",
    parentAction: "Name the feeling and let them know you're in it with them.",
    exactWords: "You feel sad. I can sit with part of that sadness.",
    whyItHelps: "Makes a feeling more understandable and less lonely.",
    tags: ["emotion_naming", "connection", "big_feelings"],
    ageBands: ALL_AGES,
    contraindications: ["offer_the_name_gently_not_as_a_correction"],
  },
  {
    id: "small_control",
    title: "Small Control",
    category: "parent_skill",
    skillType: "small_control",
    whenToUse: "When your child feels powerless.",
    parentAction: "Ask for one thing they can choose or influence.",
    exactWords: "We can't change that part. What can we choose now?",
    whyItHelps: "Returns a sense of agency in a small, doable way.",
    tags: ["control", "transitions", "disappointment"],
    ageBands: ALL_AGES,
    contraindications: [],
  },
  {
    id: "where_do_we_start",
    title: "Where Do We Start?",
    category: "parent_skill",
    skillType: "small_control",
    whenToUse: "Once the feeling has softened.",
    parentAction: "Break the hard thing into one tiny first step.",
    exactWords: "We don't need to solve all of it. What's the first tiny step?",
    whyItHelps: "Turns overwhelm into a little bit of movement.",
    tags: ["overwhelm", "transitions", "refusal"],
    ageBands: VERBAL,
    contraindications: ["wait_until_the_feeling_eases"],
  },
  {
    id: "plan_b",
    title: "Plan B",
    category: "parent_skill",
    skillType: "small_control",
    whenToUse: "Before or after a likely disappointment.",
    parentAction: "Make a backup plan together, ahead of time when you can.",
    exactWords: "If the first plan doesn't work, what's our Plan B?",
    whyItHelps: "Makes setbacks feel less all-or-nothing.",
    tags: ["disappointment", "flexibility", "transitions"],
    ageBands: VERBAL,
    contraindications: [],
  },
  {
    id: "one_more_step",
    title: "One More Step",
    category: "parent_skill",
    skillType: "one_more_step",
    whenToUse: "When your child wants to stop but could do a tiny bit more.",
    parentAction: "Ask for one small final step, then stop exactly as promised.",
    exactWords: "One more piece, then we stop.",
    whyItHelps: "Builds gentle persistence without pressure.",
    tags: ["persistence", "confidence", "focus"],
    ageBands: ALL_AGES,
    contraindications: ["always_keep_the_promise_to_stop"],
  },
  {
    id: "talk_in_calm_not_storm",
    title: "Talk in Calm, Not Storm",
    category: "parent_skill",
    skillType: "repair_after_refusal",
    whenToUse: "For a hard behavior that keeps coming back.",
    parentAction: "Don't teach during the meltdown — talk later, once things are calm.",
    exactWords: "Let's talk about next time, now that we're both calm.",
    whyItHelps: "Learning lands better once the nervous system has settled.",
    tags: ["parent_skill", "repair", "refusal"],
    ageBands: VERBAL,
    contraindications: ["do_not_revisit_while_still_upset"],
  },
  {
    id: "parent_self_talk",
    title: "Parent Self-Talk",
    category: "parent_skill",
    skillType: "self_talk_modeling",
    whenToUse: "When you make a small mistake in front of your child.",
    parentAction: "Let them hear you talk to yourself calmly.",
    exactWords: "That didn't work. I feel frustrated, so I'll try a smaller step.",
    whyItHelps: "Children pick up the inner voice the adults around them model.",
    tags: ["parent_skill", "self_regulation", "self_talk"],
    ageBands: ALL_AGES,
    contraindications: [],
  },
];

// ── Spanish translations (keyed by tool id) ──────────────────────────────────
// Neutral Latin American Spanish, informal "tú", warm and encouraging.
// Covers every tool id in `parentTools`. Structural fields (category, tags,
// ageBands, contraindications, skillType, id) stay English/locale-independent.

type ParentToolText = {
  title: string;
  whenToUse: string;
  parentAction: string;
  exactWords: string;
  whyItHelps: string;
};

const PARENT_TOOLS_TEXT_ES: Record<string, ParentToolText> = {
  // ── Emotional tools ────────────────────────────────────────────────────────
  the_sand_timer: {
    title: "El Reloj de Arena",
    whenToUse: "Cuando una emoción parece que va a durar para siempre.",
    parentAction:
      "Muéstrale un pequeño temporizador, o simplemente recuérdale que las emociones tienen un comienzo y un final.",
    exactWords: "Esto está difícil ahora mismo. Solo tenemos que surfear la ola un ratito.",
    whyItHelps: "Encuadra una emoción grande como algo temporal, lo que la hace más fácil de sostener.",
  },
  sometimes_not_always: {
    title: "A Veces, No Siempre",
    whenToUse: "Cuando tu peque dice \"siempre\" o \"nunca\".",
    parentAction: "Cambia con suavidad la palabra absoluta por una más blanda.",
    exactWords: "Se siente como que es siempre. ¿Podemos encontrar una vez en que fue distinto?",
    whyItHelps: "Evita que un momento difícil se convierta en toda la historia.",
  },
  color_and_place: {
    title: "Color y Lugar",
    whenToUse: "Cuando la emoción es fuerte y cuesta encontrar las palabras.",
    parentAction: "Pregúntale dónde vive la emoción en su cuerpo y de qué color podría ser.",
    exactWords: "¿Dónde está la emoción ahora mismo: en tu panza, tu pecho o tus manos?",
    whyItHelps: "Lleva al peque del desborde a una observación suave.",
  },
  what_if: {
    title: "¿Y Si...?",
    whenToUse: "Cuando el peque se queda atascado en un solo resultado.",
    parentAction: "Jueguen juntos a imaginar un par de alternativas pequeñas.",
    exactWords: "¿Y si lo intentáramos de otra manera?",
    whyItHelps: "Desarrolla el pensamiento flexible y la idea de que las acciones pueden cambiar una situación.",
  },
  three_anchors: {
    title: "Tres Anclas",
    whenToUse: "Para la preocupación, las vueltas en la cabeza o el exceso de estímulos.",
    parentAction: "Nombren tres cosas que ven, dos que oyen y una que sienten en el cuerpo.",
    exactWords: "Busquemos tres cosas reales que tengamos alrededor ahora mismo.",
    whyItHelps: "Trae la atención de vuelta a la habitación y al cuerpo.",
  },
  what_else_could_be_true: {
    title: "¿Qué Más Podría Ser Verdad?",
    whenToUse: "Cuando el peque se aferra a una sola explicación que da miedo.",
    parentAction: "Ofrécele otra posibilidad suave, sin debatir.",
    exactWords: "Tal vez esa sea una razón. ¿Qué más podría ser verdad?",
    whyItHelps: "Amplía el panorama y baja la sensación de amenaza.",
  },
  rarely_not_never: {
    title: "Pocas Veces, No Nunca",
    whenToUse: "Cuando tu peque dice \"nunca puedo\".",
    parentAction: "Protege la esperanza suavizando la palabra.",
    exactWords: "Tal vez no es nunca. Tal vez pocas veces, y podemos practicar.",
    whyItHelps: "Deja espacio para crecer y para las excepciones.",
  },
  not_all_about_me: {
    title: "No Todo Es Por Mí",
    whenToUse: "Después de que algo no salió bien.",
    parentAction: "Separa lo que dependía de tu peque de lo que dependía de la situación.",
    exactWords: "¿Esto fue por ti, por la situación o un poco de las dos?",
    whyItHelps: "Protege la autoestima y alivia la vergüenza tras un tropiezo.",
  },
  what_can_we_do: {
    title: "¿Qué Podemos Hacer?",
    whenToUse: "Para las pequeñas decepciones de cada día.",
    parentAction: "Nombra el problema en voz alta y luego piensen juntos una acción simple.",
    exactWords: "El parque está cerrado. ¿Qué podemos hacer en su lugar?",
    whyItHelps: "Crea el hábito de actuar en vez de sentirse sin salida.",
  },
  what_next: {
    title: "¿Y Ahora Qué?",
    whenToUse: "Una vez que ya reconociste algo difícil.",
    parentAction: "Avancen con suavidad de la emoción hacia la próxima pequeña acción.",
    exactWords: "Sí, eso fue difícil. ¿Qué podemos hacer ahora?",
    whyItHelps: "Sostiene una esperanza realista sin dejar de lado la emoción.",
  },
  remember_when: {
    title: "¿Te Acuerdas Cuando...?",
    whenToUse: "Cuando tu peque duda de sí mismo.",
    parentAction: "Recuerda un momento específico en que lo logró antes.",
    exactWords: "¿Te acuerdas cuando lo volviste a intentar la última vez?",
    whyItHelps: "Convierte un logro pasado en apoyo para este momento.",
  },
  capture_the_win: {
    title: "Captura el Logro",
    whenToUse: "Justo después de que tu peque manejó algo difícil.",
    parentAction: "Márcalo: una foto, una nota de voz o una frase dicha en voz alta.",
    exactWords: "Lo lograste incluso cuando estaba difícil.",
    whyItHelps: "Hace que un logro sea más fácil de recordar y de usar la próxima vez.",
  },
  name_and_step_back: {
    title: "Nombrar y Tomar Distancia",
    whenToUse: "Cuando tu peque parece convertirse en la emoción.",
    parentAction: "Separa con suavidad al peque de la emoción.",
    exactWords: "El enojo está de visita ahora mismo. Tú eres más grande que el enojo.",
    whyItHelps: "Crea un poco de distancia entre el peque y la emoción.",
  },
  the_attempt_mark: {
    title: "La Marca del Intento",
    whenToUse: "Después de un intento que no funcionó.",
    parentAction: "Haz una pequeña marca de \"un intento\" y muestra que la página sigue.",
    exactWords: "Esto fue un intento, no toda la historia.",
    whyItHelps: "Mantiene un tropiezo separado de quién es tu peque.",
  },
  what_did_we_learn: {
    title: "¿Qué Aprendimos?",
    whenToUse: "Después de que algo no salió como esperaban.",
    parentAction: "Haz una pregunta de aprendizaje en vez de saltar a resolverlo.",
    exactWords: "¿Qué aprendimos de este intento?",
    whyItHelps: "Convierte un momento frustrante en experiencia útil.",
  },
  blow_out_five_candles: {
    title: "Apaga Cinco Velas",
    whenToUse: "Cuando las emociones son demasiado grandes para pensar.",
    parentAction: "Levanta cinco dedos y baja uno después de cada respiración lenta.",
    exactWords: "Apaga cinco velitas conmigo.",
    whyItHelps: "Calma un poco el cuerpo antes de cualquier solución.",
  },
  split_the_feeling: {
    title: "Repartir la Emoción",
    whenToUse: "Cuando tu peque se siente solo con una emoción grande.",
    parentAction: "Hagan como que parten la emoción en dos y sostén la mitad con él.",
    exactWords: "Dame la mitad de esa emoción. La puedo sostener contigo.",
    whyItHelps: "Crea conexión y una sensación de seguridad en el momento.",
  },
  light_switch_thought: {
    title: "El Pensamiento Interruptor",
    whenToUse: "Cuando un pensamiento parece apagar a tu peque.",
    parentAction: "Pregúntale si ese pensamiento le enciende o le apaga la luz.",
    exactWords: "¿Ese pensamiento te enciende o te apaga la luz?",
    whyItHelps: "Ayuda a notar un pensamiento sin tener que pelear con él.",
  },
  mirror_moment: {
    title: "Momento Espejo",
    whenToUse: "Para peques más grandes que ya pueden observarse un poco.",
    parentAction: "Mírense juntos en un espejo y nombren la emoción por unos segundos.",
    exactWords: "Estoy enojado ahora mismo, y puedo verlo.",
    whyItHelps: "Convierte una emoción difusa en algo que pueden observar.",
  },

  // ── Parent skills ──────────────────────────────────────────────────────────
  what_is_our_plan: {
    title: "¿Cuál Es Nuestro Plan?",
    whenToUse: "Antes de una transición o al empezar el día.",
    parentAction: "Di el orden en voz alta: ahora, después, fin.",
    exactWords: "Primero los zapatos, después el auto, después el parque.",
    whyItHelps: "La previsibilidad puede bajar la ansiedad y reducir los roces.",
  },
  clear_steps: {
    title: "Pasos Claros",
    whenToUse: "Cuando tu peque duda antes de empezar.",
    parentAction: "Da una sola instrucción simple a la vez.",
    exactWords: "Primero pon el bloque azul aquí. Eso es todo.",
    whyItHelps: "Un pasito a la vez baja la carga mental.",
  },
  quiet_lighthouse: {
    title: "Faro Tranquilo",
    whenToUse: "Durante una tormenta emocional fuerte.",
    parentAction: "Ponte a su altura, respira despacio, di muy poco y quédate presente.",
    exactWords: "Estoy aquí.",
    whyItHelps: "Tu calma se vuelve un ancla firme que tu peque puede tomar prestada.",
  },
  two_choices: {
    title: "Dos Opciones",
    whenToUse: "Cuando tu peque está desbordado o se niega.",
    parentAction: "Ofrece exactamente dos opciones que puedas aceptar con gusto.",
    exactWords: "¿Quieres empezar con los bloques o con la manta?",
    whyItHelps: "Le da una sensación de control dentro de límites seguros.",
  },
  name_and_share: {
    title: "Nombrar y Acompañar",
    whenToUse: "Cuando tu peque tiene una emoción clara.",
    parentAction: "Nombra la emoción y hazle saber que estás ahí con él.",
    exactWords: "Sientes tristeza. Puedo acompañarte con una parte de esa tristeza.",
    whyItHelps: "Hace que una emoción sea más entendible y menos solitaria.",
  },
  small_control: {
    title: "Pequeño Control",
    whenToUse: "Cuando tu peque se siente sin poder.",
    parentAction: "Pídele una sola cosa que pueda elegir o influir.",
    exactWords: "No podemos cambiar esa parte. ¿Qué podemos elegir ahora?",
    whyItHelps: "Devuelve una sensación de control de forma pequeña y posible.",
  },
  where_do_we_start: {
    title: "¿Por Dónde Empezamos?",
    whenToUse: "Una vez que la emoción se ha suavizado.",
    parentAction: "Divide lo difícil en un primer pasito.",
    exactWords: "No tenemos que resolverlo todo. ¿Cuál es el primer pasito?",
    whyItHelps: "Convierte el desborde en un poquito de movimiento.",
  },
  plan_b: {
    title: "Plan B",
    whenToUse: "Antes o después de una decepción probable.",
    parentAction: "Hagan juntos un plan de respaldo, con tiempo cuando se pueda.",
    exactWords: "Si el primer plan no funciona, ¿cuál es nuestro Plan B?",
    whyItHelps: "Hace que los tropiezos se sientan menos de todo o nada.",
  },
  one_more_step: {
    title: "Un Paso Más",
    whenToUse: "Cuando tu peque quiere parar pero podría hacer un poquito más.",
    parentAction: "Pídele un último pasito y luego para exactamente como prometiste.",
    exactWords: "Una pieza más y paramos.",
    whyItHelps: "Desarrolla una constancia suave sin presión.",
  },
  talk_in_calm_not_storm: {
    title: "Hablar en Calma, No en Tormenta",
    whenToUse: "Para una conducta difícil que se repite.",
    parentAction: "No enseñes durante el berrinche: habla después, cuando ya estén tranquilos.",
    exactWords: "Hablemos de la próxima vez, ahora que los dos estamos tranquilos.",
    whyItHelps: "El aprendizaje cala mejor cuando el sistema nervioso se ha calmado.",
  },
  parent_self_talk: {
    title: "Diálogo Interno del Adulto",
    whenToUse: "Cuando cometes un pequeño error frente a tu peque.",
    parentAction: "Deja que te escuche hablarte con calma a ti mismo.",
    exactWords: "Eso no funcionó. Me siento frustrado, así que voy a probar un paso más pequeño.",
    whyItHelps: "Los peques adoptan la voz interna que ven en los adultos a su alrededor.",
  },
};

/**
 * Locale-aware view of a parent tool. Returns the tool unchanged for English;
 * for Spanish, overlays the translated text fields keyed by tool id. Falls back
 * to the unchanged tool when no translation exists for the id.
 */
export function localizeParentTool<T extends { id: string }>(tool: T, locale: Locale): T {
  if (locale !== "es") return tool;
  const text = PARENT_TOOLS_TEXT_ES[tool.id];
  return text ? { ...tool, ...text } : tool;
}

// ── Lookups & helpers ────────────────────────────────────────────────────────

const TOOLS_BY_ID: Record<string, ParentTool> = Object.fromEntries(
  parentTools.map((t) => [t.id, t]),
);

export function getParentToolById(id: string): ParentTool | undefined {
  return TOOLS_BY_ID[id];
}

export const parentSkillTools: ParentTool[] = parentTools.filter(
  (t) => t.category === "parent_skill",
);

export const emotionalToolCards: ParentTool[] = parentTools.filter(
  (t) => t.category === "emotional_tool",
);

/** Cards that work well as a backup / "if it gets hard" move. */
export const backupToolIds = [
  "two_choices",
  "where_do_we_start",
  "plan_b",
  "talk_in_calm_not_storm",
  "small_control",
  "one_more_step",
];

export function toolMatchesAge(tool: ParentTool, ageRange: string): boolean {
  const age = parseInt(ageRange, 10);
  if (Number.isNaN(age)) return true; // 'multi' or unknown — allow
  // Map a single age to the band it falls in (2-3,3-4,4-5,5-6 overlap by design).
  return tool.ageBands.some((band) => {
    const [min, max] = band.split("-").map((n) => parseInt(n, 10));
    return age >= min && age <= max;
  });
}
