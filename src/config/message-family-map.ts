export type MessageFamilyId =
  | "interest_opener"
  | "price_question"
  | "package_question"
  | "education_question"
  | "visible_wires_installation"
  | "weekend_availability"
  | "small_business_camera_guidance";

export interface MessageFamilyDefinition {
  id: MessageFamilyId;
  patterns: string[];
  englishReply: string;
  spanishReply: string;
  shouldAskQuestion: boolean;
  englishQuestion?: string;
  spanishQuestion?: string;
}

export const MESSAGE_FAMILY_MAP: MessageFamilyDefinition[] = [
  {
    id: "interest_opener",
    patterns: [
      "estoy interesado",
      "me interesa",
      "buenas tardes me interesa",
      "buen dia me interesa",
      "buen día me interesa",
      "quiero informacion",
      "quiero información",
      "quiero saber",
      "interesado",
      "interesada",
      "i am interested",
      "i'm interested",
      "im interested",
      "interested",
      "i want information",
      "can you give me information",
    ],
    englishReply: "Perfect. I can help you with that.",
    spanishReply: "Perfecto. Con gusto le ayudo.",
    shouldAskQuestion: true,
    englishQuestion: "Is this for your home or a business?",
    spanishQuestion: "¿Es para casa o negocio?",
  },
  {
    id: "price_question",
    patterns: [
      "cuanto",
      "a cuanto salen",
      "a cuanto estan",
      "a cuánto salen",
      "a cuánto están",
      "cuanto cuestan",
      "cuánto cuestan",
      "que precio tienen",
      "qué precio tienen",
      "precio",
      "cost",
      "price",
      "how much",
      "what is the price",
      "what do they cost",
    ],
    englishReply:
      "The standard package starts at $700 installed, with cameras, recorder, app setup, and warranty included.",
    spanishReply:
      "El paquete estándar empieza desde $700 ya instalado, con cámaras, grabador, configuración de la app y garantía incluidos.",
    shouldAskQuestion: true,
    englishQuestion: "Is this for your home or a business?",
    spanishQuestion: "¿Es para casa o negocio?",
  },
  {
    id: "package_question",
    patterns: [
      "me puede dar mas informacion",
      "me puede dar más información",
      "me puedes dar mas informacion",
      "me puedes dar más información",
      "que incluye",
      "qué incluye",
      "que trae",
      "qué trae",
      "package",
      "what package do you offer",
      "what comes included",
      "more information",
      "more info",
    ],
    englishReply:
      "Our standard package starts with 4 cameras, installation, recorder, phone setup, and 1-year warranty included.",
    spanishReply:
      "Nuestro paquete estándar empieza con 4 cámaras, instalación, grabador, configuración en el celular y 1 año de garantía incluidos.",
    shouldAskQuestion: false,
  },
  {
    id: "education_question",
    patterns: [
      "no se mucho de camaras",
      "no sé mucho de cámaras",
      "me puede ayudar a entender",
      "me puedes ayudar a entender",
      "como funciona",
      "cómo funciona",
      "no se como funciona",
      "no sé cómo funciona",
      "expliqueme",
      "explíqueme",
      "i do not know much about cameras",
      "i dont know much about cameras",
      "can you help me understand",
      "how does it work",
      "how do cameras work",
    ],
    englishReply:
      "Of course. Basically, the cameras connect to the recorder, everything saves there, and the app is set up on your phone so you can see the system easily. The goal is to leave everything working and simple to use.",
    spanishReply:
      "Claro. Básicamente las cámaras van conectadas al grabador, ahí se guarda todo, y también se le deja la app en su celular para que pueda verlas cuando quiera. La idea es dejarle todo funcionando y fácil de usar.",
    shouldAskQuestion: false,
  },
  {
    id: "visible_wires_installation",
    patterns: [
      "se ven los cables",
      "van a quedar cables visibles",
      "se miran los cables",
      "cables visibles",
      "visible wires",
      "will the wires show",
      "will the cables be visible",
      "do the wires show",
    ],
    englishReply:
      "Normally we try to leave the installation as clean as possible. If the property has attic access or good cable routes, most of the wiring can usually be hidden. It still depends a little on the layout of the property.",
    spanishReply:
      "Normalmente tratamos de que la instalación quede lo más limpia posible. Si la propiedad tiene ático o buenas rutas, la mayor parte del cableado se puede esconder. Ya depende un poco de la distribución de la propiedad.",
    shouldAskQuestion: false,
  },
  {
    id: "weekend_availability",
    patterns: [
      "solo tengo tiempo los fines de semana",
      "solo tengo tiempo en fin de semana",
      "fines de semana",
      "fin de semana",
      "weekends only",
      "i only have time on weekends",
      "only on weekends",
    ],
    englishReply:
      "That is fine. Weekend availability can be reviewed depending on the schedule.",
    spanishReply:
      "Está bien. Se puede revisar disponibilidad para fin de semana según el horario.",
    shouldAskQuestion: true,
    englishQuestion: "Is this for your home or a business?",
    spanishQuestion: "¿Es para casa o negocio?",
  },
  {
    id: "small_business_camera_guidance",
    patterns: [
      "tengo un negocio pequeño cuantas camaras necesitaria",
      "tengo un negocio pequeño cuantas cámaras necesitaría",
      "negocio pequeño cuantas camaras",
      "negocio pequeño cuantas cámaras",
      "small business how many cameras do i need",
      "i have a small business how many cameras would i need",
    ],
    englishReply:
      "For a small business, 4 cameras is often a good starting point, but it depends on how many entrances, register area, parking, or work areas you want to cover.",
    spanishReply:
      "Para un negocio pequeño, muchas veces 4 cámaras es un buen inicio, pero depende de cuántas entradas, caja, estacionamiento o áreas de trabajo quiera cubrir.",
    shouldAskQuestion: true,
    englishQuestion: "What areas are you mainly trying to cover?",
    spanishQuestion: "¿Qué áreas quiere cubrir principalmente?",
  },
];