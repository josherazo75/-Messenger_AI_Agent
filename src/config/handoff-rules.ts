export const HANDOFF_RULES = {
  triggerWhenCustomerAsksForExactFinalQuote: true,
  triggerWhenCustomerWantsToSchedule: true,
  triggerWhenCustomerSendsAddress: true,
  triggerWhenCustomerSendsPhoneNumber: true,
  triggerForCommercialJobs: true,
  triggerForSixPlusCameras: true,
  triggerForWarehouseOrYard: true,
  triggerForTrenchingOrMultipleBuildings: true,
  triggerForDiscountAfterExplanation: true,
  triggerForAngryOrConfusedCustomer: true,
  englishHandoffMessage:
    "I can help with the basic info here. For the exact price and schedule, the installer should confirm directly. What is the best phone number?",
  spanishHandoffMessage:
    "Yo le puedo ayudar con la información básica aquí. Para precio exacto y horario, el instalador tendría que confirmar directamente. ¿Cuál es el mejor número?",
} as const;