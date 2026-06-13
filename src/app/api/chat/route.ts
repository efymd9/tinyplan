import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/magic-link';
import { getActivePlan, getTodayDayNumber } from '@/lib/dashboard/helpers';
import { getSkillByDay } from '@/data/parent-growth-path';
import { resolveLocale, type Locale } from '@/lib/i18n/config';
import { checkRateLimit } from '@/lib/rate-limit';

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

// Matched against the input regardless of UI language, so a Spanish parent
// typing crisis words still triggers the safety response (and vice versa).
const SAFETY_KEYWORDS_EN = [
  'harm',
  'hurt self',
  'suicide',
  'emergency',
  'abuse',
  'danger',
  'hospital',
];

const SAFETY_KEYWORDS_ES = [
  'daño',
  'suicidio',
  'suicidarse',
  'emergencia',
  'abuso',
  'peligro',
  'hospital',
  'lastimar',
  'herir',
  'matar',
];

const SAFETY_KEYWORDS = [...SAFETY_KEYWORDS_EN, ...SAFETY_KEYWORDS_ES];

const SAFETY_RESPONSE: Record<Locale, ChatResponse> = {
  en: {
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
  },
  es: {
    doFirst:
      "Respira. Parece que las cosas podrían estar muy difíciles en este momento.",
    whatToSay:
      "Está bien pedir ayuda. No tienes que manejar esto sola.",
    whatNotToDo:
      "No intentes resolverlo todo por tu cuenta en este momento.",
    tinyAction:
      "Por favor, busca a un profesional o contacta a los servicios de emergencia de tu zona o a una línea de ayuda en crisis.",
    adjustPlan:
      "TinyPlan está aquí para los momentos cotidianos de la crianza. Para temas serios, por favor habla con un profesional de la salud.",
  },
};

interface CategoryTemplate {
  keywords: string[];
  response: ChatResponse;
  triggered: ChatResponse;
  escalated: ChatResponse;
}

function buildClarified(
  base: ChatResponse,
  clarifications: Clarifications,
  locale: Locale,
): ChatResponse {
  const triggerMap: Record<Locale, Record<string, string>> = {
    en: {
      'screen time ended': 'Since this started after screen time ended, the transition is the hard part.',
      'bedtime started': 'Bedtime transitions are tough. The tiredness is making everything bigger.',
      'I said no': 'Hearing "no" triggered this. That boundary was the right call.',
      'time to leave': 'Leaving is hard when they are not ready. The transition needs a bridge.',
      'sibling conflict': 'Sibling moments are intense. Both children need to feel seen.',
      'not sure': 'Sometimes it comes out of nowhere. That is completely normal.',
    },
    // ES keys match the localized option strings the client sends (see ask-tinyplan.tsx triggerOptions).
    es: {
      'se acabó la pantalla': 'Como esto empezó después de terminar el tiempo de pantalla, la transición es la parte difícil.',
      'empezó la hora de dormir': 'Las transiciones a la hora de dormir son difíciles. El cansancio hace que todo se sienta más grande.',
      'le dije que no': 'Escuchar un "no" lo desencadenó. Ese límite fue la decisión correcta.',
      'hora de salir': 'Irse es difícil cuando no están listos. La transición necesita un puente.',
      'conflicto entre hermanos': 'Los momentos entre hermanos son intensos. Ambos peques necesitan sentirse vistos.',
      'no estoy seguro': 'A veces surge de la nada. Eso es completamente normal.',
    },
  };

  const stateMap: Record<Locale, Record<string, string>> = {
    en: {
      'no, very upset': 'They cannot hear you yet. Start with your calm presence only.',
      'a little': 'They are starting to come back. Keep your voice low and slow.',
      'yes, calming down': 'Good, they can listen now. This is the moment to connect.',
      'it already passed': 'The storm has passed. Now is perfect for a gentle reconnect.',
    },
    // ES keys match the localized option strings the client sends (see ask-tinyplan.tsx childStateOptions).
    es: {
      'no, muy alterado(a)': 'Todavía no pueden escucharte. Empieza solo con tu presencia tranquila.',
      'un poco': 'Están empezando a volver. Mantén tu voz baja y pausada.',
      'sí, calmándose': 'Bien, ya pueden escuchar. Este es el momento de conectar.',
      'ya pasó': 'La tormenta pasó. Ahora es perfecto para una reconexión suave.',
    },
  };

  const result = { ...base };

  if (clarifications.trigger && triggerMap[locale][clarifications.trigger]) {
    result.doFirst = triggerMap[locale][clarifications.trigger] + ' ' + result.doFirst;
  }

  if (clarifications.childState && stateMap[locale][clarifications.childState]) {
    result.whatToSay = stateMap[locale][clarifications.childState] + ' ' + result.whatToSay;
  }

  return result;
}

