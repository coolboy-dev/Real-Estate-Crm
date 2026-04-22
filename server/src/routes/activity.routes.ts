import { Router, Request, Response, NextFunction } from "express";
import { authenticateJWT, type AuthRequest } from "../middleware/auth.js";
import * as svc from "../services/activity.service.js";

const router = Router();
router.use(authenticateJWT);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.getActivities(req.query as any)); } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(
      await svc.logActivity({ ...req.body, agentId: req.userId })
    );
  } catch (err) { next(err); }
});

export default router;
