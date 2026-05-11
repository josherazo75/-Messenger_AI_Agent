import { detectPriceInquiryType } from "../services/price-inquiry.service";

const contactId = "test-contact";

const samples = [
  "Precio",
  "Cuanto",
  "Price",
  "How much",
  "Cuanto por 4 camaras",
  "Price for 6 cameras",
  "How much for 4 cameras installed",
  "Precio con instalación",
  "Costo",
];

for (const sample of samples) {
  const result = detectPriceInquiryType(contactId, sample);

  console.log("======================================");
  console.log("Message:", sample);
  console.log("Type:", result.type);
  console.log("Reasons:", result.reasons.join(" | "));
}