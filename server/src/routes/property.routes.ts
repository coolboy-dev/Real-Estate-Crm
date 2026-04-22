import { Router, Request, Response, NextFunction } from "express";
import { authenticateJWT, type AuthRequest } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { upload, fileUrl } from "../services/upload.service.js";
import * as svc from "../services/property.service.js";

const router = Router();
router.use(authenticateJWT);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await svc.getProperties(req.query as any));
  } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const property = await svc.createProperty({
      ...req.body,
      agentId: req.userId,
    });
    res.status(201).json(property);
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await svc.getPropertyById(Number(req.params.id)));
  } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.put("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await svc.updateProperty(Number(req.params.id), req.body));
  } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.post("/:id/images", upload.array("images", 10),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const files = (req.files as Express.Multer.File[]) ?? [];
      const urls = files.map((f) => fileUrl(f.filename));
      res.json(await svc.addPropertyImages(Number(req.params.id), urls));
    } catch (err) { next(err); }
  }
);

router.delete("/:id", requireRole("admin", "manager"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await svc.deleteProperty(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
  }
);

export default router;
