export type UserRole = "admin" | "manager" | "agent";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "lost";
export type LeadSource = "website" | "ads" | "call" | "referral" | "other";
export type PropertyType = "residential" | "commercial";
export type PropertyStatus = "available" | "sold" | "rented" | "unavailable";
export type DealStage = "negotiation" | "agreement" | "closed";
export type ClientType = "buyer" | "seller";
export type ActivityType = "call" | "sms" | "email" | "note";

export interface User { id: number; name: string; role: UserRole; email: string; }
export interface AuthState { token: string; user: User; }

export interface Lead {
  id: number; name: string; phone: string; email: string;
  budget: number; preferences: string; status: LeadStatus;
  source: LeadSource; assignedAgentId: number | null;
}

export interface Property {
  id: number; title: string; type: PropertyType; location: string;
  price: number; sizeSqft: number; amenities: string;
  imageUrls: string[]; status: PropertyStatus;
  agentId: number | null; latitude: number | null; longitude: number | null;
}

export interface Client {
  id: number; name: string; phone: string; email: string;
  type: ClientType; preferences: string; leadId: number | null;
}

export interface Deal {
  id: number; title: string; stage: DealStage;
  salePrice: number; commissionRate: number;
  clientId: number; propertyId: number; agentId: number;
}

export interface Activity {
  id: number; type: ActivityType; notes: string;
  agentId: number; leadId: number | null;
  clientId: number | null; dealId: number | null;
  createdAt: string;
}
