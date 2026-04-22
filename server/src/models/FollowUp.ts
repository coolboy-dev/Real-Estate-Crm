import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export interface FollowUpAttributes {
  id: number;
  scheduledAt: Date;
  note: string;
  done: boolean;
  agentId: number;
  leadId: number | null;
  clientId: number | null;
}

export class FollowUp extends Model<FollowUpAttributes>
  implements FollowUpAttributes {
  declare id: number;
  declare scheduledAt: Date;
  declare note: string;
  declare done: boolean;
  declare agentId: number;
  declare leadId: number | null;
  declare clientId: number | null;
}

FollowUp.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    scheduledAt: { type: DataTypes.DATE, allowNull: false },
    note: { type: DataTypes.TEXT, defaultValue: "" },
    done: { type: DataTypes.BOOLEAN, defaultValue: false },
    agentId: { type: DataTypes.INTEGER, allowNull: false },
    leadId: { type: DataTypes.INTEGER, allowNull: true },
    clientId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: "follow_ups" }
);
