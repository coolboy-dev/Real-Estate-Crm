import { Op } from "sequelize";
import { Property, type PropertyStatus } from "../models/Property.js";

export async function createProperty(data: Partial<Property>) {
  return Property.create(data as any);
}

export async function getProperties(filters: {
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) {
  const where: any = {};
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { [Op.gte]: filters.minPrice } : {}),
      ...(filters.maxPrice ? { [Op.lte]: filters.maxPrice } : {}),
    };
  }
  if (filters.search) {
    where.title = { [Op.iLike]: `%${filters.search}%` };
  }
  return Property.findAll({ where, order: [["createdAt", "DESC"]] });
}

export async function getPropertyById(id: number) {
  const p = await Property.findByPk(id);
  if (!p) throw Object.assign(new Error("Property not found"), { status: 404 });
  return p;
}

export async function updateProperty(id: number, data: Partial<Property>) {
  const p = await getPropertyById(id);
  return p.update(data);
}

export async function addPropertyImages(id: number, urls: string[]) {
  const p = await getPropertyById(id);
  p.imageUrls = [...p.imageUrls, ...urls];
  return p.save();
}

export async function deleteProperty(id: number) {
  const p = await getPropertyById(id);
  await p.destroy();
}