const CATEGORIES: Record<Locale, CategoryTemplate[]> = {
  en: [
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
  ],
  es: [
    {
      keywords: ['screen', 'tablet', 'phone', 'tv', 'watch', 'ipad', 'video', 'youtube', 'pantalla', 'tableta', 'tele', 'celular', 'teléfono'],
      response: {
        doFirst: "Mantén la calma y acércate. Ponte a la altura de sus ojos antes de decir nada.",
        whatToSay: "De verdad querías más tiempo de pantalla. Parar es difícil. La tablet va a descansar ahora.",
        whatNotToDo: "No le quites el dispositivo de golpe ni levantes la voz por eso.",
        tinyAction: "Deja que aprete el botón de apagado. Dile: 'Tú la apagas cuando estés listo.'",
        adjustPlan: "La actividad de mañana será sin pantallas y con las manos para suavizar la transición.",
      },
      triggered: {
        doFirst: "Mantén la calma y acércate. La transición fuera de las pantallas siempre es la parte más difícil.",
        whatToSay: "De verdad querías más tiempo de pantalla. Te entiendo. La tablet va a descansar ahora.",
        whatNotToDo: "No le quites el dispositivo ni negocies más minutos. Sostén el límite con calma.",
        tinyAction: "Deja que aprete el botón de apagado. Una pequeña decisión suaviza el cambio.",
        adjustPlan: "Considera que la primera actividad de mañana sea algo táctil que reemplace el hábito de la pantalla.",
      },
      escalated: {
        doFirst: "Todavía no puede procesar palabras. Siéntate cerca, respira despacio y espera.",
        whatToSay: "Cuando esté más tranquilo: 'Eso fue muy difícil. Estoy aquí contigo.'",
        whatNotToDo: "No le des un sermón sobre las reglas de las pantallas mientras sigue alterado.",
        tinyAction: "Ofrécele agua o un paño frío. Primero el consuelo físico, la conversación después.",
        adjustPlan: "Mañana, prueba avisar 2 minutos antes de que termine el tiempo de pantalla para suavizar la transición.",
      },
    },
    {
      keywords: ['bed', 'sleep', 'night', 'bedtime', 'tired', "won't sleep", 'dormir', 'cama', 'noche', 'sueño', 'cansado', 'cansada', 'siesta'],
      response: {
        doFirst: "Baja las luces y haz tus propios movimientos más lentos. Tu calma marca el ritmo.",
        whatToSay: "No quieres que el día termine. Lo entiendo. Elijamos una última cosa acogedora.",
        whatNotToDo: "No agregues pasos extra ni negocies más actividades. Mantén el límite suave pero firme.",
        tinyAction: "Prueba: 'Cierra los ojos y cuéntame tres cosas divertidas que hicimos hoy.'",
        adjustPlan: "Considera una actividad más tranquila antes de dormir mañana para que la calma llegue más fácil.",
      },
      triggered: {
        doFirst: "Atenúa todo y habla casi en un susurro. Refleja la calma que quieres que sienta.",
        whatToSay: "Tu cuerpo está cansado aunque tu mente no lo esté. Ayudemos a tu cuerpo a descansar.",
        whatNotToDo: "No amenaces con consecuencias por no dormir. Le suma estrés a un momento ya difícil.",
        tinyAction: "Recuéstate a su lado y respira despacio y audible. Los cuerpos se sincronizan.",
        adjustPlan: "Adelanta el juego activo de mañana para que la calma de la noche empiece de forma más natural.",
      },
      escalated: {
        doFirst: "Está sobrecansado y desbordado. Reduce todos los estímulos. Penumbra, silencio, quietud.",
        whatToSay: "Cuando haga una pausa: 'Estoy aquí. Estás a salvo. Solo estamos descansando.'",
        whatNotToDo: "No intentes razonar sobre por qué importa dormir. Su cerebro no puede procesar eso ahora.",
        tinyAction: "Presión suave: una manta pesada, un abrazo firme o sostén sus pies con suavidad.",
        adjustPlan: "Empieza la rutina de dormir 15 minutos antes mañana para evitar el punto de sobrecansancio.",
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
        'berrinche',
        'llanto',
        'llora',
        'llorando',
        'grita',
        'gritando',
        'enojado',
        'enojada',
        'enfadado',
        'rabieta',
        'pega',
        'pegando',
        'tira',
        'frustrado',
        'frustrada',
        'alterado',
        'alterada',
        'se niega',
        'niega',
      ],
      response: {
        doFirst: "Ponte a su altura, acércate y guarda silencio. Tu calma es el ancla que necesita ahora.",
        whatToSay: "Estás sintiendo emociones muy grandes en este momento. Estoy aquí contigo.",
        whatNotToDo: "No intentes razonar, explicar ni arreglarlo mientras la ola sigue rompiendo.",
        tinyAction: "Ofrécele: '¿Quieres un abrazo o un poco de espacio?' Luego sigue su ritmo.",
        adjustPlan: "¿Quieres que haga la actividad de mañana más corta y tranquila?",
      },
      triggered: {
        doFirst: "Ponte a su altura y quédate cerca. No intentes hablar todavía, solo sé una presencia tranquila.",
        whatToSay: "Cuando haya una pausa: 'Eso fue una emoción muy grande. No me voy a ningún lado.'",
        whatNotToDo: "No le pidas que use palabras ni que explique qué pasó mientras sigue desbordado.",
        tinyAction: "Acompaña su respiración. Respira lento y de forma visible para que la imite sin darse cuenta.",
        adjustPlan: "Mañana, empieza con una actividad sensorial que lo ayude a regularse antes que nada.",
      },
      escalated: {
        doFirst: "Primero la seguridad. Aleja los objetos, crea espacio y protégelo sin sujetarlo.",
        whatToSay: "Di muy poco. Si acaso: 'Estoy aquí. Estás a salvo.' Repítelo como un mantra.",
        whatNotToDo: "No levantes la voz para igualar la suya. No castigues durante el berrinche.",
        tinyAction: "Ofrece algo frío: un cubo de hielo, un paño frío, un sorbo de agua. Interrumpe el ciclo de estrés.",
        adjustPlan: "Mañana mantén todo de baja exigencia. Una actividad simple y familiar que ya disfrute.",
      },
    },
    {
      keywords: ['no', 'cooperate', 'defiant', 'fight', 'coopera', 'desafiante', 'pelea', 'pelear', 'obedece', 'no quiere'],
      response: {
        doFirst: "Haz una pausa antes de reaccionar. Toma una respiración lenta para reiniciar tu sistema nervioso.",
        whatToSay: "De verdad no quieres hacer esto ahora. Te escucho.",
        whatNotToDo: "No repitas la instrucción más fuerte. El volumen no crea cooperación.",
        tinyAction: "Ofrece dos opciones pequeñas en vez de una exigencia: '¿Camiseta roja o azul?'",
        adjustPlan: "La actividad de mañana incluirá más opciones desde el principio.",
      },
      triggered: {
        doFirst: "Esto es una lucha de poder. Hazte a un lado en vez de empujar hacia adelante.",
        whatToSay: "Veo que quieres decidir por ti mismo. Busquemos una forma que funcione.",
        whatNotToDo: "No lo conviertas en una batalla de voluntades. Nadie gana esas.",
        tinyAction: "Hazlo divertido: 'Apuesto a que me pongo los zapatos antes que tú.'",
        adjustPlan: "Suma una opción en el primer paso de la actividad de mañana para que se sienta con control desde temprano.",
      },
      escalated: {
        doFirst: "La oposición ha escalado. Pausa todo. Puedes volver a la tarea más tarde.",
        whatToSay: "No tenemos que hacer esto ahora. Tomemos un descanso juntos.",
        whatNotToDo: "No lo sigas por todos lados repitiendo la petición. Dale espacio.",
        tinyAction: "Cambia el ambiente: salgan afuera, vayan a otra habitación, cambia la energía.",
        adjustPlan: "Mañana, deja que elija la actividad entre dos opciones que tú selecciones de antemano.",
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
        'agobiado',
        'agobiada',
        'agotado',
        'agotada',
        'no puedo',
        'descanso',
        'sola',
        'solo',
        'me siento',
        'desbordada',
        'desbordado',
      ],
      response: {
        doFirst: "Haz una pausa. Tienes permiso de tomarte un momento antes de responder a cualquier cosa.",
        whatToSay: "Dile a tu peque: 'Necesito un pequeño descanso. Ya vuelvo.' Luego aléjate 60 segundos.",
        whatNotToDo: "No sigas adelante cuando estás sin energía. Así es como se llega al límite.",
        tinyAction: "Pon un audiolibro o dale una tarea sensorial simple por 5 minutos mientras respiras.",
        adjustPlan: "Mañana será de menos preparación para que tengas más espacio para respirar.",
      },
      triggered: {
        doFirst: "Estás con poca energía. Eso no es un fracaso, es información. Haz una pausa.",
        whatToSay: "A tu peque: 'Descansemos los dos.' A ti misma: 'Esto es temporal.'",
        whatNotToDo: "No intentes tener paciencia con los dientes apretados. Un descanso real vale más que una calma fingida.",
        tinyAction: "Pon un temporizador de 5 minutos. Él hace una tarea tranquila, tú te sientas y respiras. Eso cuenta.",
        adjustPlan: "Simplifica mañana a una sola actividad de bajo esfuerzo y mucha conexión.",
      },
      escalated: {
        doFirst: "Ahora necesitas apoyo, no más estrategias. Está bien.",
        whatToSay: "A tu peque: 'Vamos a hacer algo muy tranquilo juntos por un ratito.'",
        whatNotToDo: "No te castigues. Cada madre o padre choca con este muro. No estás fallando.",
        tinyAction: "Llama a alguien: tu pareja, una amiga o un vecino. Hasta un relevo de 10 minutos ayuda.",
        adjustPlan: "Mañana, considera saltarte el plan estructurado por completo. El juego libre es suficiente.",
      },
    },
    {
      keywords: ['quick', 'fast', 'bored', 'what to do', '3 min', '5 min', 'idea', 'rápido', 'rápida', 'aburrido', 'aburrida', 'aburre', 'qué hacer', 'idea rápida', 'aburrimiento'],
      response: {
        doFirst: "Toma 3 cosas de la cocina: una cuchara, un vaso y una toalla. Ese es tu kit.",
        whatToSay: "Busquemos algo divertido en los próximos 30 segundos. ¿Listo?",
        whatNotToDo: "No le des demasiadas vueltas. Las ideas más simples suelen funcionar mejor.",
        tinyAction: "Empieza a jugar tú con los objetos. La curiosidad suele ganarlos.",
        adjustPlan: "Tu plan ya incluye versiones rápidas de cada actividad.",
      },
      triggered: {
        doFirst: "Mira alrededor de la habitación. Toma el objeto seguro más cercano. Ahora es un juguete.",
        whatToSay: "¿Qué crees que podría ser esto? ¿Un sombrero? ¿Un barco? ¿Tú qué piensas?",
        whatNotToDo: "No busques ideas en el teléfono. Usa lo que tienes enfrente ahora mismo.",
        tinyAction: "Empieza una búsqueda de 3 cosas: encuentra algo suave, algo redondo, algo azul.",
        adjustPlan: "Suma un 'frasco del aburrimiento' a tu rutina: ideas de actividades escritas que pueda sacar.",
      },
      escalated: {
        doFirst: "El aburrimiento se volvió frustración. Redirige con movimiento primero.",
        whatToSay: "¡Sacudámoslo! Salta 5 veces, da una vuelta y luego congélate.",
        whatNotToDo: "No ofrezcas una pantalla para resolver el aburrimiento. Reinicia el ciclo.",
        tinyAction: "Llena un bol con agua y dale vasos, cucharas y una toalla. Actividad al instante.",
        adjustPlan: "Mañana, prepara una bolsa de actividad lista para usar para estar preparada en estos momentos.",
      },
    },
  ],
};

