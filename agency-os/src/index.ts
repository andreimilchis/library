import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";

import agencyUsersRouter from "./routes/agencyUsers";
import leadsRouter from "./routes/leads";
import discoveryMeetingsRouter from "./routes/discoveryMeetings";
import auditsRouter from "./routes/audits";
import offersRouter from "./routes/offers";
import clientsRouter from "./routes/clients";
import contractsRouter from "./routes/contracts";
import invoicesRouter from "./routes/invoices";
import adAccountsRouter from "./routes/adAccounts";
import campaignPerformanceRouter from "./routes/campaignPerformance";
import tasksRouter from "./routes/tasks";
import communicationThreadsRouter from "./routes/communicationThreads";
import reportsRouter from "./routes/reports";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "agency-os", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/agency-users", agencyUsersRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/discovery-meetings", discoveryMeetingsRouter);
app.use("/api/audits", auditsRouter);
app.use("/api/offers", offersRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/contracts", contractsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/ad-accounts", adAccountsRouter);
app.use("/api/campaign-performance", campaignPerformanceRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/communication-threads", communicationThreadsRouter);
app.use("/api/reports", reportsRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Agency OS API running on port ${PORT}`);
});

export default app;
