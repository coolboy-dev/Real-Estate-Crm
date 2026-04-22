import { Router, Request, Response, NextFunction } from "express";
import { authenticateJWT, type AuthRequest } from "../middleware/auth.js";
import * as svc from "../services/client.service.js";

const router = Router();
router.use(authenticateJWT);

router.get("/", async (_req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getAllClients()); } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await svc.createClient(req.body)); } catch (err) { next(err); }
});

router.get("/:id", async (req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getClientById(Number(req.params.id))); }
  catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.put("/:id", async (req, res: Response, next: NextFunction) => {
  try { res.json(await svc.updateClient(Number(req.params.id), req.body)); }
  catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

export default router;
