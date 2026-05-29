import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/magic-link';
import { getActivePlan, getTodayDayNumber } from '@/lib/dashboard/helpers';
import { getSkillByDay } from '@/data/parent-growth-path';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _LLM_SYSTEM_PROMPT = `You are TinyPlan Coach, a parent-facing assistant for play, routines, and calm moments.

Rules:
- Never claim to diagnose, treat, or cure anything
- Responses must be 5 short bullet points max
- Always give a ready-to-use parent phrase
- Always consider context: age range, play profile, goal, hard moment
- Always offer a fallback if the child resists
- If the request is medical or dangerous, gently suggest consulting a professional
- Tone: calm, supportive, realistic. No guilt. No shaming.
- Format: Do this first / What to say / What not to do / Tiny action / Adjust tomorrow`;

interface ChatResponse {
  doFirst: string;
  whatToSay: string;
  whatNotToDo: string;
  tinyAction: string;
  adjustPlan: string;
  todayParentSkill?: string | null;
}

interface Clarifications {
  trigger?: string;
  childState?: string;
}

const SAFETY_KEYWORDS = [
  'harm',
  'hurt self',
  'suicide',
  'emergency',
  'abuse',
  'danger',
  'hospital',
];

const SAFETY_RESPONSE: ChatResponse = {
  doFirst:
    "Take a breath. It sounds like things might be really difficult right now.",
  whatToSay:
    "It is okay to ask for help. You do not need to handle this alone.",
  whatNotToDo:
    "Do not try to solve everything by yourself in this moment.",
  tinyAction:
    "Please reach out to a professional or contact your local emergency services or a crisis helpline.",
  adjustPlan:
    "TinyPlan is here for everyday parenting moments. For serious concerns, please speak with a healthcare professional.",
};

interface CategoryTemplate {
  keywords: string[];
  response: ChatResponse;
  triggered: ChatResponse;
  escalated: ChatResponse;
}

function buildClarified(base: ChatResponse, clarifications: Clarifications): ChatResponse {
  const triggerMap: Record<string, string> = {
    'screen time ended': 'Since this started after screen time ended, the transition is the hard part.',
    'bedtime started': 'Bedtime transitions are tough. The tiredness is making everything bigger.',
    'I said no': 'Hearing "no" triggered this. That boundary was the right call.',
    'time to leave': 'Leaving is hard when they are not ready. The transition needs a bridge.',
    'sibling conflict': 'Sibling moments are intense. Both children need to feel seen.',
    'not sure': 'Sometimes it comes out of nowhere. That is completely normal.',
  };

  const stateMap: Record<string, string> = {
    'no, very upset': 'They cannot hear you yet. Start with your calm presence only.',
    'a little': 'They are starting to come back. Keep your voice low and slow.',
    'yes, calming down': 'Good, they can listen now. This is the moment to connect.',
    'it already passed': 'The storm has passed. Now is perfect for a gentle reconnect.',
  };

  const result = { ...base };

  if (clarifications.trigger && triggerMap[clarifications.trigger]) {
    result.doFirst = triggerMap[clarifications.trigger] + ' ' + result.doFirst;
  }

  if (clarifications.childState && stateMap[clarifications.childState]) {
    result.whatToSay = stateMap[clarifications.childState] + ' ' + result.whatToSay;
  }

  return result;
}

