import express from "express";
import dotenv from "dotenv";
import webhookRoutes from "./routes/webhook.routes";
import { initializeDatabase } from "./config/database";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Messenger AI Agent server is running.");
});

app.use("/", webhookRoutes);

initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});