const DEFAULT_RESPONSE: Record<Locale, ChatResponse> = {
  en: {
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
  },
  es: {
    doFirst:
      "Respira. Ya estás haciendo algo bueno al pedir ayuda.",
    whatToSay:
      "Prueba nombrar lo que ves: 'Noto que te sientes...' y espera a que responda.",
    whatNotToDo:
      "No intentes arreglar la emoción. Solo acompáñala.",
    tinyAction:
      "Ofrece una opción simple o un cambio de ambiente. El movimiento ayuda.",
    adjustPlan:
      "Revisa tus tarjetas SOS para situaciones específicas.",
  },
};

function containsSafetyKeyword(message: string): boolean {
  const lower = message.toLowerCase();
  return SAFETY_KEYWORDS.some((kw) => lower.includes(kw));
}

function matchCategory(
  message: string,
  locale: Locale,
  clarifications?: Clarifications,
): ChatResponse {
  const lower = message.toLowerCase();
  const escalatedState = locale === 'es' ? 'no, muy alterado(a)' : 'no, very upset';
  for (const category of CATEGORIES[locale]) {
    if (category.keywords.some((kw) => lower.includes(kw))) {
      if (clarifications) {
        const isEscalated = clarifications.childState === escalatedState;
        const base = isEscalated ? category.escalated : category.triggered;
        return buildClarified(base, clarifications, locale);
      }
      return category.response;
    }
  }

  if (clarifications) {
    return buildClarified(DEFAULT_RESPONSE[locale], clarifications, locale);
  }

  return DEFAULT_RESPONSE[locale];
}

async function getTodayParentSkill(locale: Locale): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    const plan = getActivePlan(user.id);
    if (!plan) return null;
    const dayNum = getTodayDayNumber(plan.created_at ?? Date.now());
    const skill = getSkillByDay(dayNum, locale);
    if (!skill) return null;
    return `${skill.title} — "${skill.scripts[0]}"`;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, {
      namespace: 'chat',
      limit: 30,
      windowSeconds: 60,
    });
    if (limited) return limited;

    const body = await request.json();
    const { message, clarifications, locale: rawLocale } = body as {
      message?: string;
      clarifications?: Clarifications;
      locale?: string;
    };

    const locale = resolveLocale(rawLocale);

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "message" field' },
        { status: 400 }
      );
    }

    if (containsSafetyKeyword(message)) {
      return NextResponse.json({ response: SAFETY_RESPONSE[locale] });
    }

    const [baseResponse, todayParentSkill] = await Promise.all([
      Promise.resolve(matchCategory(message, locale, clarifications)),
      getTodayParentSkill(locale),
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
