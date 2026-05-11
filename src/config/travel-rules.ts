export const TRAVEL_RULES = {
  localAreaKeywords: ["bakersfield", "kern county"],
  nearbyAreas: ["shafter", "delano", "wasco", "taft", "arvin", "lamont"],

  farTravelNeedsReview: true,
  smallJobFarTravelNeedsApproval: true,
  smallJobDefinitionMaxCameras: 3,

  longDistanceMessageEnglish:
    "For that distance, it depends on the size of the job. For smaller installs, I would need to check the area first.",
  longDistanceMessageSpanish:
    "Para esa distancia depende del tamaño del trabajo. Si son pocas cámaras, primero tendría que revisar la zona.",

  smallLocalJobEnglish:
    "Yes, 2 or 3 cameras can be possible in some cases, especially if the property is local.",
  smallLocalJobSpanish:
    "Sí, se puede hacer con 2 o 3 cámaras en algunos casos, sobre todo si la propiedad está local.",

  smallFarJobEnglish:
    "For 2 or 3 cameras, it depends a lot on the distance. If the property is farther out, I would need to review the area first.",
  smallFarJobSpanish:
    "Para 2 o 3 cámaras depende mucho de la distancia. Si la propiedad está retirada, primero tendría que revisar la zona.",

  smallJobPricingEnglish:
    "For 2 or 3 cameras, the price can be a little lower, but usually it is not a huge difference because the installation work, travel, and setup are still there.",
  smallJobPricingSpanish:
    "Para 2 o 3 cámaras, sí puede bajar un poco, pero normalmente no es mucha la diferencia porque el trabajo, la vuelta, la instalación y la configuración siguen siendo casi lo mismo.",
} as const;