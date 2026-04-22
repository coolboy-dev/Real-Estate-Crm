import { Router, Request, Response, NextFunction } from "express";
import { authenticateJWT } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { User } from "../models/User.js";

const router = Router();
router.use(authenticateJWT, requireRole("admin"));

router.get("/", async (_req, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role"],
      order: [["name", "ASC"]],
    });
    res.json(users);
  } catch (err) { next(err); }
});

router.patch("/:id/role", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id as string);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = req.body.role;
    await user.save();
    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (err) { next(err); }
});

export default router;
