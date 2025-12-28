import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import routes from "./routes/routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

app.use("/api", routes);

connectDB();

app.listen(PORT, () => {
  console.log("Server started on PORT:", PORT);
});
