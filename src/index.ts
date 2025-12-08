import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import path from "path";
import cors from "cors";
import connectDB from "./config/db";

import restaurantRoutes from "./routes/restaurant";
import dishRoutes from "./routes/dish";
import drinkRoutes from "./routes/drink";
import menuRoutes from "./routes/menu";
import promotionRoutes from "./routes/promotion";
import tableRoutes from "./routes/table";
import authRoutes from "./routes/auth";

import { errorHandler } from "./middlewares/errorHandler";



const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

connectDB();

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/restaurant", restaurantRoutes);
app.use("/dishes", dishRoutes);
app.use("/drinks", drinkRoutes);
app.use("/menus", menuRoutes);
app.use("/promotions", promotionRoutes);
app.use("/tables", tableRoutes);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API correctamente iniciado en el puerto ${PORT}`);
});
