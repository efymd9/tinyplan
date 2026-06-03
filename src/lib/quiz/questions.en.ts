// ── Quiz Screen Data (English) ─────────────────────────────────────────────
// Locale-specific English data. Types live in ./questions.ts.

import type { QuizScreen } from './questions';
import { answerIncludes, answerIs, getFirst } from './questions';

// ── Display maps (English) ──────────────────────────────────────────────────

export const PAIN_DISPLAY_EN: Record<string, string> = {
  screen_time: 'reducing screen-time battles',
  transitions: 'calmer transitions',
  no_ideas: 'fresh play ideas',
  boredom: 'keeping your child engaged',
  independent_play: 'building independent play',
  bedtime: 'an easier bedtime',
  connection: 'more meaningful connection',
};

export const MOMENT_DISPLAY_EN: Record<string, string> = {
  morning: 'mornings',
  after_preschool: 'after preschool',
  before_dinner: 'before dinner',
  bedtime: 'bedtime',
  weekends: 'weekends',
  hard_moments: 'hard moments',
};

export const AGE_DISPLAY_EN: Record<string, string> = {
  '2': '2-year-old',
  '3': '3-year-old',
  '4': '4-year-old',
  '5': '5-year-old',
  '6': '6-year-old',
  multi: 'children',
};

export const CHILD_STYLE_TO_PROFILE_EN: Record<string, { name: string; desc: string }> = {
  active_explorer: { name: 'Active Explorer', desc: 'movement-based activities, physical games, and hands-on exploration' },
  curious_builder: { name: 'Curious Builder', desc: 'hands-on activities, simple building, sorting, and choices your child can control' },
  story_seeker: { name: 'Story Seeker', desc: 'storytelling, pretend play, characters, and imaginative scenarios' },
  routine_seeker: { name: 'Routine Lover', desc: 'predictable activities, clear steps, and structured play' },
  sensitive_starter: { name: 'Sensitive Starter', desc: 'gentle activities that build confidence step by step' },
  fast_bored: { name: 'Fast-Paced Explorer', desc: 'quick variety, engaging moments, and fast-start activities' },
};

export const TIME_DISPLAY_EN: Record<string, string> = {
  '3_5': '3–5 minute',
  '7_10': '7–10 minute',
  '10_15': '10–15 minute',
  '15_plus': '15+ minute',
  depends: 'flexible',
};

// ── Quiz Screens (English) ──────────────────────────────────────────────────

