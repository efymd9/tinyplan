// ── Strong Personalization Layer ────────────────────────────────────────────

import type { Locale } from '@/lib/i18n/config';

// ── "Why this fits" Copy ───────────────────────────────────────────────────

export function generateStrongWhyText(params: {
  goalDisplayText: string;
  profileDisplayName: string;
  bestMomentDisplay: string;
  planStyleDisplay: string;
  activityCategory?: string;
  activityBestFor?: string;
  mainPain?: string;
  activityTitle?: string;
  activityEnergyLevel?: string;
}): string {
  const {
    goalDisplayText,
    profileDisplayName,
    bestMomentDisplay,
    planStyleDisplay,
    activityCategory,
    activityBestFor,
    mainPain,
    activityTitle,
    activityEnergyLevel,
  } = params;

  // Build the "what the parent chose" opening
  const goalPhrase = goalDisplayText
    ? goalDisplayText.charAt(0).toLowerCase() + goalDisplayText.slice(1)
    : '';

  // Build the activity value phrase
  const categoryLabel = activityCategory
    ? CATEGORY_VALUE[activityCategory] ?? activityCategory
    : '';
  const bestForLabel = activityBestFor ?? '';

  // Build the timing phrase
  const timingPhrase = bestMomentDisplay
    ? `during ${bestMomentDisplay}`
    : '';

  // Choose a pattern based on what data is available
  if (mainPain && PAIN_CONTEXT[mainPain] && activityBestFor) {
    return `${PAIN_CONTEXT[mainPain]} This ${bestForLabel} activity is a gentle way to make ${bestMomentDisplay || 'your day'} feel easier.`;
  }

  if (goalPhrase && categoryLabel && timingPhrase) {
    return `You chose ${planStyleDisplay} and ${goalPhrase}. This ${categoryLabel} activity creates a moment of ${bestForLabel || 'meaningful play'} ${timingPhrase} without extra prep.`;
  }

  if (goalPhrase && bestForLabel) {
    return `You said ${goalPhrase} matters most. This activity is designed for ${bestForLabel}, fitting naturally into your ${bestMomentDisplay || 'day'}.`;
  }

  if (profileDisplayName && planStyleDisplay) {
    return `As a ${profileDisplayName}, you thrive with ${planStyleDisplay}. This activity leans into that strength and builds on what already works for your family.`;
  }

  // Activity-aware fallback — derive copy from the activity itself
  return deriveActivityFallbackWhy(activityTitle, activityEnergyLevel, activityCategory, bestMomentDisplay);
}

function deriveActivityFallbackWhy(
  title?: string,
  energyLevel?: string,
  category?: string,
  moment?: string,
): string {
  const energy = (energyLevel ?? '').toLowerCase();
  const cat = (category ?? '').toLowerCase();
  const t = (title ?? '').toLowerCase();

  if (energy === 'low' || t.includes('bedtime') || t.includes('calm') || t.includes('yoga')) {
    return `This is a low-energy activity designed to wind things down — perfect for evenings or when everyone needs a gentler pace.`;
  }

  if (t.includes('connection') || cat.includes('bonding') || t.includes('together') || t.includes('cuddle')) {
    return `This activity is built for real connection — a few quiet minutes together that your child will remember.`;
  }

  if (t.includes('independent') || t.includes('solo') || cat.includes('play')) {
    return `This activity helps your child play on their own so you can catch your breath — even five minutes counts.`;
  }

  if (energy === 'high' || cat.includes('physical') || cat.includes('movement') || t.includes('dance') || t.includes('jump')) {
    return `This is a high-energy activity that channels big feelings into big movement — great for burning off restlessness.`;
  }

  if (cat.includes('sensory') || t.includes('sensory') || t.includes('water') || t.includes('sand')) {
    return `Sensory play keeps little hands busy and minds focused — a calm-down strategy that doesn’t feel like one.`;
  }

  if (cat.includes('creative') || t.includes('draw') || t.includes('paint') || t.includes('craft')) {
    return `Creative play builds focus and self-expression — no perfect outcome needed, just the process.`;
  }

  if (cat.includes('outdoor') || t.includes('outside') || t.includes('garden') || t.includes('puddle')) {
    return `Getting outside shifts the mood fast — fresh air and open space do half the work for you.`;
  }

  if (moment) {
    return `Picked for ${moment} — a simple activity that fits the rhythm of your day without extra planning.`;
  }

  return `A simple, no-fuss activity designed to create a calm moment in your day — one small step is enough.`;
}

