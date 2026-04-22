import { Router, Request, Response, NextFunction } from "express";
import { authenticateJWT, type AuthRequest } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import * as svc from "../services/report.service.js";

const router = Router();
router.use(authenticateJWT, requireRole("admin", "manager"));

router.get("/overview", async (_req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getOverviewKPIs()); } catch (err) { next(err); }
});

router.get("/monthly", async (_req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getMonthlyDeals()); } catch (err) { next(err); }
});

router.get("/agents", async (_req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getAgentPerformance()); } catch (err) { next(err); }
});

router.get("/export", async (_req, res: Response, next: NextFunction) => {
  try {
    const workbook = await svc.exportReportsToExcel();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "Portfolio_Intelligence_Report.xlsx"
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
});

export default router;
