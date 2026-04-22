import { Client } from "../models/Client.js";

export async function createClient(data: Partial<Client>) {
  return Client.create(data as any);
}

export async function getAllClients() {
  return Client.findAll({ order: [["createdAt", "DESC"]] });
}

export async function getClientById(id: number) {
  const c = await Client.findByPk(id);
  if (!c) throw Object.assign(new Error("Client not found"), { status: 404 });
  return c;
}

export async function updateClient(id: number, data: Partial<Client>) {
  const c = await getClientById(id);
  return c.update(data);
}
