import { Op } from "sequelize";
import { FollowUp } from "../models/FollowUp.js";

export async function createFollowUp(data: {
  scheduledAt: Date;
  note: string;
  agentId: number;
  leadId?: number;
  clientId?: number;
}) {
  return FollowUp.create(data as any);
}

export async function getDueFollowUps(): Promise<FollowUp[]> {
  return FollowUp.findAll({
    where: {
      done: false,
      scheduledAt: { [Op.lte]: new Date() },
    },
  });
}

export async function markDone(id: number) {
  const f = await FollowUp.findByPk(id);
  if (!f) throw Object.assign(new Error("FollowUp not found"), { status: 404 });
  f.done = true;
  return f.save();
}
