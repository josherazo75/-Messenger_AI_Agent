import { detectSpanishStyle } from "../services/spanish-style.service";

const samples = [
  "Disculpe, me podría dar información acerca de los paquetes de cámaras que tienen?",
  "Buenas, me puede dar mas informacion?",
  "ola k precio tienen las camaras",
  "oiga jefe en cuanto salen las camaras",
  "cuanto cuestan las camaras",
  "ocupo camaras pa casa"
];

for (const sample of samples) {
  console.log("======================================");
  console.log("Message:", sample);
  console.log("Detected style:", detectSpanishStyle(sample));
}