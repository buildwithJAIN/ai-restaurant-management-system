import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import menuItemRoutes from "./routes/menuitem.routes.js";
import staffRoute from "./routes/staffRoute.js"
import tableRoutes from "./routes/tableRoutes.js";
import orderRoute from "./routes/orderRoute.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import chefRoutes from "./routes/chefRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js"
import menuImportRoutes from "./routes/menuImportRoutes.js";
import billingRoutes from "./routes/billingRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get('/', (req, res) => {
  res.send('Restaurant Management API is running 🍜');
});
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuItemRoutes);
app.use("/api/staff", staffRoute);
app.use("/api/tables", tableRoutes);
app.use('/api/orders', orderRoute);
app.use('/api/categories', categoryRoutes);
app.use("/api/chef", chefRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/aimenu", menuImportRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/reports", reportRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
