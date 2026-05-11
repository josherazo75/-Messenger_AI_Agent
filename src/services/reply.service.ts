import { detectPriceInquiryType } from "./price-inquiry.service";
import { detectSpanishStyle, SpanishStyle } from "./spanish-style.service";
import { normalizeSpanishText } from "./spanish-normalizer.service";
import { detectLanguage, detectIntent } from "./intent.service";
import { detectResponseDepth } from "./response-depth.service";
import { RESPONSE_TEMPLATES } from "../config/response-templates";
import { PAYMENT_RULES } from "../config/payment-rules";
import { FAQ_RULES } from "../config/faq";

function spanishPriceReply(style: SpanishStyle, depthLevel: string): string {
  if (depthLevel === "level_1_very_light") {
    return "Sí, claro. El paquete de 4 cámaras empieza desde $700 ya con instalación incluida. ¿Es para casa o negocio?";
  }

  if (depthLevel === "level_3_problem_solution") {
    return "Claro. La idea no es solo poner cámaras, sino cubrir bien los puntos importantes para que pueda revisar desde su celular y quede todo grabado. El paquete de 4 cámaras empieza desde $700 con instalación, configuración y garantía. ¿Quiere cubrir solo el frente o también patio y lados?";
  }

  if (style === "formal") {
    return "Claro, con gusto. La instalación estándar de 4 cámaras empieza desde $700 con cámaras e instalación incluidas. El precio final depende del lugar, la distancia y el tipo de sistema. ¿Es para casa o negocio?";
  }

  if (style === "simple") {
    return "Sí. Para 4 cámaras empieza desde $700 ya con cámaras e instalación incluidas. Depende un poco de la casa y la distancia. ¿Es para casa o negocio?";
  }

  if (style === "casual") {
    return "Claro jefe, para 4 cámaras empieza desde $700 ya instaladas con cámaras incluidas. Depende un poco del lugar y la distancia. ¿Es para casa o negocio?";
  }

  return RESPONSE_TEMPLATES.priceReply.spanish;
}

function englishPriceReply(depthLevel: string): string {
  if (depthLevel === "level_1_very_light") {
    return "Sure. The standard 4-camera setup starts at $700 installed. Is it for a house or a business?";
  }

  if (depthLevel === "level_3_problem_solution") {
    return "Sure. The goal is not just to put cameras up, but to cover the important areas properly so everything is recorded and easy to check from your phone. A standard 4-camera setup starts at $700 installed, including setup and warranty. Are you mainly trying to cover the front only, or the front and backyard?";
  }

  return "Most standard 4-camera home setups start at $700 installed, including cameras and installation. Final price depends on the layout, distance, and system type. Is this for a house or a business?";
}

function spanishInfoReply(style: SpanishStyle, depthLevel: string): string {
  if (depthLevel === "level_1_very_light") {
    return "Sí, claro. Yo le explico rápido. ¿Son para casa o negocio?";
  }

  if (depthLevel === "level_3_problem_solution") {
    return "Claro. Normalmente la idea es cubrir bien las áreas importantes de la propiedad, que pueda verlas desde el celular, y que todo quede grabado sin complicarle el sistema. El paquete incluye cámaras, instalación, configuración y garantía. ¿Quiere cubrir solo frente y entrada o toda la propiedad?";
  }

  if (style === "formal") {
    return "Claro, con gusto. Le explico las opciones según la cantidad de cámaras y la calidad que usted busque. Primero, ¿las necesita para casa o negocio?";
  }

  if (style === "simple") {
    return "Sí, claro. Yo le explico fácil. Primero, ¿son para casa o negocio?";
  }

  if (style === "casual") {
    return "Claro jefe. Yo le explico bien las opciones. Primero, ¿son para casa o negocio?";
  }

  return "Claro que sí. Yo le explico las opciones. Primero, ¿las necesita para casa o negocio?";
}

function englishInfoReply(depthLevel: string): string {
  if (depthLevel === "level_1_very_light") {
    return "Sure, I can help. Is it for a house or a business?";
  }

  if (depthLevel === "level_3_problem_solution") {
    return "Sure. The main idea is to cover the important areas properly, make it easy to view from your phone, and keep everything recording without overcomplicating the setup. The package includes the cameras, installation, setup, and warranty. Are you mainly trying to cover the front only or the full property?";
  }

  return "Sure. I can explain the options and help narrow it down so you do not overpay. Is it for a house or a business?";
}

