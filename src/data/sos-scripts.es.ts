import type { SosScript } from "./sos-scripts";

export const SOS_SCRIPTS_ES: SosScript[] = [
  {
    id: 'screen_battle',
    title: 'Hora de apagar la pantalla',
    icon: 'phone',
    situation:
      'Tu peque pide más y más tiempo de pantalla y se enoja cuando llega el momento de parar.',
    firstThirtySeconds:
      'Mantén la calma y ponte a su altura antes de decir nada. Todavía no tomes el dispositivo: lo primero es tu presencia.',
    whatToSay:
      'La pantalla se va a dormir ahora. Sé que quieres más y eso da rabia. Vamos a buscar algo divertido para hacer juntos. ¿Quieres dibujar o jugar con tus carritos?',
    whatNotToDo:
      'No le quites el dispositivo de golpe, no levantes la voz ni negocies más minutos. Quitárselo de repente hace que la transición sea más difícil.',
    afterCalm:
      'Deja que apague el botón él mismo. Una pequeña decisión suaviza el paso de la pantalla a lo que sigue.',
    tinyNextStep:
      'Pasen juntos a algo con las manos: bloques, dibujar o ayudarte en la cocina.',
  },
  {
    id: 'tantrum',
    title: 'Emociones intensas',
    icon: 'heart',
    situation:
      'Tu peque está desbordado por emociones intensas en este momento y no puede escuchar razones.',
    firstThirtySeconds:
      'Ponte a su altura, en silencio y cerca. Todavía no intentes hablar: tu presencia tranquila es el ancla que necesita ahora mismo.',
    whatToSay:
      'Aquí estoy contigo. Estás a salvo. Me quedo contigo hasta que te sientas mejor. No hay ninguna prisa.',
    whatNotToDo:
      'No intentes razonar, explicar ni arreglar la emoción mientras la ola sigue rompiendo. Las palabras no llegan cuando está desbordado.',
    afterCalm:
      'Cuando la respiración se calme, ofrécele: "¿Quieres un abrazo o un poco de espacio?" Luego sigue lo que él te muestre.',
    tinyNextStep:
      'Ofrécele agua y propón algo físico: "¿Vamos a chapotear con las manos juntos?"',
  },
  {
    id: 'bedtime',
    title: 'Luchas a la hora de dormir',
    icon: 'moon',
    situation:
      'Tu peque se levanta de la cama una y otra vez o pide una cosa más. La hora de dormir se alarga sin fin.',
    firstThirtySeconds:
      'Baja las luces y haz tus movimientos más lentos. Tu calma marca el ritmo: habla en susurros y muévete despacio.',
    whatToSay:
      'Ya hicimos nuestro cuento y nuestra canción. Tu cuerpo necesita descansar ahora. Te quiero y te veo en la mañana. Buenas noches.',
    whatNotToDo:
      'No agregues pasos extra, no negocies más actividades ni amenaces con castigos por no dormir. Cada paso de más premia el alargue.',
    afterCalm:
      'Arrópalo con cariño y dale las buenas noches con calma y confianza. Recuéstate a su lado y respira lento y de forma audible: los cuerpos se sincronizan.',
    tinyNextStep:
      'Dile: "Cierra los ojos y cuéntame tres cosas divertidas que hicimos hoy." Luego quédate en silencio y deja que llegue el sueño.',
  },
  {
    id: 'public_place',
    title: 'Emociones intensas en público',
    icon: 'people',
    situation:
      'Tu peque tiene emociones intensas en una tienda, un restaurante o un parque y sientes que todos te miran.',
    firstThirtySeconds:
      'Ponte a su altura y habla en voz baja. No reacciones al público: concéntrate solo en tu peque.',
    whatToSay:
      'Sé que esto es difícil ahora. Vamos juntos a un lugar más tranquilo. No estoy enojado, solo quiero ayudarte a sentirte mejor.',
    whatNotToDo:
      'No levantes la voz, no intentes darles explicaciones a los demás ni apures el momento por vergüenza.',
    afterCalm:
      'Vayan juntos a un lugar más tranquilo. Cuando se calme, nombra la emoción con tranquilidad antes de seguir.',
    tinyNextStep:
      'Respiren juntos tres veces profundo y luego cuenten algo cercano: "Vamos a contar las cosas rojas que vemos."',
  },
  {
    id: 'child_refuses',
    title: 'Cuando dice que no',
    icon: 'hand',
    situation:
      'Tu peque dice que no a todo: vestirse, lavarse los dientes, salir de casa.',
    firstThirtySeconds:
      'Haz una pausa antes de reaccionar. Toma una respiración lenta para calmar primero tu propio cuerpo.',
    whatToSay:
      'Te escucho. No quieres hacer esto ahora. Puedes elegir: hacerlo tú solo o que yo te ayude. Cualquiera de las dos está bien.',
    whatNotToDo:
      'No repitas la indicación más fuerte. No lo conviertas en una pelea de voluntades: en esas nadie gana.',
    afterCalm:
      'Hazlo divertido: "¡A que me pongo los zapatos antes que tú!" Un reto funciona mejor que una exigencia.',
    tinyNextStep:
      'Ofrécele dos opciones de verdad y deja que decida: "¿Camiseta roja o azul? Tú eliges."',
  },
  {
    id: 'parent_exhausted',
    title: 'Cuando necesitas un momento',
    icon: 'battery',
    situation:
      'Has tenido un día largo. Tu paciencia está al límite y necesitas un respiro rápido para ti.',
    firstThirtySeconds:
      'Tienes permiso de hacer una pausa antes de responder. Dilo para ti: "Ahora mismo estoy al límite, y está bien."',
    whatToSay:
      'Dile a tu peque: "Necesito un descansito. Vuelvo enseguida." Luego aléjate por 60 segundos.',
    whatNotToDo:
      'No sigas adelante cuando estás sin energía: así es como se llega a explotar. Un descanso de verdad vale más que una calma fingida.',
    afterCalm:
      'Regresa y di: "Ya volví. Vamos a hacer algo juntos." Una actividad simple y tranquila es suficiente.',
    tinyNextStep:
      'Pon un audiolibro o dale una tarea sensorial simple por 5 minutos mientras respiras y te recargas.',
  },
  {
    id: 'sibling_conflict',
    title: 'Peleas entre hermanos',
    icon: 'users',
    situation:
      'Tus hijos quieren lo mismo y las voces empiezan a subir. Quieren que tomes partido por uno.',
    firstThirtySeconds:
      'No trates de averiguar quién empezó. Los dos necesitan sentirse escuchados antes de cualquier solución.',
    whatToSay:
      'Veo que los dos están molestos. Los voy a ayudar a resolver esto, pero primero respiremos todos. Ahora cuéntenme uno a la vez: ¿qué pasó?',
    whatNotToDo:
      'No tomes partido, no des sermones sobre lo justo ni hagas que uno se sienta el malo de la historia.',
    afterCalm:
      'Ayúdalos a probar una solución con la que los dos estén de acuerdo: un cronómetro para los turnos o elegir actividades separadas por ahora.',
    tinyNextStep:
      'Hagan algo juntos en grupo: "¿Quién quiere elegir un juego para los tres?"',
  },
  {
    id: 'transition_meltdown',
    title: 'Hora de irse',
    icon: 'arrow',
    situation:
      'Tienes que irte de un lugar divertido y tu peque no quiere. Despedirse parece imposible.',
    firstThirtySeconds:
      'Da un aviso de verdad, no una amenaza. "Dos minutos más y nos vamos." Luego cúmplelo.',
    whatToSay:
      'Veo lo mucho que te estás divirtiendo. Ahora tenemos que irnos. Elijamos una última cosa y luego nos despedimos juntos.',
    whatNotToDo:
      'No sigas posponiendo la salida ni negociando. Cada demora le enseña que resistirse funciona.',
    afterCalm:
      'Tómalo de la mano y empiecen a caminar. Despídanse del lugar juntos: hace que el cierre se sienta real.',
    tinyNextStep:
      'Dale algo que esperar con ilusión: "De camino a casa, contemos cuántos perros vemos."',
  },
];
