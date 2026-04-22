import { Router, type Request, type Response, type NextFunction } from "express";
import { authenticateJWT, type AuthRequest } from "../middleware/auth.js";
import * as svc from "../services/deal.service.js";

const router = Router();
router.use(authenticateJWT);

router.get("/", async (_req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getAllDeals()); } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deal = await svc.createDeal({ ...req.body, agentId: req.userId });
    res.status(201).json(deal);
  } catch (err) { next(err); }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await svc.getDealById(Number(req.params.id))); }
  catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.patch("/:id/stage", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await svc.updateDealStage(Number(req.params.id), req.body.stage)); }
  catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.get("/:id/commission", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const d = await svc.getDealById(Number(req.params.id));
    res.json({ commission: svc.calculateCommission(d.salePrice, d.commissionRate) });
  } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

export default router;
