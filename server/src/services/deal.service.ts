import { Deal, type DealStage } from "../models/Deal.js";

export async function createDeal(data: {
  title: string;
  salePrice: number;
  commissionRate: number;
  clientId: number;
  propertyId: number;
  agentId: number;
}) {
  return Deal.create(data as any);
}

export async function getAllDeals() {
  return Deal.findAll({ order: [["createdAt", "DESC"]] });
}

export async function getDealById(id: number) {
  const d = await Deal.findByPk(id);
  if (!d) throw Object.assign(new Error("Deal not found"), { status: 404 });
  return d;
}

export async function updateDealStage(id: number, stage: DealStage) {
  const d = await getDealById(id);
  d.stage = stage;
  return d.save();
}

export function calculateCommission(salePrice: number, rate: number): number {
  return (salePrice * rate) / 100;
}