function spanishHowItWorksReply(): string {
  return "Claro. La idea es cubrir bien las áreas importantes como frente, entrada, lados o patio, para que todo quede grabado y usted lo pueda revisar desde el celular. El paquete incluye cámaras, instalación, configuración y garantía. ¿Quiere cubrir solo el frente o también el patio y los lados?";
}

function englishHowItWorksReply(): string {
  return "Sure. The idea is to cover the main areas like the front, driveway, sides, or backyard so everything stays recorded and you can check it from your phone. The package includes the cameras, installation, setup, and warranty. Do you mainly want coverage for the front only, or the front and backyard?";
}

function spanishHowItLooksReply(): string {
  return "Se ve muy claro. En opciones mejores como IP o Reolink la imagen sale más limpia, y también puede verla desde la app en el celular. La instalación queda limpia y pensada para cubrir bien la propiedad. Si gusta, le oriento según su presupuesto. ¿Es para casa o negocio?";
}

function englishHowItLooksReply(): string {
  return "It looks very clear. On better options like IP or Reolink, the image is cleaner, and you can also view everything from the phone app. The install is meant to stay clean and cover the property properly. Is it for a house or a business?";
}

function spanishNightReply(style: SpanishStyle): string {
  if (style === "formal") {
    return "Hay opciones con visión nocturna normal y otras con color de noche, que ofrecen mejor imagen pero también cuestan más. ¿Busca una opción básica o de mejor calidad?";
  }

  if (style === "simple") {
    return "Hay unas normales de noche y otras a color en la noche. Las de color cuestan más. ¿Quiere básica o mejor calidad?";
  }

  if (style === "casual") {
    return "Hay unas normales de noche y otras a color jefe. Las de color salen más caras. ¿Quiere básica o mejor calidad?";
  }

  return "Hay opciones con visión nocturna normal y otras con color de noche, que se ven mejor pero cuestan más. ¿Quiere opción básica o mejor calidad?";
}

function spanishWiredReply(style: SpanishStyle): string {
  if (style === "formal") {
    return "Yo trabajo principalmente con cámaras alámbricas porque son más estables y fallan menos que las inalámbricas. ¿Cuántas cámaras necesita?";
  }

  if (style === "simple") {
    return "Yo trabajo más con cámaras con cable porque fallan menos. ¿Cuántas cámaras ocupa?";
  }

  if (style === "casual") {
    return "Yo trabajo más con cámaras con cable jefe porque fallan menos. ¿Cuántas cámaras ocupa?";
  }

  return "Yo trabajo más con cámaras alámbricas porque son más estables y fallan menos que las inalámbricas. ¿Cuántas cámaras necesita?";
}

function spanishInstallOnlyReply(style: SpanishStyle): string {
  if (style === "formal") {
    return "Solo por instalación normalmente cobro $100 por cámara. Si son varias, a veces puedo mejorar el precio. ¿Cuántas cámaras serían?";
  }

  if (style === "simple") {
    return "Solo instalación cobro $100 por cámara. Si son varias, le puedo mejorar el precio. ¿Cuántas serían?";
  }

  if (style === "casual") {
    return "Solo instalación cobro $100 por cámara jefe. Si son varias, le mejoro el precio. ¿Cuántas serían?";
  }

  return "Solo instalación normalmente cobro $100 por cámara. Si son varias, a veces le puedo mejorar el precio. ¿Cuántas cámaras serían?";
}

function englishInstallOnlyReply(): string {
  return "Installation-only jobs are usually $100 per camera. If there are several cameras, I can sometimes work on the price a little. About how many cameras would it be?";
}

function spanishExpensiveReply(style: SpanishStyle): string {
  if (style === "formal") {
    return "Lo entiendo. Muchas veces la diferencia está en que aquí ya va incluida la instalación, la configuración y dejarlo funcionando bien. ¿Busca algo básico o una opción mejorada como Reolink?";
  }

  if (style === "simple") {
    return "Lo entiendo. Aquí ya va la instalación, la configuración y dejarlo funcionando bien. ¿Busca algo básico o algo mejor como Reolink?";
  }

  if (style === "casual") {
    return "Lo entiendo jefe. Aquí ya va la instalación, la configuración y dejarlo funcionando bien. ¿Busca algo básico o algo mejor como Reolink?";
  }

  return "Lo entiendo. Muchas personas comparan precios sin saber todo lo que incluye. Aquí ya va la instalación, la configuración y dejarlo funcionando bien. ¿Busca algo básico o algo mejor como Reolink?";
}