// ── Internal Maps ──────────────────────────────────────────────────────────

const CATEGORY_VALUE: Record<string, string> = {
  bonding: 'connection-building',
  cognitive: 'thinking and problem-solving',
  physical: 'active movement',
  language: 'language-rich',
  sensory: 'sensory exploration',
  outdoor: 'outdoor adventure',
  emotional: 'emotional awareness',
  creative: 'creative expression',
  routine: 'routine-anchoring',
};

const PAIN_CONTEXT: Record<string, string> = {
  screen_time:
    "Your family's hardest moment is when screens go off.",
  transitions:
    "Your family's trickiest moments are transitions between activities.",
  play_ideas:
    'You mentioned running out of play ideas during the week.',
  boredom:
    'You said boredom and restlessness are a challenge right now.',
  independent_play:
    'Getting independent play started is what you want to work on.',
  bedtime:
    'Bedtime is the moment that feels hardest right now.',
  connection:
    'Finding real connection time is what matters most to you.',
};

// ── "What to Notice" Observations ──────────────────────────────────────────

const ACTIVITY_OBSERVATIONS: Record<string, string[]> = {
  'fallback-blanket-fort': [
    'Did your child stay in the den longer than expected?',
    'Did they choose a book or invite you in?',
    'Did bedtime feel slightly calmer after the activity?',
  ],
  'fallback-bedtime-yoga': [
    'Did your child copy the poses or invent their own?',
    'Did their breathing slow down by the end?',
    'Did they ask to do it again tomorrow?',
  ],
  'fallback-treasure-hunt': [
    'Did your child lead the way or follow you?',
    'What did they choose to collect?',
    'Did they want to show someone their treasures?',
  ],
  'fallback-colour-sorting': [
    'Did they sort by colour or invent their own system?',
    'Did they play longer than expected?',
    'Did they try to re-sort or add new items?',
  ],
  'fallback-puppet-show': [
    'Did your child give the puppet a name or personality?',
    'Did they use the puppet to say something they wouldn\'t normally say?',
    'Did the puppet reappear later?',
  ],
  'fallback-puddle-splash': [
    'Did your child pour and stir independently?',
    'Did they test what floats and sinks?',
    'Did they resist coming inside?',
  ],
  'fallback-block-tower': [
    'Did they count the blocks as they stacked?',
    'How did they react when the tower fell?',
    'Did they try to beat their own record?',
  ],
};

const CATEGORY_OBSERVATIONS: Record<string, string[]> = {
  bonding: [
    'Did you notice a moment of genuine connection?',
    'Did your child seek closeness during the activity?',
    'Did the mood feel calmer afterwards?',
  ],
  cognitive: [
    'Did your child stay focused longer than usual?',
    'Did they try a different approach on their own?',
    'Did they want to do it again?',
  ],
  physical: [
    'Did your child move with more confidence than expected?',
    'Did they invent a new way to play with the movement?',
    'Did their energy feel more settled afterwards?',
  ],
  language: [
    'Did your child use a new word or phrase?',
    'Did they start narrating or retelling on their own?',
    'Did they ask you questions during the activity?',
  ],
  sensory: [
    'Did your child explore with more than one sense?',
    'Did they stay engaged longer than you expected?',
    'Did they seem calmer or more regulated after?',
  ],
  outdoor: [
    'Did your child notice something new outside?',
    'Did they want to stay out longer than planned?',
    'Did they bring something back to show you?',
  ],
  emotional: [
    'Did your child name a feeling during the activity?',
    'Did they seem more at ease after?',
    'Did they bring up the activity later in the day?',
  ],
  creative: [
    'Did your child surprise you with their idea?',
    'Did they want to keep going after the activity ended?',
    'Did they show their creation to someone else?',
  ],
  routine: [
    'Did the routine feel smoother than yesterday?',
    'Did your child anticipate the next step?',
    'Did they resist less than usual?',
  ],
};

