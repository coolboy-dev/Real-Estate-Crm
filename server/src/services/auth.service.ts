import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, type UserRole } from "../models/User.js";
import { env } from "../config/env.js";

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole
) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error("Email already registered");
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role } as any);
  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET as string, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
  return { token, user: { id: user.id, name: user.name, role: user.role } };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET as string, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
  return { token, user: { id: user.id, name: user.name, role: user.role } };
}