function englishExpensiveReply(): string {
  return "I understand. A lot of people compare prices without knowing what is included. This includes the cameras, installation, setup, and making sure everything is working properly. Are you looking for something basic, or a better upgraded option?";
}

function spanishRecordingReply(style: SpanishStyle): string {
  if (style === "formal") {
    return "Depende del disco duro y del número de cámaras, pero normalmente graban varios días y después se sobreescriben automáticamente. ¿Cuántas cámaras necesita?";
  }

  if (style === "simple") {
    return "Depende del disco y de cuántas cámaras sean, pero normalmente graban varios días. ¿Cuántas cámaras ocupa?";
  }

  if (style === "casual") {
    return "Depende del disco y de cuántas cámaras sean jefe, pero normalmente graban varios días. ¿Cuántas cámaras ocupa?";
  }

  return "Depende del disco duro y del número de cámaras, pero normalmente graban varios días y se van sobreescribiendo automáticamente. ¿Cuántas cámaras necesita?";
}

function englishRecordingReply(): string {
  return "That depends on the hard drive size and the number of cameras, but most systems record for several days and then recycle automatically. About how many cameras do you need?";
}

function spanishWeekendReply(style: SpanishStyle): string {
  if (style === "formal") {
    return "Está bien. A veces sí tengo espacio el fin de semana. ¿En qué ciudad está la propiedad para revisar disponibilidad?";
  }

  if (style === "simple") {
    return "Está bien. A veces sí tengo tiempo el fin de semana. ¿En qué ciudad está la propiedad?";
  }

  if (style === "casual") {
    return "Está bien jefe. A veces sí tengo espacio el fin de semana. ¿En qué ciudad está la propiedad?";
  }

  return "Está bien. A veces sí tengo espacio en fin de semana. ¿En qué ciudad está la propiedad para revisar disponibilidad?";
}

function spanishGreetingReply(style: SpanishStyle, depthLevel: string): string {
  if (depthLevel === "level_1_very_light") {
    return "Buenas. ¿Es para casa o negocio?";
  }

  if (style === "formal") {
    return "Buenas, con gusto le atiendo. ¿Las cámaras las necesita para casa o negocio?";
  }

  if (style === "simple") {
    return "Buenas. ¿Son para casa o negocio?";
  }

  if (style === "casual") {
    return "Buenas jefe. ¿Son para casa o negocio?";
  }

  return "Buenas, ¿es para casa o negocio?";
}

function englishGreetingReply(depthLevel: string): string {
  if (depthLevel === "level_1_very_light") {
    return "Hi, yes it is available. Is it for a house or a business?";
  }

  return "Hi, yes it is available. I help set up simple camera systems that cover the right areas without overdoing it. Is it for a house or a business?";
}

function spanishUnknownReply(style: SpanishStyle): string {
  if (style === "formal") {
    return "Disculpe, no entendí bien su pregunta. ¿Me podría decir si desea información del precio, de la instalación o del paquete?";
  }

  if (style === "simple") {
    return "No entendí bien. ¿Quiere precio, instalación o información?";
  }

  if (style === "casual") {
    return "Claro jefe, no entendí bien. ¿Quiere precio, instalación o info del paquete?";
  }

  return "Claro, no entendí bien la pregunta. ¿Quiere precio, instalación o información del paquete?";
}

function englishUnknownReply(): string {
  return "I did not fully understand the question. Are you asking about price, installation, or the package?";
}

function spanishSmallJobReply(style: SpanishStyle): string {
  if (style === "formal") {
    return "Sí, en algunos casos se puede hacer con 2 o 3 cámaras. El precio puede bajar un poco, pero normalmente no es mucha la diferencia porque la instalación, la configuración y la distancia siguen influyendo. ¿En qué ciudad está la propiedad?";
  }

  if (style === "simple") {
    return "Sí se puede revisar con 2 o 3 cámaras. Puede bajar un poco, pero normalmente no es mucha la diferencia. ¿En qué ciudad está la propiedad?";
  }

  if (style === "casual") {
    return "Sí jefe, se puede revisar con 2 o 3 cámaras. Puede bajar un poco, pero normalmente no es mucha la diferencia. ¿En qué ciudad está la propiedad?";
  }

  return RESPONSE_TEMPLATES.smallJobReply.spanish;
}

function englishSmallJobReply(): string {
  return RESPONSE_TEMPLATES.smallJobReply.english;
}

function spanishCardReply(): string {
  return `${FAQ_RULES.cardQuestion.spanish} ¿La instalación sería para casa o negocio?`;
}

