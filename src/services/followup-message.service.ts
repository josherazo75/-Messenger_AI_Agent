function normalize(text?: string): string {
  return (text || "").trim().toLowerCase();
}

export function buildFollowUpMessage(lastQuestion: string, followUpCount: number): string {
  const question = normalize(lastQuestion);

  const isHomeBusiness = question.includes("home or business") || question.includes("casa o negocio");
  const isCityZip = question.includes("city or zip") || question.includes("ciudad o código postal") || question.includes("ciudad o codigo postal");
  const isCameras = question.includes("how many cameras") || question.includes("cuántas cámaras") || question.includes("cuantas camaras");
  const isTimeline = question.includes("how soon") || question.includes("qué tan pronto") || question.includes("que tan pronto");

  if (followUpCount === 0) {
    if (isHomeBusiness) {
      return "Just following up here. Is this for your home or business?";
    }

    if (isCityZip) {
      return "Just checking back in. What city or zip code is the property in?";
    }

    if (isCameras) {
      return "Just following up. About how many cameras do you need?";
    }

    if (isTimeline) {
      return "Just checking in. How soon are you looking to get this done?";
    }

    return "Just following up to see if you still need help.";
  }

  if (followUpCount === 1) {
    if (isHomeBusiness) {
      return "Wanted to check back in. Is this for your home or business so I can point you the right way?";
    }

    if (isCityZip) {
      return "Wanted to follow up. What city or zip code is the property in?";
    }

    if (isCameras) {
      return "Quick follow-up here. About how many cameras are you looking for?";
    }

    if (isTimeline) {
      return "Quick follow-up. How soon were you looking to get this done?";
    }

    return "Wanted to check back in and see if you still need help.";
  }

  if (followUpCount === 2) {
    if (isHomeBusiness) {
      return "Last follow-up from me for now. If you'd like, let me know if this is for your home or business and I’ll point you the right way.";
    }

    if (isCityZip) {
      return "Last follow-up for now. Send me the city or zip code whenever you're ready.";
    }

    if (isCameras) {
      return "Last follow-up for now. Send me the camera count whenever you're ready.";
    }

    if (isTimeline) {
      return "Last follow-up for now. Let me know your timeline whenever you're ready.";
    }

    return "Last follow-up from me for now. Reach out anytime if you still need help.";
  }

  return "Reach out anytime if you still need help.";
}