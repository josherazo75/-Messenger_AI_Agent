import { Intent } from "./intent.service";

export type CloserMove =
  | "ask_property_type"
  | "ask_city"
  | "ask_camera_count"
  | "offer_schedule"
  | "offer_budget_option"
  | "none";

export interface CloserDecision {
  move: CloserMove;
  reason: string;
}

export function chooseCloserMove(intent: Intent): CloserDecision {
  if (intent === "price" || intent === "info") {
    return {
      move: "ask_property_type",
      reason: "price/info questions should move into qualification",
    };
  }

  if (intent === "night_vision" || intent === "wired" || intent === "recording") {
    return {
      move: "ask_camera_count",
      reason: "technical questions should move toward package sizing",
    };
  }

  if (intent === "install_only") {
    return {
      move: "ask_camera_count",
      reason: "installation-only question should gather scope",
    };
  }

  if (intent === "expensive") {
    return {
      move: "offer_budget_option",
      reason: "budget objection should open a lower-cost path",
    };
  }

  if (intent === "weekend") {
    return {
      move: "offer_schedule",
      reason: "timing message is close to booking",
    };
  }

  if (intent === "home" || intent === "business") {
    return {
      move: "ask_city",
      reason: "property type is known, next is location",
    };
  }

  return {
    move: "none",
    reason: "no closer move needed",
  };
}