function englishCardReply(): string {
  return `${FAQ_RULES.cardQuestion.english} Is this for a house or a business install?`;
}

function spanishPaymentPlanReply(): string {
  if (PAYMENT_RULES.paymentPlansAvailable) {
    return "Puede haber opciones de pago dependiendo del trabajo. Primero tendría que confirmar cuántas cámaras ocupa. ¿Busca 4 cámaras o más?";
  }

  return "Por el momento puedo revisar qué opciones hay, pero normalmente se paga al terminar la instalación. ¿Sería para 4 cámaras?";
}

function englishPaymentPlanReply(): string {
  if (PAYMENT_RULES.paymentPlansAvailable) {
    return "Payment options may be available depending on the job. I would need to confirm the setup first. Are you looking for 4 cameras or more?";
  }

  return "At the moment, I can check what options are available, but most installs are paid when the job is completed. Is this for a 4-camera setup?";
}

function spanishIncludedReply(): string {
  return `${FAQ_RULES.includedQuestion.spanish} ¿Es para casa o negocio?`;
}

function englishIncludedReply(): string {
  return `${FAQ_RULES.includedQuestion.english} Is this for a house or business?`;
}

function spanishInternetReply(): string {
  return `${FAQ_RULES.internetQuestion.spanish} ¿Es para casa o negocio?`;
}

function englishInternetReply(): string {
  return `${FAQ_RULES.internetQuestion.english} Is this for a house or a business?`;
}

function spanishMonthlyReply(): string {
  return `${FAQ_RULES.monthlyFeeQuestion.spanish} Solo ocuparía internet si quiere verlas desde el celular. ¿Es para casa o negocio?`;
}

function englishMonthlyReply(): string {
  return `${FAQ_RULES.monthlyFeeQuestion.english} You would only need internet if you want remote viewing on your phone. Is this for a house or a business?`;
}

function spanishPhoneViewReply(): string {
  return "Sí, las puede ver desde su celular si el lugar tiene internet. El sistema puede grabar localmente, pero para verlas desde el teléfono cuando anda fuera sí ocupa internet. ¿Es para casa o negocio?";
}

function englishPhoneViewReply(): string {
  return "Yes, you can see them from your phone if the property has internet. The system can still record locally, but internet is needed if you want remote viewing while you are away. Is it for a house or a business?";
}