const DEFAULT_OBSERVATIONS: string[] = [
  'Did your child seem engaged throughout?',
  'Did they want to keep going when it was time to stop?',
  'Did the activity feel manageable for you as a parent?',
];

export function generateWhatToNotice(
  activityId: string,
  category?: string,
): string[] {
  // Check for specific activity observations first
  if (ACTIVITY_OBSERVATIONS[activityId]) {
    return ACTIVITY_OBSERVATIONS[activityId];
  }

  // Fall back to category-based observations
  if (category && CATEGORY_OBSERVATIONS[category]) {
    return CATEGORY_OBSERVATIONS[category];
  }

  // Final fallback
  return DEFAULT_OBSERVATIONS;
}

// ── Hard Moment Display ────────────────────────────────────────────────────

const HARD_MOMENT_DISPLAY: Record<string, string> = {
  screen_time: 'Screen time endings',
  transitions: 'Tricky transitions',
  play_ideas: 'Running out of play ideas',
  boredom: 'Boredom and restlessness',
  independent_play: 'Getting independent play started',
  bedtime: 'Bedtime struggles',
  connection: 'Finding connection time',
};

const HARD_MOMENT_DISPLAY_ES: Record<string, string> = {
  screen_time: 'El fin del tiempo de pantalla',
  transitions: 'Transiciones difíciles',
  play_ideas: 'Quedarte sin ideas de juego',
  boredom: 'Aburrimiento e inquietud',
  independent_play: 'Lograr que empiece el juego independiente',
  bedtime: 'Las dificultades a la hora de dormir',
  connection: 'Encontrar tiempo de conexión',
};

export function getHardMomentDisplay(mainPain: string, locale: Locale = 'en'): string {
  const map = locale === 'es' ? HARD_MOMENT_DISPLAY_ES : HARD_MOMENT_DISPLAY;
  return map[mainPain] ?? mainPain.replace(/_/g, ' ');
}

// ── Adaptive Insights ──────────────────────────────────────────────────────

export interface AdaptiveInsight {
  noticed: string;
  whatWorked: string;
  whatFeltHard: string;
  nextAdjustment: string;
}

export function getEarlySignalLevel(feedbackCount: number): 'none' | 'early' | 'forming' | 'confident' {
  if (feedbackCount === 0) return 'none';
  if (feedbackCount === 1) return 'early';
  if (feedbackCount <= 3) return 'forming';
  return 'confident';
}

const STATUS_LABEL: Record<string, string> = {
  done: 'felt right',
  too_hard: 'too hard',
  too_easy: 'too easy',
  skipped: 'skipped',
  loved_it: 'loved it',
  went_well: 'went well',
  easy: 'easy',
  engaged: 'engaged',
  refused: 'refused',
  too_long: 'too long',
};

function firstFeedbackStatus(feedbackCounts: Record<string, number>): { status: string; label: string } {
  for (const [status, count] of Object.entries(feedbackCounts)) {
    if (count > 0 && status !== 'pending') {
      return { status, label: STATUS_LABEL[status] ?? status.replace(/_/g, ' ') };
    }
  }
  return { status: 'done', label: 'felt right' };
}

function firstFeedbackDayNumber(feedbackCounts: Record<string, number>): number {
  let total = 0;
  for (const count of Object.values(feedbackCounts)) {
    total += count;
  }
  return Math.min(total, 7);
}

