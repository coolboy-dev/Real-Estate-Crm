import { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.js";
import type { UserRole } from "../models/User.js";

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole as UserRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
