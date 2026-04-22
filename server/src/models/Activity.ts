import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export type ActivityType = "call" | "sms" | "email" | "note";

export interface ActivityAttributes {
  id: number;
  type: ActivityType;
  notes: string;
  agentId: number;
  leadId: number | null;
  clientId: number | null;
  dealId: number | null;
}

export class Activity extends Model<ActivityAttributes>
  implements ActivityAttributes {
  declare id: number;
  declare type: ActivityType;
  declare notes: string;
  declare agentId: number;
  declare leadId: number | null;
  declare clientId: number | null;
  declare dealId: number | null;
}

Activity.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    type: {
      type: DataTypes.ENUM("call", "sms", "email", "note"),
      allowNull: false,
    },
    notes: { type: DataTypes.TEXT, defaultValue: "" },
    agentId: { type: DataTypes.INTEGER, allowNull: false },
    leadId: { type: DataTypes.INTEGER, allowNull: true },
    clientId: { type: DataTypes.INTEGER, allowNull: true },
    dealId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: "activities" }
);
