import { Router, Request, Response, NextFunction } from "express";
import { authenticateJWT, type AuthRequest } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import * as svc from "../services/lead.service.js";


const router = Router();

// Public: called by website contact forms
router.post("/webhook", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await svc.createLead({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      budget: req.body.budget ?? 0,
      preferences: req.body.preferences ?? "",
      source: "website",
    });
    res.status(201).json({ id: lead.id, message: "Lead received" });
  } catch (err) { next(err); }
});

router.use(authenticateJWT);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const agentId = req.userRole === "agent" ? req.userId : undefined;
    res.json(await svc.getAllLeads(agentId));
  } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await svc.createLead({
      ...req.body,
      assignedAgentId: req.body.assignedAgentId ?? req.userId,
    });
    res.status(201).json(lead);
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await svc.getLeadById(Number(req.params.id)));
  } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.patch("/:id/status", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await svc.updateLeadStatus(Number(req.params.id), req.body.status));
  } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.patch("/:id/assign", requireRole("admin", "manager"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await svc.assignLead(Number(req.params.id), req.body.agentId));
    } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
  }
);

router.delete("/:id", requireRole("admin", "manager"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await svc.deleteLead(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
  }
);

export default router;
