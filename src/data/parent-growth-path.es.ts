import type { ParentSkill } from "./parent-growth-path";

export const GROWTH_PATH_ES: ParentSkill[] = [
  {
    id: "small-control",
    dayNumber: 1,
    title: "Un poco de control",
    playMomentTitle: "Pequeñas decisiones",
    whenToUse:
      "Úsalo cuando tu peque se enoja porque algo no se puede hacer o porque cambiaron los planes.",
    whatYouPractice:
      "No estás tratando de arreglar toda la emoción. Estás ayudando a tu peque a encontrar una pequeña parte que sí puede elegir.",
    steps: [
      'Nombra el límite: "Hoy el parque está cerrado".',
      'Nombra la emoción: "Tenías muchas ganas de ir. Da tristeza".',
      'Ofrece dos opciones pequeñas: "¿Quieres armar un parque en casa o dar un paseo cortito?"',
    ],
    scripts: [
      "Esa parte no la podemos cambiar. ¿Qué podemos elegir ahora?",
      "Puedes elegir la cobija o la almohada.",
      "¿Quieres que me quede cerca o que te dé un poquito de espacio?",
      "Eso no lo podemos hacer ahora. Tú eliges qué sigue.",
    ],
    examples: [
      "El parque está cerrado: ofrece dos alternativas en casa.",
      "Se terminó la merienda: ofrece en qué vaso tomar el agua.",
      "Un hermano tomó un juguete: ofrece con qué juego empezar en su lugar.",
    ],
    avoid:
      "No ofrezcas diez opciones. No expliques demasiado mientras tu peque está muy enojado.",
    tinyWin:
      "Si tu peque elige un pequeño paso siguiente o se calma aunque sea un poquito, eso cuenta.",
    realLifePractice:
      "Usa Un poco de control una vez hoy cuando algo no salga como tu peque quiere: en la merienda, en una transición o a la hora de dormir.",
    backup:
      'Si tu peque rechaza las dos opciones, di: "Está bien. Me quedo cerca. Elegiremos cuando tu cuerpo esté listo".',
    tags: ["transitions", "meltdown", "bedtime", "snack", "control"],
    accent: "play",
  },
  {
    id: "predictable-start",
    dayNumber: 2,
    title: "Un inicio predecible",
    playMomentTitle: "Aventura Primero-Después",
    whenToUse:
      "Úsalo antes de una actividad, una transición, un paso de la rutina de dormir o cualquier momento que suele volverse caótico.",
    whatYouPractice:
      "Estás haciendo visibles los próximos minutos para que tu peque no tenga que adivinar qué viene.",
    steps: [
      "Di qué pasa primero.",
      "Di qué pasa después.",
      "Di cómo termina.",
    ],
    scripts: [
      "Primero armamos, después leemos y luego terminamos.",
      "Primero los zapatos, después la puerta y luego el carro.",
      "Primero dos bloques, después tú eliges qué pasa.",
      "Primero el baño, después el cuento y luego a dormir.",
    ],
    examples: [
      "Antes de salir de casa: primero los zapatos, después el abrigo y luego la puerta.",
      "Antes de dormir: primero el baño, después un cuento y luego apagar la luz.",
      "Antes de dejar la pantalla: primero cinco minutos más, después apagar y luego la merienda.",
    ],
    avoid: "No des una lista larga. Mantenlo en primero, después, terminamos.",
    tinyWin:
      "Si tu peque entiende el siguiente paso más rápido que de costumbre, eso cuenta.",
    realLifePractice:
      "Elige una transición del día (la mañana, la hora de dormir o la salida) y prueba Primero/Después/Terminamos una sola vez.",
    backup:
      'Si tu peque ya está enojado, di: "Sé que esta parte es difícil. Primero terminamos esto y después descansas".',
    tags: ["transitions", "routine", "bedtime", "morning", "predictability"],
    accent: "sage",
  },
  {
    id: "name-before-fixing",
    dayNumber: 3,
    title: "Nombrar antes de arreglar",
    playMomentTitle: "Detective de emociones",
    whenToUse:
      "Úsalo cuando tu peque está frustrado, decepcionado, celoso, cansado o abrumado.",
    whatYouPractice:
      "Antes de resolver el problema, ayudas a tu peque a sentirse visto. Nombrar la emoción baja la presión y hace más fácil que coopere.",
    steps: [
      "Nota la emoción.",
      "Nómbrala con sencillez.",
      "Espera un momento antes de ofrecer una solución.",
    ],
    scripts: [
      "Eso fue muy frustrante.",
      "Querías que fuera diferente.",
      "Veo que esta es una emoción grande.",
      "Estás decepcionado. Tiene sentido.",
    ],
    examples: [
      "El peque deja caer un juguete y llora: nombra la decepción antes de reemplazarlo.",
      "El peque siente celos del turno de un hermano: nombra la emoción antes de redirigir.",
      "El peque se niega a una transición: nombra la resistencia antes de explicar el plan.",
    ],
    avoid:
      'No te apures a decir "no pasa nada" o "solo haz esto". La emoción necesita un nombre antes de una solución.',
    tinyWin:
      "Si tu peque hace una pausa, te mira o se ablanda aunque sea un instante, eso cuenta.",
    realLifePractice:
      "Hoy, intenta nombrar una emoción antes de ofrecer una solución, aunque sea una sola vez, en cualquier momento del día.",
    backup:
      'Si tu peque se altera más, habla más bajito: "No me voy a ningún lado. Estoy aquí contigo".',
    tags: ["emotions", "meltdown", "frustration", "empathy", "connection"],
    accent: "lavender",
  },
  {
    id: "say-less-show-more",
    dayNumber: 4,
    title: "Habla menos, muestra más",
    playMomentTitle: "Misión Imítame",
    whenToUse:
      "Úsalo cuando tu peque se traba, ignora las indicaciones o se abruma con demasiadas palabras.",
    whatYouPractice:
      "Reduces las palabras y haces que la acción sea más fácil de imitar.",
    steps: [
      "Usa una frase corta.",
      "Muestra la acción con tu cuerpo o tus manos.",
      "Deja que tu peque imite, cambie o se sume a su manera.",
    ],
    scripts: [
      "Mírame.",
      "Tu turno.",
      "Solo uno.",
      "Así.",
    ],
    examples: [
      "El peque no quiere recoger: empieza en silencio a guardar un bloque y espera.",
      "El peque ignora las indicaciones en la cena: siéntate tú y empieza a comer con calma.",
      "El peque se abruma con un proyecto de arte: toma un crayón y traza una línea.",
    ],
    avoid:
      "No repitas la misma indicación más fuerte. En su lugar, hazla más pequeña y visible.",
    tinyWin: "Si tu peque imita una pequeña acción, eso cuenta.",
    realLifePractice:
      "Encuentra un momento hoy en el que normalmente repetirías una indicación con palabras, y prueba mostrar en su lugar.",
    backup:
      'Si tu peque sigue ignorando: reduce aún más. Un objeto. Un paso. Di: "Yo empiezo. Tú te sumas cuando estés listo".',
    tags: ["cooperation", "instructions", "modeling", "behavior", "transitions"],
    accent: "yellow",
  },
  {
    id: "start-smaller",
    dayNumber: 5,
    title: "Empieza más pequeño",
    playMomentTitle: "Un pasito a la vez",
    whenToUse:
      'Úsalo cuando tu peque se niega, se queda paralizado, dice "no" o pierde el interés rápido.',
    whatYouPractice:
      "Bajas el punto de entrada para que sumarse se sienta fácil, no exigente.",
    steps: [
      "Haz la tarea más pequeña.",
      "Invita a una acción pequeñita.",
      "Detente antes de que se vuelva una batalla.",
    ],
    scripts: [
      "No tienes que hacer todo. Solo elige una parte.",
      "¿Puedes poner un bloque aquí?",
      "Probemos por un minuto.",
      "Solo uno. Con eso basta.",
    ],
    examples: [
      "El peque se niega a dibujar: ofrece solo una línea, no un dibujo.",
      "El peque no quiere irse del parque: pídele que primero toque la reja.",
      "El peque no quiere recoger: pídele que encuentre solo un calcetín.",
    ],
    avoid:
      "No conviertas la actividad en una prueba. La meta es que se sume, no que termine.",
    tinyWin: "Si tu peque hace una pequeña parte, el plan funcionó.",
    realLifePractice:
      "Cuando te encuentres con resistencia hoy, prueba reducir la petición en un 80% y detente apenas se sume.",
    backup:
      'Si tu peque aún se niega: retírate por completo. Di: "Está bien. Voy a estar aquí cuando estés listo".',
    tags: ["refusal", "transitions", "cooperation", "resistance", "flexibility"],
    accent: "sage",
  },
  {
    id: "calm-boundary",
    dayNumber: 6,
    title: "Límite con calma",
    playMomentTitle: "Ritual de Alto y Sigue",
    whenToUse:
      "Úsalo cuando la respuesta es no, cuando se acabó la pantalla, cuando empieza la hora de dormir o cuando hay que irse.",
    whatYouPractice: "Sostienes el límite con menos palabras y un cuerpo más tranquilo.",
    steps: [
      "Di el límite una vez.",
      "Reconoce la emoción.",
      "Ofrece la siguiente acción pequeña.",
    ],
    scripts: [
      "La pantalla ya terminó.",
      "De verdad querías más.",
      "Puedes elegir: una cueva con cobijas o ayudarme con la merienda.",
      "Entiendo. La respuesta sigue siendo no.",
    ],
    examples: [
      "Se acaba la pantalla: dilo una vez, no discutas y ofrece una opción para lo que sigue.",
      "Resistencia a la hora de dormir: di el límite, nombra la emoción y pregunta por el cuento o la canción.",
      "Al salir del parque: da un aviso, sostén el límite y ofrece qué pasa después.",
    ],
    avoid:
      "No debatas el límite después de ponerlo. Repítelo con calma si hace falta.",
    tinyWin:
      "Si te mantienes más tranquilo que de costumbre, eso cuenta aunque tu peque siga enojado.",
    realLifePractice:
      "Elige un momento de límite hoy (pantalla, comida, hora de dormir) y prueba sostenerlo con menos palabras.",
    backup:
      'Si tu peque se altera más: habla más bajito, no más fuerte. Di: "Lo sé. Sigue siendo la regla. Me quedo cerca".',
    tags: ["boundaries", "screen-time", "bedtime", "refusal", "transitions"],
    accent: "play",
  },
  {
    id: "repair-and-repeat",
    dayNumber: 7,
    title: "Reparar y repetir",
    playMomentTitle: "Mapa de pequeños logros",
    whenToUse:
      "Úsalo al final de la semana o después de un momento difícil que no salió perfecto.",
    whatYouPractice:
      "Notas lo que funcionó y reparas lo que se sintió desordenado, sin culpa.",
    steps: [
      "Nombra una cosa que funcionó.",
      "Nombra una cosa que fue difícil.",
      "Elige una cosa para repetir la próxima semana.",
    ],
    scripts: [
      "Eso fue difícil, y volvimos a reconectar.",
      "Una cosa funcionó: empezamos más pequeño.",
      "Mañana podemos probar la versión corta.",
      "Estoy orgulloso de nosotros por intentarlo.",
    ],
    examples: [
      "La hora de dormir salió mejor al usar Primero/Después: repítelo la próxima semana.",
      "La rabieta fue difícil, pero nombrar la emoción ayudó: conserva eso.",
      "La batalla por recoger: empezar más pequeño funcionó una vez, construye sobre eso.",
    ],
    avoid: "No califiques la semana como éxito o fracaso. Busca patrones.",
    tinyWin:
      "Si puedes nombrar una herramienta que puedes repetir, la semana fue un éxito.",
    realLifePractice:
      "Antes de dormir esta noche, escribe o di una cosa que funcionó esta semana. Ese es tu punto de partida.",
    backup:
      'Si la semana se sintió demasiado difícil: di "Lo intentamos. Eso cuenta" y elige una cosa más amable para llevar contigo.',
    tags: ["reflection", "repair", "pattern", "weekly-checkin", "growth"],
    accent: "yellow",
  },
];
