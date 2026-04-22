import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "lost";
export type LeadSource = "website" | "ads" | "call" | "referral" | "other";

export interface LeadAttributes {
  id: number;
  name: string;
  phone: string;
  email: string;
  budget: number;
  preferences: string;
  status: LeadStatus;
  source: LeadSource;
  assignedAgentId: number | null;
}

export class Lead extends Model<LeadAttributes> implements LeadAttributes {
  declare id: number;
  declare name: string;
  declare phone: string;
  declare email: string;
  declare budget: number;
  declare preferences: string;
  declare status: LeadStatus;
  declare source: LeadSource;
  declare assignedAgentId: number | null;
}

Lead.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    budget: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    preferences: { type: DataTypes.TEXT, defaultValue: "" },
    status: {
      type: DataTypes.ENUM("new", "contacted", "qualified", "closed", "lost"),
      defaultValue: "new",
    },
    source: {
      type: DataTypes.ENUM("website", "ads", "call", "referral", "other"),
      defaultValue: "other",
    },
    assignedAgentId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: "leads" }
);
