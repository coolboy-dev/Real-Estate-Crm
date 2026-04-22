import { Router, Request, Response, NextFunction } from "express";
import { authenticateJWT, type AuthRequest } from "../middleware/auth.js";
import * as svc from "../services/followup.service.js";


const router = Router();
router.use(authenticateJWT);

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(
      await svc.createFollowUp({ ...req.body, agentId: req.userId })
    );
  } catch (err) { next(err); }
});

router.patch("/:id/done", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await svc.markDone(Number(req.params.id))); }
  catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

export default router;
