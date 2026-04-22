import { Lead, type LeadStatus, type LeadSource } from "../models/Lead.js";

export async function createLead(data: {
  name: string;
  phone: string;
  email?: string;
  budget?: number;
  preferences?: string;
  source: LeadSource;
  assignedAgentId?: number;
}) {
  return Lead.create(data as any);
}

export async function getAllLeads(agentId?: number) {
  const where: any = {};
  if (agentId) where.assignedAgentId = agentId;
  return Lead.findAll({ where, order: [["createdAt", "DESC"]] });
}

export async function getLeadById(id: number) {
  const lead = await Lead.findByPk(id);
  if (!lead) throw Object.assign(new Error("Lead not found"), { status: 404 });
  return lead;
}

export async function updateLeadStatus(id: number, status: LeadStatus) {
  const lead = await getLeadById(id);
  lead.status = status;
  return lead.save();
}

export async function assignLead(id: number, agentId: number) {
  const lead = await getLeadById(id);
  lead.assignedAgentId = agentId;
  return lead.save();
}

export async function deleteLead(id: number) {
  const lead = await getLeadById(id);
  await lead.destroy();
}