const CATEGORIES: CategoryTemplate[] = [
  {
    keywords: ['screen', 'tablet', 'phone', 'tv', 'watch', 'ipad', 'video', 'youtube'],
    response: {
      doFirst: "Stay calm and get close. Kneel down to their eye level before saying anything.",
      whatToSay: "You really wanted more screen time. Stopping is hard. The tablet is going to rest now.",
      whatNotToDo: "Do not grab the device away suddenly or raise your voice about it.",
      tinyAction: "Let them press the power button themselves. Say: 'You turn it off when you are ready.'",
      adjustPlan: "Tomorrow's activity will be screen-free and hands-on to ease the transition.",
    },
    triggered: {
      doFirst: "Stay calm and get close. The transition away from screens is always the hardest part.",
      whatToSay: "You really wanted more screen time. I get it. The tablet is going to rest now.",
      whatNotToDo: "Do not grab the device or bargain with more minutes. Hold the boundary quietly.",
      tinyAction: "Let them press the power button themselves. One small choice eases the shift.",
      adjustPlan: "Consider making tomorrow's first activity something tactile to replace the screen habit.",
    },
    escalated: {
      doFirst: "They cannot process words yet. Sit nearby, breathe slowly, and wait.",
      whatToSay: "When they are calmer: 'That was really hard. I am right here.'",
      whatNotToDo: "Do not lecture about screen time rules while they are still upset.",
      tinyAction: "Offer water or a cold cloth. Physical comfort first, conversation later.",
      adjustPlan: "Tomorrow, try a 2-minute warning before screen time ends to soften the transition.",
    },
  },
  {
    keywords: ['bed', 'sleep', 'night', 'bedtime', 'tired', "won't sleep"],
    response: {
      doFirst: "Lower the lights and slow your own movements down. Your calm sets the pace.",
      whatToSay: "You do not want the day to end. I understand. Let us pick one last cosy thing.",
      whatNotToDo: "Do not add extra steps or negotiate more activities. Keep the boundary gentle but firm.",
      tinyAction: "Try: 'Close your eyes and tell me three fun things we did today.'",
      adjustPlan: "Consider a calmer pre-bedtime activity tomorrow to make the wind-down easier.",
    },
    triggered: {
      doFirst: "Dim everything and speak in almost a whisper. Mirror the calm you want them to feel.",
      whatToSay: "Your body is tired even if your brain is not. Let us help your body rest.",
      whatNotToDo: "Do not threaten consequences about not sleeping. It adds stress to an already hard moment.",
      tinyAction: "Lie beside them and breathe slowly and audibly. Bodies sync up.",
      adjustPlan: "Move tomorrow's active play earlier so the evening wind-down starts more naturally.",
    },
    escalated: {
      doFirst: "They are overtired and flooded. Reduce all stimulation. Dim, quiet, still.",
      whatToSay: "When they pause: 'I am right here. You are safe. We are just resting.'",
      whatNotToDo: "Do not try to reason about why sleep matters. Their brain cannot process that now.",
      tinyAction: "Gentle pressure: a weighted blanket, a firm hug, or hold their feet gently.",
      adjustPlan: "Start the bedtime routine 15 minutes earlier tomorrow to avoid the overtired tipping point.",
    },
  },
  {
    keywords: [
      'cry',
      'scream',
      'angry',
      'upset',
      'tantrum',
      'hitting',
      'throwing',
      'meltdown',
      'frustrated',
      'crying',
      'refuse',
      "won't",
    ],
    response: {
      doFirst: "Get low, get close, get quiet. Your calm is the anchor they need right now.",
      whatToSay: "You are having some really big feelings right now. I am right here with you.",
      whatNotToDo: "Do not try to reason, explain, or fix it while the wave is still crashing.",
      tinyAction: "Offer: 'Do you want a hug or some space?' Then follow their lead.",
      adjustPlan: "Want me to make tomorrow's activity shorter and calmer?",
    },
    triggered: {
      doFirst: "Get low and stay nearby. Do not try to talk yet, just be a calm presence.",
      whatToSay: "When there is a pause: 'That was a big feeling. I am not going anywhere.'",
      whatNotToDo: "Do not ask them to use words or explain what happened while they are still flooded.",
      tinyAction: "Match their breathing. Take slow, visible breaths they can mirror unconsciously.",
      adjustPlan: "Tomorrow, start with a sensory activity that helps them regulate before anything else.",
    },
    escalated: {
      doFirst: "Safety first. Move objects away, create space, and protect without restraining.",
      whatToSay: "Say very little. If anything: 'I am here. You are safe.' Repeat like a mantra.",
      whatNotToDo: "Do not raise your voice to match theirs. Do not punish during the meltdown.",
      tinyAction: "Offer something cold: ice cube, cold cloth, a sip of water. It interrupts the stress cycle.",
      adjustPlan: "Keep tomorrow very low-demand. One simple, familiar activity they already enjoy.",
    },
  },
  {
    keywords: ['no', 'cooperate', 'defiant', 'fight'],
    response: {
      doFirst: "Pause before reacting. Take one slow breath to reset your own nervous system.",
      whatToSay: "You really do not want to do this right now. I hear you.",
      whatNotToDo: "Do not repeat the instruction louder. Volume does not create cooperation.",
      tinyAction: "Offer two small choices instead of one demand: 'Red shirt or blue shirt?'",
      adjustPlan: "Tomorrow's activity will include more choices from the start.",
    },
    triggered: {
      doFirst: "This is a power struggle. Step sideways instead of pushing forward.",
      whatToSay: "I can see you want to decide for yourself. Let us find a way that works.",
      whatNotToDo: "Do not make it a battle of wills. Nobody wins those.",
      tinyAction: "Make it playful: 'I bet I can put my shoes on before you can.'",
      adjustPlan: "Build choice into the first step of tomorrow's activity so they feel in control early.",
    },
    escalated: {
      doFirst: "The defiance has escalated. Pause everything. You can come back to the task later.",
      whatToSay: "We do not have to do this right now. Let us take a break together.",
      whatNotToDo: "Do not follow them around repeating the request. Give space.",
      tinyAction: "Change the environment: go outside, move to a different room, shift the energy.",
      adjustPlan: "Tomorrow, let them pick the activity from two options you pre-select.",
    },
  },
  {
    keywords: [
      'overwhelmed',
      'exhausted',
      "can't",
      'break',
      'tired parent',
      'alone',
      'feeling overwhelmed',
    ],
    response: {
      doFirst: "Pause. You are allowed to take a moment before you respond to anything.",
      whatToSay: "Tell your child: 'I need a tiny break. I will be right back.' Then step away for 60 seconds.",
      whatNotToDo: "Do not push through when you are running on empty. That is how snapping happens.",
      tinyAction: "Put on an audiobook or give them a simple sensory task for 5 minutes while you breathe.",
      adjustPlan: "Tomorrow will be lower-prep so you have more breathing room.",
    },
    triggered: {
      doFirst: "You are running low. That is not a failure, it is information. Pause.",
      whatToSay: "To your child: 'Let us both take a rest.' To yourself: 'This is temporary.'",
      whatNotToDo: "Do not try to be patient through gritted teeth. Real breaks beat fake calm.",
      tinyAction: "Set a 5-minute timer. They do a quiet task, you sit and breathe. That counts.",
      adjustPlan: "Simplify tomorrow to one low-effort, high-connection activity.",
    },
    escalated: {
      doFirst: "You need support right now, not more strategies. It is okay.",
      whatToSay: "To your child: 'We are going to do something very quiet together for a little while.'",
      whatNotToDo: "Do not beat yourself up. Every parent hits this wall. You are not failing.",
      tinyAction: "Call someone: a partner, friend, or neighbour. Even a 10-minute tag-out helps.",
      adjustPlan: "Tomorrow, consider skipping the structured plan entirely. Free play is enough.",
    },
  },
  {
    keywords: ['quick', 'fast', 'bored', 'what to do', '3 min', '5 min', 'idea'],
    response: {
      doFirst: "Grab 3 items from the kitchen: a spoon, a cup, and a towel. That is your toolkit.",
      whatToSay: "Let us find something fun in the next 30 seconds. Ready?",
      whatNotToDo: "Do not overthink it. The simplest ideas usually land the best.",
      tinyAction: "Start playing with the items yourself. Curiosity usually wins them over.",
      adjustPlan: "Your plan already includes quick versions of each activity.",
    },
    triggered: {
      doFirst: "Look around the room. Pick up the nearest safe object. That is now a toy.",
      whatToSay: "I wonder what this could be? A hat? A boat? What do you think?",
      whatNotToDo: "Do not scroll for ideas. Use what is in front of you right now.",
      tinyAction: "Start a 3-item scavenger hunt: find something soft, something round, something blue.",
      adjustPlan: "Add a 'boredom jar' to your routine: pre-written activity ideas they can pull out.",
    },
    escalated: {
      doFirst: "Boredom turned into frustration. Redirect with movement first.",
      whatToSay: "Let us shake it out! Jump 5 times, spin around, then freeze.",
      whatNotToDo: "Do not offer a screen to solve the boredom. It resets the cycle.",
      tinyAction: "Fill a bowl with water and give them cups, spoons, and a towel. Instant activity.",
      adjustPlan: "Tomorrow, prep one 'grab and go' activity bag so you are ready for these moments.",
    },
  },
];

