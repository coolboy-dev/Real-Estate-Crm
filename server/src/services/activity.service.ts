import { Activity, type ActivityType } from "../models/Activity.js";

export async function logActivity(data: {
  type: ActivityType;
  notes: string;
  agentId: number;
  leadId?: number;
  clientId?: number;
  dealId?: number;
}) {
  return Activity.create(data as any);
}

export async function getActivities(filters: {
  leadId?: number;
  clientId?: number;
  dealId?: number;
}) {
  const where: any = {};
  if (filters.leadId) where.leadId = filters.leadId;
  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.dealId) where.dealId = filters.dealId;
  return Activity.findAll({ where, order: [["createdAt", "DESC"]] });
}
