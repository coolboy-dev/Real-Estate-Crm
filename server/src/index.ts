import express from "express";
import cors from "cors";
import * as helmet from 'helmet';
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import clientRoutes from "./routes/client.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import userRoutes from "./routes/user.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import followupRoutes from "./routes/followup.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { startFollowUpJob } from "./jobs/followup.job.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter.js";
import { env } from "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", apiLimiter);

app.use("/api/leads", leadRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);

import { User } from "./models/User.js";
import bcrypt from "bcryptjs";

async function bootstrapAdmin() {
  try {
    const adminEmail = "admin@example.com";
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      const hashedPass = await bcrypt.hash("Password123", 10);
      await User.create({
        name: "Default Admin",
        email: adminEmail,
        password: hashedPass,
        role: "admin"
      } as any);
      console.log("✅ Auto-Bootstrap: Admin account created (admin@example.com)");
    } else {
      console.log("ℹ️ Auto-Bootstrap: Admin account already exists");
    }
  } catch (error) {
    console.error("❌ Auto-Bootstrap failed:", error);
  }
}

// Start the server
connectDB().then(async () => {
  await bootstrapAdmin();
  startFollowUpJob();
  app.listen(env.PORT, () =>
    console.log(`Server running on port ${env.PORT}`)
  );
}).catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
