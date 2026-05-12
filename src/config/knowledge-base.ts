export type KnowledgeTopicId =
  | "night_vision"
  | "package_info"
  | "app_remote_viewing"
  | "monthly_fee"
  | "app_installation"
  | "payment_terms"
  | "internet_requirement"
  | "recording_storage"
  | "warranty"
  | "hardwired_system"
  | "camera_brands";

export interface KnowledgeTopic {
  id: KnowledgeTopicId;
  keywords: string[];
  englishAnswer: string;
  spanishAnswer: string;
  shouldQualifyAfterAnswer: boolean;
  handoffRecommended: boolean;
}

export const KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    id: "night_vision",
    keywords: [
      "night vision",
      "night time recording",
      "night recording",
      "record at night",
      "recording at night",
      "how does it see at night",
      "vision nocturna",
      "graba de noche",
      "graban de noche",
      "como se ve de noche",
      "cómo se ve de noche",
      "graba en la noche",
      "graba de noche o no",
    ],
    englishAnswer:
      "Yes. We do offer systems that record at night, and depending on the package, some can record with color night vision. The footage also records to the DVR or NVR so you can review it later.",
    spanishAnswer:
      "Sí. Sí manejamos sistemas que graban de noche, y dependiendo del paquete, algunos pueden grabar con visión nocturna a color. Además, todo queda grabado en el DVR o NVR para poder revisarlo después.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
  {
    id: "package_info",
    keywords: [
      "package",
      "packages",
      "what package do you offer",
      "tell me about the package",
      "what do you offer",
      "what comes included",
      "paquete",
      "paquetes",
      "que incluye",
      "qué incluye",
      "que ofrecen",
      "qué ofrecen",
      "más información del paquete",
      "mas informacion del paquete",
    ],
    englishAnswer:
      "Our standard package starts with 4 cameras, installation, recorder, phone setup, and warranty included. We also have other options depending on the property and the quality level you want.",
    spanishAnswer:
      "Nuestro paquete estándar empieza con 4 cámaras, instalación, grabador, configuración en el celular y garantía incluidos. También tenemos otras opciones dependiendo de la propiedad y del nivel de calidad que busque.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
  {
    id: "app_remote_viewing",
    keywords: [
      "app included",
      "remote viewing",
      "view from phone",
      "watch from phone",
      "phone app",
      "monitor from app",
      "app",
      "la app viene incluida",
      "ver desde el celular",
      "ver en el telefono",
      "ver en el teléfono",
      "mirarlas desde el celular",
      "aplicacion",
      "aplicación",
      "app incluida",
      "monitoreo remoto",
    ],
    englishAnswer:
      "Yes, the app setup is included. We do not charge extra to install it on your phone, and remote viewing through the app is free.",
    spanishAnswer:
      "Sí, la configuración de la app en su celular va incluida. No cobramos extra por instalarla en su teléfono, y el monitoreo remoto por la aplicación es gratis.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
  {
    id: "monthly_fee",
    keywords: [
      "monthly fee",
      "monthly payment for app",
      "subscription",
      "do i pay monthly",
      "extra every month",
      "mensualidad",
      "hay que pagar mensualidad",
      "se paga mensual",
      "pago mensual",
      "suscripcion",
      "suscripción",
      "cobra mensual",
    ],
    englishAnswer:
      "No, there is no monthly fee just to use the app or for local recording. Once the system is installed, you can view it from the app without a separate monthly charge.",
    spanishAnswer:
      "No, no hay mensualidad solo por usar la app ni por la grabación local. Ya una vez instalado el sistema, lo puede ver desde la aplicación sin un cobro mensual aparte.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
  {
    id: "app_installation",
    keywords: [
      "charge to install the app",
      "set up the app on my phone",
      "install app on my phone",
      "extra to put the app",
      "cobran extra por instalar la app",
      "poner la app en mi celular",
      "instalar la app en mi telefono",
      "instalar la app en mi teléfono",
      "configurar la app",
      "configurar la aplicacion",
      "configurar la aplicación",
    ],
    englishAnswer:
      "No, we do not charge extra to install and set up the app on your phone. That is already included as part of the installation.",
    spanishAnswer:
      "No, no cobramos extra por instalar y configurar la app en su celular. Eso ya va incluido como parte de la instalación.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
  {
    id: "payment_terms",
    keywords: [
      "pay all at once",
      "pay in parts",
      "payment plan",
      "deposit",
      "half now half later",
      "credit card",
      "card fee",
      "pay with card",
      "hay que pagar de un solo",
      "se puede pagar en partes",
      "aceptan pagos",
      "se da deposito",
      "se da depósito",
      "todo al final",
      "pago en partes",
      "aceptan tarjeta",
      "acepta tarjeta",
      "pagar con tarjeta",
      "cargo por tarjeta",
      "comision de tarjeta",
      "comisión de tarjeta"
    ],
    englishAnswer:
      "For a standard install, payment is normally made in one payment once the installation is finished and the phone app is set up. We do not offer payments in parts. If you want to pay by credit card, any processing fee charged by the card company may apply.",
    spanishAnswer:
      "Para una instalación estándar, normalmente se paga en un solo pago una vez que la instalación queda terminada y la app del celular ya está configurada. No manejamos pagos en partes. Si el pago es con tarjeta de crédito, puede aplicar la comisión que cobre la compañía de la tarjeta.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
  {
    id: "internet_requirement",
    keywords: [
      "need internet",
      "wifi goes out",
      "without internet",
      "do i need wifi",
      "internet required",
      "necesita internet",
      "ocupa internet",
      "sin internet",
      "si se va el wifi",
      "si se va el internet",
      "necesita wifi",
    ],
    englishAnswer:
      "Internet is not required for the system to record locally to the DVR or NVR. Internet is only needed if you want to view the cameras from your phone while you are away from the property.",
    spanishAnswer:
      "No necesita internet para que el sistema grabe localmente en el DVR o NVR. El internet solo se necesita si quiere ver las cámaras desde su celular cuando no esté en la propiedad.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
  {
    id: "recording_storage",
    keywords: [
      "where does it record",
      "where is footage stored",
      "dvr",
      "nvr",
      "how long does it record",
      "donde se graba",
      "dónde se graba",
      "dvr o nvr",
      "cuanto guarda",
      "cuánto guarda",
      "donde queda grabado",
      "dónde queda grabado",
    ],
    englishAnswer:
      "The footage records to the DVR or NVR, depending on the system. That way you can review recordings later directly from the system or through the app when configured.",
    spanishAnswer:
      "La grabación queda en el DVR o NVR, dependiendo del sistema. Así puede revisar las grabaciones después directamente desde el sistema o desde la app cuando ya está configurada.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
  {
    id: "warranty",
    keywords: [
      "warranty",
      "guarantee",
      "how long is the warranty",
      "garantia",
      "garantía",
      "cuanto dura la garantia",
      "cuánto dura la garantía",
    ],
    englishAnswer:
      "The package includes a 1-year written warranty. That way you are not just getting a verbal promise.",
    spanishAnswer:
      "El paquete incluye 1 año de garantía por escrito. Así no se queda solo con una promesa de palabra.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
  {
    id: "hardwired_system",
    keywords: [
      "hardwired",
      "wired system",
      "wireless or wired",
      "son alambricas",
      "son alámbricas",
      "es cableado",
      "es alambrico",
      "es alámbrico",
      "inalambricas o alambricas",
      "inalámbricas o alámbricas",
    ],
    englishAnswer:
      "Most of the systems we recommend are hardwired, because they are more stable and reliable for recording. The exact setup can still depend on the property.",
    spanishAnswer:
      "La mayoría de los sistemas que recomendamos son cableados, porque son más estables y confiables para grabación. Ya la instalación exacta también depende de la propiedad.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
  {
    id: "camera_brands",
    keywords: [
      "what brand",
      "camera brand",
      "annke",
      "reolink",
      "que marca",
      "qué marca",
      "marca de camaras",
      "marca de cámaras",
    ],
    englishAnswer:
      "We work with different brands depending on the package and quality level. For example, standard options and higher-end options can vary depending on what fits the property best.",
    spanishAnswer:
      "Trabajamos con diferentes marcas dependiendo del paquete y del nivel de calidad. Por ejemplo, hay opciones estándar y otras más avanzadas según lo que mejor convenga para la propiedad.",
    shouldQualifyAfterAnswer: true,
    handoffRecommended: false,
  },
];