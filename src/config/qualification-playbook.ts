export const QUALIFICATION_PLAYBOOK = {
  defaultQuestionOrder: [
    "property_type",
    "city",
    "areas_to_cover",
    "stories",
    "camera_count",
    "brand_preference",
    "timeline",
    "phone_number",
  ],
  labels: {
    property_type: {
      english: "Is this for a house or a business?",
      spanish: "¿Es para casa o negocio?",
    },
    city: {
      english: "What city is the property in?",
      spanish: "¿En qué ciudad está la propiedad?",
    },
    areas_to_cover: {
      english: "What areas are you trying to cover first?",
      spanish: "¿Qué áreas quiere cubrir primero?",
    },
    stories: {
      english: "Is it one-story or two-story?",
      spanish: "¿Es de un piso o dos pisos?",
    },
    camera_count: {
      english: "About how many cameras do you need?",
      spanish: "¿Cuántas cámaras ocupa?",
    },
    brand_preference: {
      english: "Do you want the standard setup or an upgraded option like Reolink?",
      spanish: "¿Busca la opción estándar o una opción mejorada como Reolink?",
    },
    timeline: {
      english: "How soon are you looking to install?",
      spanish: "¿Qué tan pronto le gustaría instalar?",
    },
    phone_number: {
      english: "What is the best phone number to reach you?",
      spanish: "¿Cuál es el mejor número para comunicarnos?",
    },
  },
} as const;