export function buildReply(messageText?: string, contactId = ""): string {
  if (!messageText || !messageText.trim()) {
    return "Buenas, ¿es para casa o negocio?";
  }

  const rawText = messageText.toLowerCase().trim();
  const text = normalizeSpanishText(messageText);
  const language = detectLanguage(messageText);
  const intent = detectIntent(messageText);
  const spanishStyle = detectSpanishStyle(messageText);
  const depth = detectResponseDepth(messageText);
    const priceInquiry = detectPriceInquiryType(contactId, messageText);

  const asksForTwoOrThreeCamerasSpanish =
    (text.includes("2 camaras") ||
      text.includes("3 camaras") ||
      text.includes("dos camaras") ||
      text.includes("tres camaras")) &&
    (text.includes("solo") ||
      text.includes("nomas") ||
      text.includes("nomas ocupo") ||
      text.includes("ocupo") ||
      text.includes("quiero"));

  const asksForTwoOrThreeCamerasEnglish =
    (rawText.includes("2 cameras") ||
      rawText.includes("3 cameras") ||
      rawText.includes("two cameras") ||
      rawText.includes("three cameras")) &&
    (rawText.includes("only") ||
      rawText.includes("just") ||
      rawText.includes("need") ||
      rawText.includes("want"));

  const asksCardSpanish =
    text.includes("aceptan tarjeta") ||
    text.includes("acepta tarjeta") ||
    text.includes("se puede pagar con tarjeta") ||
    text.includes("puedo pagar con tarjeta");

  const asksCardEnglish =
    rawText.includes("do you take card") ||
    rawText.includes("take credit cards") ||
    rawText.includes("do you accept card") ||
    rawText.includes("do you take credit card");

  const asksPaymentPlanSpanish =
    text.includes("planes de pago") ||
    text.includes("plan de pago") ||
    text.includes("se puede pagar por pagos") ||
    text.includes("tienen pagos");

  const asksPaymentPlanEnglish =
    rawText.includes("payment plan") ||
    rawText.includes("payment plans") ||
    rawText.includes("payments");

  const asksIncludedSpanish =
    text.includes("incluye instalacion") ||
    text.includes("incluye las camaras") ||
    text.includes("es con instalacion") ||
    text.includes("las camaras van incluidas") ||
    text.includes("va aparte la instalacion") ||
    text.includes("tengo que pagar aparte por las camaras");

  const asksIncludedEnglish =
    rawText.includes("is installation included") ||
    rawText.includes("does that include installation") ||
    rawText.includes("with installation and cameras") ||
    rawText.includes("are the cameras included") ||
    rawText.includes("do i pay separately for the cameras");

  const asksInternetSpanish =
    text.includes("ocupa internet") ||
    text.includes("necesita internet") ||
    text.includes("se ocupa internet");

  const asksInternetEnglish =
    rawText.includes("do i need internet") ||
    rawText.includes("need internet") ||
    rawText.includes("internet needed");

  const asksMonthlySpanish =
    text.includes("mensualidad") ||
    text.includes("pago mensual") ||
    text.includes("mensual");

  const asksMonthlyEnglish =
    rawText.includes("no monthly") ||
    rawText.includes("monthly fee") ||
    rawText.includes("monthly payment");

  const asksPhoneViewSpanish =
    text.includes("se pueden ver en el celular") ||
    text.includes("las puedo ver en mi celular") ||
    text.includes("se miran en el telefono") ||
    text.includes("las veo desde el celular");

  const asksPhoneViewEnglish =
    rawText.includes("see on my phone") ||
    rawText.includes("view on my phone") ||
    rawText.includes("see from my phone") ||
    rawText.includes("remote viewing");

  if (language === "spanish") {
        if (priceInquiry.type === "weak_price_opener") {
      return "Claro, con gusto. Primero para orientarle bien, ¿es para casa o negocio?";
    }

    if (priceInquiry.type === "specific_price_request") {
      return spanishPriceReply(spanishStyle, depth.level);
    }

    if (priceInquiry.type === "contextual_price_request") {
      return "Claro. Con lo que ya me comentó, el precio depende un poco de la propiedad y de cuántas cámaras realmente convengan, pero los paquetes empiezan desde $700 ya instalados. ¿Quiere cubrir solo las áreas principales o toda la propiedad?";
    }
    if (asksCardSpanish) {
      return spanishCardReply();
    }

    if (asksPaymentPlanSpanish) {
      return spanishPaymentPlanReply();
    }

    if (asksIncludedSpanish) {
      return spanishIncludedReply();
    }

    if (asksInternetSpanish) {
      return spanishInternetReply();
    }

    if (asksMonthlySpanish) {
      return spanishMonthlyReply();
    }

    if (asksPhoneViewSpanish) {
      return spanishPhoneViewReply();
    }

    if (asksForTwoOrThreeCamerasSpanish) {
      return spanishSmallJobReply(spanishStyle);
    }

    if (depth.reason === "confusion_signal") {
      if (text.includes("como funciona") || text.includes("how does this work")) {
        return spanishHowItWorksReply();
      }

      if (text.includes("como se ve") || text.includes("que tal se ve") || text.includes("como se mira")) {
        return spanishHowItLooksReply();
      }
    }

    switch (intent) {
      case "price":
        return spanishPriceReply(spanishStyle, depth.level);
      case "info":
        return spanishInfoReply(spanishStyle, depth.level);
      case "night_vision":
        return spanishNightReply(spanishStyle);
      case "wired":
        return spanishWiredReply(spanishStyle);
      case "install_only":
        return spanishInstallOnlyReply(spanishStyle);
      case "expensive":
        return spanishExpensiveReply(spanishStyle);
      case "recording":
        return spanishRecordingReply(spanishStyle);
      case "weekend":
        return spanishWeekendReply(spanishStyle);
      case "greeting":
        return spanishGreetingReply(spanishStyle, depth.level);
      case "home":
        return "Perfecto. ¿En qué ciudad o código postal está la casa?";
      case "business":
        return "Perfecto. ¿En qué ciudad o código postal está el negocio?";
      default:
        if (depth.level === "level_3_problem_solution") {
          return spanishInfoReply(spanishStyle, depth.level);
        }

        return spanishUnknownReply(spanishStyle);
    }
  }
  if (priceInquiry.type === "weak_price_opener") {
    return "Sure, I can help. First, is it for a house or a business?";
  }

  if (priceInquiry.type === "specific_price_request") {
    return englishPriceReply(depth.level);
  }

  if (priceInquiry.type === "contextual_price_request") {
    return "Sure. Based on what you already told me, the price depends a bit on the property and how many cameras actually make sense, but packages start at $700 installed. Are you mainly trying to cover the main areas or the whole property?";
  }
  if (asksCardEnglish) {
    return englishCardReply();
  }

  if (asksPaymentPlanEnglish) {
    return englishPaymentPlanReply();
  }

  if (asksIncludedEnglish) {
    return englishIncludedReply();
  }

  if (asksInternetEnglish) {
    return englishInternetReply();
  }

  if (asksMonthlyEnglish) {
    return englishMonthlyReply();
  }

  if (asksPhoneViewEnglish) {
    return englishPhoneViewReply();
  }

  if (asksForTwoOrThreeCamerasEnglish) {
    return englishSmallJobReply();
  }

  if (depth.reason === "confusion_signal") {
    if (rawText.includes("how does this work")) {
      return englishHowItWorksReply();
    }

    if (rawText.includes("how does it look") || rawText.includes("what does it look like")) {
      return englishHowItLooksReply();
    }
  }

  if (
    text.includes("what type of cameras") ||
    text.includes("what cameras are those") ||
    text.includes("what type of cameras are we talking about") ||
    text.includes("what kind of cameras")
  ) {
    return "The standard option uses reliable hardwired systems, and better upgraded options like Reolink are available too. The right one depends on the property and the budget. Is it for a house or a business?";
  }

  if (
    text.includes("4 cameras for $700") ||
    text.includes("are they cheap") ||
    text.includes("are those cameras cheap")
  ) {
    return "Most standard 4-camera setups start at $700 installed. That includes the cameras and installation, and the final price depends on the layout, distance, and system type. Is it for a house or a business?";
  }

  if (
    rawText.includes("still looking") ||
    rawText.includes("looking into different camera options") ||
    rawText.includes("i will let you know when i decide")
  ) {
    return "No problem. I can still help narrow down what setup makes the most sense before you decide. Is it for a house or a business?";
  }

  if (rawText.includes("too expensive") || rawText.includes("expensive")) {
    return englishExpensiveReply();
  }

  if (rawText.includes("just looking")) {
    return "No problem. I can help narrow it down without overcomplicating it. Is this for a house or a business?";
  }

  if (
    rawText.includes("send me prices") ||
    rawText.includes("send prices") ||
    rawText.includes("send me pricing")
  ) {
    return englishPriceReply(depth.level);
  }

  if (
    rawText.includes("i need to think about it") ||
    rawText.includes("let me think about it")
  ) {
    return "Of course. A lot of people just want something simple and reliable. I can help narrow it down before you decide. Is this for a house or a business?";
  }

  if (
    rawText.includes("ask my husband") ||
    rawText.includes("ask my wife") ||
    rawText.includes("talk to my husband") ||
    rawText.includes("talk to my wife")
  ) {
    return "Of course. The simple way to explain it is this: most standard 4-camera setups start at $700 installed, with cameras and installation included. What city is the property in?";
  }

  if (
    rawText.includes("where are you located") ||
    rawText.includes("where are you guys located") ||
    rawText.includes("what is your address")
  ) {
    return "We work in Kern County, including Bakersfield and nearby areas. What city is the property in?";
  }

  if (
    rawText.includes("can you come today") ||
    rawText.includes("can you come now") ||
    rawText.includes("can someone come today")
  ) {
    return "I can check availability. Same-day depends on the schedule and the location. What city is the property in, and about how many cameras are you looking for?";
  }

  if (
    rawText.includes("reolink") ||
    rawText.includes("better brand") ||
    rawText.includes("better quality")
  ) {
    return "Yes, Reolink is available as an upgraded option. It usually costs more than the standard setup, but it has a cleaner app experience and stronger equipment options. Are you looking for the standard option or the upgraded Reolink setup?";
  }

  if (intent === "price" || rawText.includes("price") || rawText.includes("cost") || rawText.includes("how much")) {
    return englishPriceReply(depth.level);
  }

  if (intent === "info") {
    return englishInfoReply(depth.level);
  }

  if (intent === "install_only") {
    return englishInstallOnlyReply();
  }

  if (intent === "recording") {
    return englishRecordingReply();
  }

  if (intent === "greeting" || rawText.includes("hello") || rawText.includes("hi")) {
    return englishGreetingReply(depth.level);
  }

  if (depth.level === "level_3_problem_solution") {
    return englishInfoReply(depth.level);
  }

  return englishUnknownReply();
}