import express from "express";
import cors from "cors";
import helmet from "helmet";
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

const isMain = process.argv[1] && (fileURLToPath(import.meta.url) === path.resolve(process.argv[1]));

if (isMain) {
  connectDB().then(() => {
    startFollowUpJob();
    app.listen(env.PORT, () =>
      console.log(`Server running on port ${env.PORT}`)
    );
  });
}

export default app;