function deriveFormingPattern(feedbackCounts: Record<string, number>): string {
  const positive = (feedbackCounts['loved_it'] ?? 0) +
    (feedbackCounts['went_well'] ?? 0) +
    (feedbackCounts['easy'] ?? 0) +
    (feedbackCounts['engaged'] ?? 0) +
    (feedbackCounts['done'] ?? 0);
  const negative = (feedbackCounts['too_hard'] ?? 0) +
    (feedbackCounts['skipped'] ?? 0) +
    (feedbackCounts['refused'] ?? 0) +
    (feedbackCounts['too_long'] ?? 0) +
    (feedbackCounts['too_easy'] ?? 0);

  if (positive > 0 && negative === 0) return 'everything is landing well so far';
  if (negative > 0 && positive === 0) return 'things have felt like a stretch so far';
  if (positive > negative) return 'more activities are working than not';
  if (negative > positive) return 'some activities need adjusting';
  return 'a mix of hits and misses';
}

export function generateAdaptiveInsight(
  feedbackCounts: Record<string, number>,
  goalDisplayText: string,
  bestMomentDisplay: string,
): AdaptiveInsight {
  const total = Object.values(feedbackCounts).reduce(
    (sum, n) => sum + n,
    0,
  );

  const level = getEarlySignalLevel(total);

  if (level === 'none') {
    return {
      noticed:
        "We'll start simple. After your first check-in, TinyPlan will adjust tomorrow's plan.",
      whatWorked:
        "Nothing logged yet -- try today's activity and let us know how it went.",
      whatFeltHard:
        "No challenges recorded yet. That's completely normal for week one.",
      nextAdjustment:
        "Your plan is based on your quiz answers. After a few days, we'll fine-tune it.",
    };
  }

  if (level === 'early') {
    const { status, label } = firstFeedbackStatus(feedbackCounts);
    const dayNum = firstFeedbackDayNumber(feedbackCounts);

    let workedText: string;
    let hardText: string;

    if (status === 'done' || status === 'loved_it' || status === 'went_well' || status === 'easy' || status === 'engaged') {
      workedText = "This suggests the activity pace and style match your family.";
      hardText = "Nothing felt too hard yet. That's a good early sign.";
    } else if (status === 'too_hard') {
      workedText = "We're still finding the right level. That first check-in helps a lot.";
      hardText = "That's useful to know. Tomorrow will be gentler.";
    } else if (status === 'too_easy') {
      workedText = "Good to know the bar can be higher. We'll add a bit more challenge.";
      hardText = "The activity felt too easy. We'll raise the level slightly.";
    } else if (status === 'skipped' || status === 'refused') {
      workedText = "Not every activity will land, and that's fine. We'll try a different approach.";
      hardText = "Your child wasn't feeling it. Tomorrow's activity will be different in style.";
    } else {
      workedText = "Your first check-in gives us a starting point to work from.";
      hardText = "We'll use this to fine-tune what comes next.";
    }

    return {
      noticed: `Early signal: You marked Day ${dayNum} as '${label}'. ${status === 'done' || status === 'loved_it' || status === 'went_well' ? "That's a strong start." : "That helps us calibrate."}`,
      whatWorked: workedText,
      whatFeltHard: hardText,
      nextAdjustment: "After 2 more check-ins, we'll start showing stronger patterns.",
    };
  }

  if (level === 'forming') {
    const pattern = deriveFormingPattern(feedbackCounts);
    const positive = (feedbackCounts['loved_it'] ?? 0) +
      (feedbackCounts['went_well'] ?? 0) +
      (feedbackCounts['easy'] ?? 0) +
      (feedbackCounts['engaged'] ?? 0) +
      (feedbackCounts['done'] ?? 0);
    const negative = (feedbackCounts['too_hard'] ?? 0) +
      (feedbackCounts['skipped'] ?? 0) +
      (feedbackCounts['refused'] ?? 0) +
      (feedbackCounts['too_long'] ?? 0) +
      (feedbackCounts['too_easy'] ?? 0);

    const workedText = positive > 0
      ? `The activities your child responded to suggest the overall direction is right.${bestMomentDisplay ? ` Activities ${bestMomentDisplay} seem promising.` : ''}`
      : "We haven't found a clear favourite yet, but we're narrowing it down.";

    const hardText = negative > 0
      ? `Some activities didn't click${feedbackCounts['too_hard'] ? ' -- a few felt too hard' : ''}${feedbackCounts['skipped'] ? ' -- some were skipped' : ''}. We're taking note.`
      : "Nothing has felt too hard so far. The pace seems right.";

    return {
      noticed: `Pattern forming: ${pattern}.`,
      whatWorked: workedText,
      whatFeltHard: hardText,
      nextAdjustment: "TinyPlan is learning what works for your family.",
    };
  }

  const positive = (feedbackCounts['loved_it'] ?? 0) +
    (feedbackCounts['went_well'] ?? 0) +
    (feedbackCounts['easy'] ?? 0) +
    (feedbackCounts['engaged'] ?? 0) +
    (feedbackCounts['done'] ?? 0);
  const negative = (feedbackCounts['too_hard'] ?? 0) +
    (feedbackCounts['skipped'] ?? 0) +
    (feedbackCounts['refused'] ?? 0) +
    (feedbackCounts['too_long'] ?? 0) +
    (feedbackCounts['too_easy'] ?? 0);

  if (negative === 0 && positive > 0) {
    return {
      noticed:
        `Your family is in a strong rhythm. ${bestMomentDisplay ? `Activities ${bestMomentDisplay} land especially well.` : 'The activities are consistently clicking.'}`,
      whatWorked:
        "Every activity has gone smoothly. Your child responds well to this pace and style.",
      whatFeltHard:
        "Nothing has felt too hard -- your plan is well-matched to your family.",
      nextAdjustment:
        "We'll keep this energy and introduce a bit more variety to build on the momentum.",
    };
  }

  if (positive === 0 && negative > 0) {
    return {
      noticed:
        "This week has been tough. That happens -- it doesn't mean anything is wrong.",
      whatWorked:
        "We haven't found the sweet spot yet, but every check-in narrows the search.",
      whatFeltHard:
        `Most activities felt like a stretch.${feedbackCounts['too_long'] ? ' Some ran too long.' : ''}${feedbackCounts['refused'] ? ' A few were refused.' : ''} That helps us recalibrate.`,
      nextAdjustment:
        `Next time will be shorter, lower-prep, and ${bestMomentDisplay ? bestMomentDisplay + '-friendly' : 'easier to fit in'}. We're dialling back to find what clicks.`,
    };
  }

  const workedParts: string[] = [];
  if (feedbackCounts['loved_it']) workedParts.push('some activities were a real hit');
  if (feedbackCounts['engaged']) workedParts.push('your child stayed engaged');
  if (feedbackCounts['easy']) workedParts.push('the prep level felt right');
  if (feedbackCounts['done']) workedParts.push('activities felt right');

  const hardParts: string[] = [];
  if (feedbackCounts['too_hard']) hardParts.push('some activities were too challenging');
  if (feedbackCounts['too_long']) hardParts.push('a few ran too long');
  if (feedbackCounts['skipped']) hardParts.push('some were skipped');
  if (feedbackCounts['refused']) hardParts.push('a few were refused');
  if (feedbackCounts['too_easy']) hardParts.push('some felt too easy');

  return {
    noticed:
      `Clear pattern this week: ${positive > negative ? 'more activities are landing well than not' : 'some activities click while others need adjusting'}.${bestMomentDisplay ? ` Activities ${bestMomentDisplay} work best.` : ''}`,
    whatWorked:
      workedParts.length > 0
        ? `What's working: ${workedParts.join(', ')}.`
        : 'A few activities went well -- we will build on those.',
    whatFeltHard:
      hardParts.length > 0
        ? `What to adjust: ${hardParts.join(', ')}.`
        : 'A couple of moments felt tricky, but nothing that can not be smoothed out.',
    nextAdjustment:
      `We'll lean into what's working${goalDisplayText ? ' -- ' + goalDisplayText.charAt(0).toLowerCase() + goalDisplayText.slice(1) : ''} -- and ease off on what felt like a stretch.`,
  };
}
