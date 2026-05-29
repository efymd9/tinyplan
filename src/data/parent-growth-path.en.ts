import type { ParentSkill } from "./parent-growth-path";

export const GROWTH_PATH_EN: ParentSkill[] = [
  {
    id: "small-control",
    dayNumber: 1,
    title: "Small Control",
    playMomentTitle: "Tiny City Choices",
    whenToUse:
      "Use this when your child is upset because something can't happen or plans changed.",
    whatYouPractice:
      "You are not trying to fix the whole feeling. You are helping your child find one tiny part they can still choose.",
    steps: [
      'Name the limit: "The park is closed today."',
      'Name the feeling: "You really wanted to go. That\'s disappointing."',
      'Offer two small choices: "Do you want to build a park at home or take a short walk?"',
    ],
    scripts: [
      "We can't change that part. What can we choose now?",
      "You can choose the blanket or the pillow.",
      "Do you want me close or a little space?",
      "We can't do that right now. You get to pick what's next.",
    ],
    examples: [
      "The park is closed: offer two at-home alternatives.",
      "Snack time ended: offer which cup to use for water.",
      "Sibling took a toy: offer which game to start instead.",
    ],
    avoid:
      "Do not offer ten choices. Do not explain too much while your child is very upset.",
    tinyWin:
      "If your child chooses one small next step or calms even a little, that counts.",
    realLifePractice:
      "Use Small Control once today when something doesn't go your child's way — at snack, transition, or bedtime.",
    backup:
      "If your child refuses both choices, say: \"Okay. I'll stay close. We'll choose when your body is ready.\"",
    tags: ["transitions", "meltdown", "bedtime", "snack", "control"],
    accent: "play",
  },
  {
    id: "predictable-start",
    dayNumber: 2,
    title: "Predictable Start",
    playMomentTitle: "First-Then Adventure",
    whenToUse:
      "Use this before an activity, transition, bedtime step, or any moment that often turns chaotic.",
    whatYouPractice:
      "You are making the next few minutes visible so your child does not have to guess what is coming.",
    steps: [
      "Say what happens first.",
      "Say what happens next.",
      "Say how it ends.",
    ],
    scripts: [
      "First we build, then we read, then we're done.",
      "First shoes, then door, then car.",
      "First two blocks, then you choose what happens next.",
      "First bath, then book, then sleep.",
    ],
    examples: [
      "Before leaving the house: first shoes, then coat, then door.",
      "Before bedtime: first bath, then one book, then lights out.",
      "Before a screen-time transition: first five more minutes, then off, then snack.",
    ],
    avoid: "Do not give a long list. Keep it to first, then, done.",
    tinyWin:
      "If your child understands the next step faster than usual, that counts.",
    realLifePractice:
      "Pick one daily transition — morning, bedtime, or leaving — and try First/Then/Done just once.",
    backup:
      'If your child is already upset, say: "I know this part is hard. First we finish this, then you get a break."',
    tags: ["transitions", "routine", "bedtime", "morning", "predictability"],
    accent: "sage",
  },
  {
    id: "name-before-fixing",
    dayNumber: 3,
    title: "Name Before Fixing",
    playMomentTitle: "Feeling Detective",
    whenToUse:
      "Use this when your child is frustrated, disappointed, jealous, tired, or overwhelmed.",
    whatYouPractice:
      "Before solving the problem, you help your child feel seen. Naming the feeling lowers pressure and makes cooperation easier.",
    steps: [
      "Notice the emotion.",
      "Name it simply.",
      "Wait one beat before offering a solution.",
    ],
    scripts: [
      "That felt really frustrating.",
      "You wanted it to go differently.",
      "I can see this is a big feeling.",
      "You're disappointed. That makes sense.",
    ],
    examples: [
      "Child drops toy and cries: name disappointment before replacing it.",
      "Child is jealous of sibling's turn: name the feeling before redirecting.",
      "Child refuses transition: name the resistance before explaining the plan.",
    ],
    avoid:
      'Do not rush into "it\'s okay" or "just do this". The feeling needs a name before a fix.',
    tinyWin:
      "If your child pauses, looks at you, or softens even briefly, that counts.",
    realLifePractice:
      "Today, try to name one feeling before offering a fix — even just once, at any moment of the day.",
    backup:
      'If your child escalates, get quieter: "I\'m not going anywhere. I\'m right here."',
    tags: ["emotions", "meltdown", "frustration", "empathy", "connection"],
    accent: "lavender",
  },
  {
    id: "say-less-show-more",
    dayNumber: 4,
    title: "Say Less, Show More",
    playMomentTitle: "Copy Me Mission",
    whenToUse:
      "Use this when your child gets stuck, ignores instructions, or becomes overwhelmed by too many words.",
    whatYouPractice:
      "You reduce language and make the action easier to copy.",
    steps: [
      "Use one short phrase.",
      "Show the action with your body or hands.",
      "Let your child copy, change, or join in their own way.",
    ],
    scripts: [
      "Watch me.",
      "Your turn.",
      "Just one.",
      "Like this.",
    ],
    examples: [
      "Child won't tidy up: silently start putting one block away and wait.",
      "Child ignores instructions at dinner: sit down yourself and begin eating quietly.",
      "Child is overwhelmed by an art project: pick up one crayon and draw one line.",
    ],
    avoid:
      "Do not repeat the same instruction louder. Make it smaller and visible instead.",
    tinyWin: "If your child copies one tiny action, that counts.",
    realLifePractice:
      "Find one moment today where you'd normally repeat a verbal instruction — and try showing instead.",
    backup:
      'If your child still ignores: reduce further. One object. One step. Say: "I\'ll start. You join when ready."',
    tags: ["cooperation", "instructions", "modeling", "behavior", "transitions"],
    accent: "yellow",
  },
  {
    id: "start-smaller",
    dayNumber: 5,
    title: "Start Smaller",
    playMomentTitle: "One Tiny Step",
    whenToUse:
      'Use this when your child refuses, freezes, says "no", or loses interest quickly.',
    whatYouPractice:
      "You lower the entry point so joining feels easy, not demanding.",
    steps: [
      "Make the task smaller.",
      "Invite one tiny action.",
      "Stop before it becomes a battle.",
    ],
    scripts: [
      "You don't have to do the whole thing. Just choose one piece.",
      "Can you put one block here?",
      "Let's try for one minute.",
      "Just one. That's enough.",
    ],
    examples: [
      "Child refuses to draw: offer just one line, not a picture.",
      "Child won't leave the playground: ask them to touch the gate first.",
      "Child doesn't want to tidy: ask them to find just one sock.",
    ],
    avoid:
      "Do not turn the activity into a test. The goal is joining, not completing.",
    tinyWin: "If your child does one small part, the plan worked.",
    realLifePractice:
      "When you hit resistance today, try reducing the ask by 80% — and stop as soon as they join.",
    backup:
      'If your child still refuses: step back entirely. Say: "That\'s okay. I\'ll be here when you\'re ready."',
    tags: ["refusal", "transitions", "cooperation", "resistance", "flexibility"],
    accent: "sage",
  },
  {
    id: "calm-boundary",
    dayNumber: 6,
    title: "Calm Boundary",
    playMomentTitle: "Stop-Go Ritual",
    whenToUse:
      "Use this when the answer is no, screen time is over, bedtime starts, or it is time to leave.",
    whatYouPractice: "You hold the boundary with fewer words and a calmer body.",
    steps: [
      "Say the boundary once.",
      "Acknowledge the feeling.",
      "Offer the next small action.",
    ],
    scripts: [
      "The screen is done.",
      "You really wanted more.",
      "You can choose: blanket den or snack helper.",
      "I understand. The answer is still no.",
    ],
    examples: [
      "Screen time ends: state it once, don't argue, offer one next choice.",
      "Bedtime resistance: say the limit, name the feeling, ask about book or song.",
      "Leaving the park: give one warning, hold the limit, offer what happens next.",
    ],
    avoid:
      "Do not debate the boundary after it is set. Repeat calmly if needed.",
    tinyWin:
      "If you stay calmer than usual, that counts even if your child is still upset.",
    realLifePractice:
      "Choose one boundary moment today — screen, food, bedtime — and try holding it with fewer words.",
    backup:
      'If your child escalates: get quieter, not louder. Say: "I know. It\'s still the rule. I\'m staying close."',
    tags: ["boundaries", "screen-time", "bedtime", "refusal", "transitions"],
    accent: "play",
  },
  {
    id: "repair-and-repeat",
    dayNumber: 7,
    title: "Repair & Repeat",
    playMomentTitle: "Tiny Win Map",
    whenToUse:
      "Use this at the end of the week or after a hard moment that did not go perfectly.",
    whatYouPractice:
      "You notice what worked and repair what felt messy without shame.",
    steps: [
      "Name one thing that worked.",
      "Name one thing that was hard.",
      "Choose one thing to repeat next week.",
    ],
    scripts: [
      "That was hard, and we came back.",
      "One thing worked: we started smaller.",
      "Tomorrow we can try the short version.",
      "I'm proud of us for trying.",
    ],
    examples: [
      "Bedtime went smoother after using First/Then — repeat it next week.",
      "The meltdown was hard, but naming the feeling helped — keep that.",
      "Tidy-up battle: starting smaller worked once — build on it.",
    ],
    avoid: "Do not score the week as success/failure. Look for patterns.",
    tinyWin:
      "If you can name one repeatable tool, the week succeeded.",
    realLifePractice:
      "Before bed tonight, write or say one thing that worked this week. That's your starting point.",
    backup:
      'If the week felt too hard: say "We tried. That counts." and pick one gentler thing to carry forward.',
    tags: ["reflection", "repair", "pattern", "weekly-checkin", "growth"],
    accent: "yellow",
  },
];