export const QUIZ_QUESTIONS_EN: QuizScreen[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: child — "About your child"
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'age',
    type: 'single',
    stage: 'child',
    stageLabel: 'About your child',
    question: 'How old is your child?',
    options: [
      { id: '2', label: '2 years old', tags: { ageBand: 'toddler_2' } },
      { id: '3', label: '3 years old', tags: { ageBand: 'preschool_3_4' } },
      { id: '4', label: '4 years old', tags: { ageBand: 'preschool_3_4' } },
      { id: '5', label: '5 years old', tags: { ageBand: 'older_preschool_5_6' } },
      { id: '6', label: '6 years old', tags: { ageBand: 'older_preschool_5_6' } },
      { id: 'multi', label: 'More than one child', tags: { ageBand: 'multi' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: pain (screens 3-5) — "Understanding your goals"
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'main-pain',
    type: 'multiple',
    stage: 'pain',
    stageLabel: 'Understanding your goals',
    question: 'What feels hardest right now?',
    instruction: 'Choose up to 2',
    maxSelections: 2,
    options: [
      { id: 'screen_time', label: 'We rely on screens too often', tags: { mainPain: 'screen_time' } },
      { id: 'transitions', label: 'My child gets upset during transitions', tags: { mainPain: 'transitions' } },
      { id: 'no_ideas', label: 'I don\'t know what to play', tags: { mainPain: 'no_ideas' } },
      { id: 'boredom', label: 'My child gets bored quickly', tags: { mainPain: 'boredom' } },
      { id: 'independent_play', label: 'My child struggles to play independently', tags: { mainPain: 'independent_play' } },
      { id: 'bedtime', label: 'Bedtime is chaotic', tags: { mainPain: 'bedtime' } },
      { id: 'connection', label: 'I want more meaningful time together', tags: { mainPain: 'connection' } },
    ],
  },

  {
    id: 'help-moment',
    type: 'single',
    stage: 'pain',
    stageLabel: 'Understanding your goals',
    question: 'When do you usually need the most help?',
    options: [
      { id: 'morning', label: 'Morning routine', tags: { helpMoment: 'morning' } },
      { id: 'after_preschool', label: 'After preschool/daycare', tags: { helpMoment: 'after_preschool' } },
      { id: 'before_dinner', label: 'Before dinner', tags: { helpMoment: 'before_dinner' } },
      { id: 'bedtime', label: 'Bedtime', tags: { helpMoment: 'bedtime' } },
      { id: 'weekends', label: 'Weekends', tags: { helpMoment: 'weekends' } },
      { id: 'hard_moments', label: 'Random hard moments', tags: { helpMoment: 'hard_moments' } },
    ],
  },

  {
    id: 'summary-1',
    type: 'affirmation',
    stage: 'pain',
    stageLabel: 'Understanding your goals',
    dynamicText: (answers) => {
      const pains = answers['main-pain'];
      const moment = getFirst(answers, 'help-moment');
      const painArr = Array.isArray(pains) ? pains : pains ? [pains] : [];
      const painTexts = painArr.map((p) => PAIN_DISPLAY_EN[p] ?? p).join(' and ');
      const momentText = MOMENT_DISPLAY_EN[moment] ?? moment;

      if (painTexts && momentText) {
        return `Got it. We'll build your plan around ${painTexts}, especially during ${momentText}.\n\nSmall activities that are easy to start.`;
      }
      if (painTexts) {
        return `Got it. We'll build your plan around ${painTexts}.\n\nSmall activities that are easy to start.`;
      }
      return 'Got it. We\'ll build your plan around small, realistic moments — not perfect parenting.';
    },
  },

  {
    id: 'email',
    type: 'email',
    stage: 'pain',
    stageLabel: 'Understanding your goals',
    text: "We're building your plan — where should we save it?",
    subtitle: "We'll use this to save your personalized plan and send your first week.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: child-style — "Your child's play style"
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'child-style',
    type: 'multiple',
    stage: 'child-style',
    stageLabel: 'Your child\'s play style',
    question: 'Which sounds most like your child?',
    instruction: 'Choose up to 2',
    maxSelections: 2,
    options: [
      { id: 'active_explorer', label: 'Always moving and exploring', tags: { childStyle: 'active_explorer' } },
      { id: 'story_seeker', label: 'Loves stories and pretend play', tags: { childStyle: 'story_seeker' } },
      { id: 'curious_builder', label: 'Likes building, sorting, puzzles', tags: { childStyle: 'curious_builder' } },
      { id: 'sensitive_starter', label: 'Gets frustrated quickly', tags: { childStyle: 'sensitive_starter' } },
      { id: 'routine_seeker', label: 'Needs routine and predictability', tags: { childStyle: 'routine_seeker' } },
      { id: 'fast_bored', label: 'Wants attention but gets bored fast', tags: { childStyle: 'fast_bored' } },
    ],
  },

  {
    id: 'reaction',
    type: 'single',
    stage: 'child-style',
    stageLabel: 'Your child\'s play style',
    question: 'How does your child usually react to a new activity?',
    options: [
      { id: 'jumps_in', label: 'Jumps right in', tags: { reactionStyle: 'jumps_in' } },
      { id: 'watches_first', label: 'Watches first, then joins', tags: { reactionStyle: 'watches_first' } },
      { id: 'needs_help', label: 'Needs help getting started', tags: { reactionStyle: 'needs_help' } },
      { id: 'says_no', label: 'Says no at first', tags: { reactionStyle: 'says_no' } },
      { id: 'loses_interest', label: 'Gets excited then loses interest', tags: { reactionStyle: 'loses_interest' } },
      { id: 'mood_dependent', label: 'Depends on the mood', tags: { reactionStyle: 'mood_dependent' } },
    ],
  },

  {
    id: 'activity-likes',
    type: 'multiple',
    stage: 'child-style',
    stageLabel: 'Your child\'s play style',
    question: 'What kind of activities does your child enjoy most?',
    instruction: 'Choose up to 2',
    maxSelections: 2,
    options: [
      { id: 'movement', label: 'Running, jumping, climbing', tags: { activityLikes: 'movement' } },
      { id: 'drawing', label: 'Drawing, coloring, painting', tags: { activityLikes: 'drawing' } },
      { id: 'stories', label: 'Stories and books', tags: { activityLikes: 'stories' } },
      { id: 'building', label: 'Building and puzzles', tags: { activityLikes: 'building' } },
      { id: 'helper_tasks', label: 'Helping with grown-up tasks', tags: { activityLikes: 'helper_tasks' } },
      { id: 'sensory', label: 'Water, sensory, or messy play', tags: { activityLikes: 'sensory' } },
      { id: 'not_sure', label: 'Not sure yet', tags: { activityLikes: 'not_sure' } },
    ],
  },

  {
    id: 'summary-2',
    type: 'micro-insight',
    stage: 'child-style',
    stageLabel: 'Your child\'s play style',
    text: 'We\'re seeing your child\'s play pattern.',
    dynamicText: (answers) => {
      const styles = answers['child-style'];
      const styleArr = Array.isArray(styles) ? styles : styles ? [styles] : [];
      const primary = styleArr[0] ?? '';
      const info = CHILD_STYLE_TO_PROFILE_EN[primary];
      if (info) {
        return `We're seeing a ${info.name} play pattern.\n\nThat means your plan should include ${info.desc}.`;
      }
      return 'We\'re learning how your child plays best.';
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: parent (screens 10-14) — "Your real-life constraints"
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'attention-span',
    type: 'single',
    stage: 'parent',
    stageLabel: 'Your real-life constraints',
    question: 'How long does your child usually stay with one activity?',
    options: [
      { id: 'under_3', label: 'Under 3 minutes', tags: { attentionSpan: 'under_3' } },
      { id: '3_5', label: '3–5 minutes', tags: { attentionSpan: '3_5' } },
      { id: '5_10', label: '5–10 minutes', tags: { attentionSpan: '5_10' } },
      { id: '10_plus', label: '10+ minutes', tags: { attentionSpan: '10_plus' } },
      { id: 'mood_dependent', label: 'Depends on the mood', tags: { attentionSpan: 'mood_dependent' } },
    ],
  },

  {
    id: 'parent-time',
    type: 'single',
    stage: 'parent',
    stageLabel: 'Your real-life constraints',
    question: 'How much time can you realistically spend on an activity?',
    options: [
      { id: '3_5', label: '3–5 minutes', tags: { parentTime: '3_5' } },
      { id: '7_10', label: '7–10 minutes', tags: { parentTime: '7_10' } },
      { id: '10_15', label: '10–15 minutes', tags: { parentTime: '10_15' } },
      { id: '15_plus', label: '15+ minutes', tags: { parentTime: '15_plus' } },
      { id: 'depends', label: 'Depends on the day', tags: { parentTime: 'depends' } },
    ],
  },

  {
    id: 'obstacles',
    type: 'multiple',
    stage: 'parent',
    stageLabel: 'Your real-life constraints',
    question: 'What usually gets in the way?',
    instruction: 'Choose up to 2',
    maxSelections: 2,
    options: [
      { id: 'loses_interest', label: 'My child loses interest quickly', tags: { parentConstraint: 'loses_interest' } },
      { id: 'child_refuses', label: 'My child says no or refuses', tags: { parentConstraint: 'child_refuses' } },
      { id: 'low_energy', label: 'I\'m too tired', tags: { parentConstraint: 'low_energy' } },
      { id: 'needs_scripts', label: 'I don\'t know how to start', tags: { parentConstraint: 'needs_scripts' } },
      { id: 'low_time', label: 'I don\'t have time', tags: { parentConstraint: 'low_time' } },
      { id: 'no_materials', label: 'We don\'t have the right materials', tags: { parentConstraint: 'no_materials' } },
      { id: 'inconsistent', label: 'We\'re not consistent', tags: { parentConstraint: 'inconsistent' } },
    ],
  },

  {
    id: 'support-needed',
    type: 'multiple',
    stage: 'parent',
    stageLabel: 'Your real-life constraints',
    question: 'What would help you most during an activity?',
    instruction: 'Choose up to 2',
    maxSelections: 2,
    options: [
      { id: 'step_by_step', label: 'Step-by-step instructions', tags: { supportNeeded: 'step_by_step' } },
      { id: 'exact_words', label: 'Exact words to say to my child', tags: { supportNeeded: 'exact_words' } },
      { id: 'shorter_version', label: 'A shorter version if we\'re low on time', tags: { supportNeeded: 'shorter_version' } },
      { id: 'easier_version', label: 'A way to make it easier if my child struggles', tags: { supportNeeded: 'easier_version' } },
      { id: 'backup_if_refuses', label: 'A backup idea if my child refuses', tags: { supportNeeded: 'backup_if_refuses' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: plan — "Building your plan"
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'plan-format',
    type: 'single',
    stage: 'plan',
    stageLabel: 'Building your plan',
    question: 'What kind of plan would you actually follow?',
    options: [
      { id: 'one_activity', label: 'One activity per day', tags: { planFormat: 'one_activity' } },
      { id: 'morning_evening', label: 'A morning + evening routine', tags: { planFormat: 'morning_evening' } },
      { id: 'flexible_options', label: 'A few options to pick from each day', tags: { planFormat: 'flexible_options' } },
      { id: 'sos_only', label: 'Just help for difficult moments', tags: { planFormat: 'sos_only' } },
      { id: 'weekend_focused', label: 'A weekend-focused plan', tags: { planFormat: 'weekend_focused' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: conditional — Conditional branch screens
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'cond-screen-time',
    type: 'single',
    stage: 'conditional',
    stageLabel: 'Building your plan',
    question: 'How much screen time does your child have on a typical day?',
    condition: (answers) =>
      answerIncludes(answers, 'main-pain', 'screen_time'),
    options: [
      { id: 'almost_none', label: 'Almost none', tags: { screenTimeAmount: 'almost_none' } },
      { id: 'under_30', label: 'Less than 30 minutes', tags: { screenTimeAmount: 'under_30' } },
      { id: '30_60', label: '30–60 minutes', tags: { screenTimeAmount: '30_60' } },
      { id: '1_2hrs', label: '1–2 hours', tags: { screenTimeAmount: '1_2hrs' } },
      { id: 'over_2hrs', label: 'More than 2 hours', tags: { screenTimeAmount: 'over_2hrs' } },
      { id: 'varies', label: 'It varies a lot', tags: { screenTimeAmount: 'varies' } },
    ],
  },

  {
    id: 'cond-screen-transition',
    type: 'single',
    stage: 'conditional',
    stageLabel: 'Building your plan',
    question: 'How do screen-time transitions usually go?',
    condition: (answers) =>
      answerIncludes(answers, 'main-pain', 'screen_time'),
    options: [
      { id: 'easy', label: 'Pretty easy', tags: { screenTransition: 'easy' } },
      { id: 'some_resistance', label: 'Some resistance', tags: { screenTransition: 'some_resistance' } },
      { id: 'often_emotional', label: 'Often emotional', tags: { screenTransition: 'often_emotional' } },
      { id: 'very_hard', label: 'Very hard — leads to meltdowns', tags: { screenTransition: 'very_hard' } },
    ],
  },

  {
    id: 'cond-bedtime',
    type: 'single',
    stage: 'conditional',
    stageLabel: 'Building your plan',
    question: 'What makes bedtime hardest?',
    condition: (answers) =>
      answerIncludes(answers, 'main-pain', 'bedtime') ||
      answerIs(answers, 'help-moment', 'bedtime'),
    options: [
      { id: 'wont_stop', label: 'Won\'t stop asking for water/stories', tags: { bedtimeChallenge: 'wont_stop' } },
      { id: 'scared', label: 'Scared of the dark or being alone', tags: { bedtimeChallenge: 'scared' } },
      { id: 'wont_stay', label: 'Won\'t stay in bed / keeps leaving', tags: { bedtimeChallenge: 'wont_stay' } },
      { id: 'overtired', label: 'Gets overtired and wired', tags: { bedtimeChallenge: 'overtired' } },
      { id: 'parent_tired', label: 'I\'m too tired to manage it calmly', tags: { bedtimeChallenge: 'parent_tired' } },
    ],
  },

  {
    id: 'cond-independent',
    type: 'single',
    stage: 'conditional',
    stageLabel: 'Building your plan',
    question: 'How long can your child usually play independently now?',
    condition: (answers) =>
      answerIncludes(answers, 'main-pain', 'independent_play'),
    options: [
      { id: 'under_1', label: 'Under 1 minute', tags: { independentDuration: 'under_1' } },
      { id: '1_3', label: '1–3 minutes', tags: { independentDuration: '1_3' } },
      { id: '3_5', label: '3–5 minutes', tags: { independentDuration: '3_5' } },
      { id: '5_10', label: '5–10 minutes', tags: { independentDuration: '5_10' } },
      { id: '10_plus', label: '10+ minutes', tags: { independentDuration: '10_plus' } },
    ],
  },

  {
    id: 'cond-multi-child',
    type: 'single',
    stage: 'conditional',
    stageLabel: 'Building your plan',
    question: 'Which child should we build the first plan for?',
    subtitle: 'We\'ll start with one and you can add more later.',
    condition: (answers) => answerIs(answers, 'age', 'multi'),
    options: [
      { id: '2', label: 'The 2-year-old', tags: { focusChild: '2' } },
      { id: '3', label: 'The 3-year-old', tags: { focusChild: '3' } },
      { id: '4', label: 'The 4-year-old', tags: { focusChild: '4' } },
      { id: '5', label: 'The 5-year-old', tags: { focusChild: '5' } },
      { id: '6', label: 'The 6-year-old', tags: { focusChild: '6' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage: preview — Mini preview, email, loading
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'mini-preview',
    type: 'preview',
    stage: 'preview',
    stageLabel: 'Your plan preview',
    text: 'Your plan is almost ready.',
    dynamicText: (answers) => {
      const age = getFirst(answers, 'age');
      const pain = getFirst(answers, 'main-pain');
      const moment = getFirst(answers, 'help-moment');
      const time = getFirst(answers, 'parent-time');

      const ageStr = AGE_DISPLAY_EN[age] ?? 'your child';
      const painStr = PAIN_DISPLAY_EN[pain] ?? 'your goals';
      const momentStr = MOMENT_DISPLAY_EN[moment] ?? 'your day';
      const timeStr = TIME_DISPLAY_EN[time] ?? 'flexible';

      return [
        `A 7-day plan for your ${ageStr}`,
        `Focused on ${painStr}`,
        `Best for ${momentStr}`,
        `With ${timeStr} activities`,
        'Plus parent scripts, backup ideas, and SOS support',
      ].join('\n');
    },
  },

  {
    id: 'loading',
    type: 'loading',
    stage: 'result',
    stageLabel: 'Your plan is ready',
    dynamicLoadingTexts: (answers) => {
      const age = getFirst(answers, 'age');
      const pain = getFirst(answers, 'main-pain');
      const moment = getFirst(answers, 'help-moment');
      const styles = answers['child-style'];
      const primaryStyle = Array.isArray(styles) ? styles[0] ?? '' : styles ?? '';
      const profileInfo = CHILD_STYLE_TO_PROFILE_EN[primaryStyle];

      const ageStr = AGE_DISPLAY_EN[age] ?? 'your child';
      const painStr = PAIN_DISPLAY_EN[pain] ?? 'your goals';
      const momentStr = MOMENT_DISPLAY_EN[moment] ?? 'your routine';
      const profileStr = profileInfo?.name ?? 'personalized';

      return [
        `Matching activities for a ${ageStr}...`,
        `Prioritizing ${painStr}...`,
        `Adapting for ${momentStr}...`,
        'Adding parent scripts and backup ideas...',
        `Building your ${profileStr} plan...`,
      ];
    },
    text: JSON.stringify([
      'Matching activities...',
      'Prioritizing your goals...',
      'Adding parent scripts...',
      'Building your plan...',
    ]),
  },
];
