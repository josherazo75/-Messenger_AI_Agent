interface PostQualificationInput {
  propertyType?: string | null;
  cityOrZip?: string | null;
  cameraCount?: string | null;
  timeline?: string | null;
  language: "spanish" | "english" | "unknown";
}

function isUrgentTimeline(timeline?: string | null): boolean {
  const text = (timeline || "").toLowerCase().trim();

  return (
    text.includes("hoy") ||
    text.includes("mañana") ||
    text.includes("manana") ||
    text.includes("esta semana") ||
    text.includes("este fin de semana") ||
    text.includes("today") ||
    text.includes("tomorrow") ||
    text.includes("this week") ||
    text.includes("asap")
  );
}

function getCameraCountNumber(cameraCount?: string | null): number | null {
  if (!cameraCount) {
    return null;
  }

  const match = cameraCount.match(/\d+/);
  if (!match) {
    return null;
  }

  return Number(match[0]);
}

export function buildPostQualificationClose(input: PostQualificationInput): string {
  const isSpanish = input.language === "spanish";
  const urgent = isUrgentTimeline(input.timeline);
  const cameraCount = getCameraCountNumber(input.cameraCount);
  const biggerJob = cameraCount !== null && cameraCount >= 5;

  if (isSpanish) {
    if (urgent && biggerJob) {
      return "Perfecto. Esto ya se ve como un trabajo serio y le puedo dar seguimiento rápido. Un especialista puede revisar su información y ayudarle a agendar lo antes posible.";
    }

    if (urgent) {
      return "Perfecto. Gracias por la información. Un especialista puede revisar esto y darle seguimiento pronto para ayudarle a agendar.";
    }

    if (biggerJob) {
      return "Perfecto. Gracias por la información. Esto parece una instalación más completa. Un especialista puede revisar su caso y darle seguimiento con la mejor opción.";
    }

    return "Gracias. Un especialista puede revisar esto y darle seguimiento pronto.";
  }

  if (urgent && biggerJob) {
    return "Perfect. This looks like a larger job and we can follow up quickly. A specialist can review your information and help you schedule as soon as possible.";
  }

  if (urgent) {
    return "Perfect. Thanks for the information. A specialist can review this and follow up shortly to help you schedule.";
  }

  if (biggerJob) {
    return "Perfect. Thanks for the information. This looks like a more complete installation. A specialist can review your case and follow up with the best option.";
  }

  return "Thanks. A specialist can review this and follow up with you shortly.";
}