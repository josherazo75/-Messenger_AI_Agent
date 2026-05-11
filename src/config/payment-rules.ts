export const PAYMENT_RULES = {
  cardsAccepted: true,
  cashAccepted: true,
  zelleAccepted: false,
  cashAppAccepted: false,
  paymentPlansAvailable: false,
  depositRequired: false,
  standardPaymentExplanation:
    "Most installs are paid when the job is completed unless otherwise confirmed.",
  monthlyFeeForLocalRecording: false,
  camerasAndInstallationIncludedInStandardPackage: true,
  internetNeededForLocalRecording: false,
  internetNeededForRemoteViewing: true,
} as const;