const DEFAULT_RESPONSE: ChatResponse = {
  doFirst:
    "Take a breath. You are already doing something good by asking for help.",
  whatToSay:
    "Try naming what you see: 'I notice you are feeling...' and wait for them.",
  whatNotToDo:
    "Do not try to fix the feeling. Just be with it.",
  tinyAction:
    "Offer a simple choice or a change of scenery. Movement helps.",
  adjustPlan:
    "Check your SOS cards for specific situations.",
};

function containsSafetyKeyword(message: string): boolean {
  const lower = message.toLowerCase();
  return SAFETY_KEYWORDS.some((kw) => lower.includes(kw));
}

function matchCategory(message: string, clarifications?: Clarifications): ChatResponse {
  const lower = message.toLowerCase();
  for (const category of CATEGORIES) {
    if (category.keywords.some((kw) => lower.includes(kw))) {
      if (clarifications) {
        const isEscalated = clarifications.childState === 'no, very upset';
        const base = isEscalated ? category.escalated : category.triggered;
        return buildClarified(base, clarifications);
      }
      return category.response;
    }
  }

  if (clarifications) {
    return buildClarified(DEFAULT_RESPONSE, clarifications);
  }

  return DEFAULT_RESPONSE;
}

async function getTodayParentSkill(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    const plan = getActivePlan(user.id);
    if (!plan) return null;
    const dayNum = getTodayDayNumber(plan.created_at ?? Date.now());
    const skill = getSkillByDay(dayNum);
    if (!skill) return null;
    return `${skill.title} — "${skill.scripts[0]}"`;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, clarifications } = body as {
      message?: string;
      clarifications?: Clarifications;
    };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "message" field' },
        { status: 400 }
      );
    }

    if (containsSafetyKeyword(message)) {
      return NextResponse.json({ response: SAFETY_RESPONSE });
    }

    const [baseResponse, todayParentSkill] = await Promise.all([
      Promise.resolve(matchCategory(message, clarifications)),
      getTodayParentSkill(),
    ]);

    const response: ChatResponse = { ...baseResponse, todayParentSkill };

    return NextResponse.json({ response });
  } catch (err) {
    console.error('[API /chat] Error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
