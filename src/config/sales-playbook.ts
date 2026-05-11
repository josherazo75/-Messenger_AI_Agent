export const SALES_PLAYBOOK = {
  philosophy: [
    "Answer clearly",
    "Protect the value of the service",
    "Ask one next best question",
    "Do not dump all information at once",
    "Do not lead with exact final quote too early",
    "Do not lead with brands unless customer asks",
    "Move serious leads faster",
  ],
  priceRules: {
    useStartsAtLanguage: true,
    preferredPhrases: [
      "starts at",
      "most standard installs",
      "usually",
      "depends on the layout",
      "depends on cable runs, distance, and brand",
    ],
    avoidPhrases: ["lowest price", "cheap package", "today only"],
  },
  behaviorRules: {
    askOneQuestionAtATime: true,
    doNotDiscountEarly: true,
    doNotChaseDesperately: true,
    useSoftClose: true,
    moveHotLeadsFaster: true,
  },
} as const;