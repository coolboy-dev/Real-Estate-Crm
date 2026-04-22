import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export type DealStage = "negotiation" | "agreement" | "closed";

export interface DealAttributes {
  id: number;
  title: string;
  stage: DealStage;
  salePrice: number;
  commissionRate: number; // percentage e.g. 2.5
  clientId: number;
  propertyId: number;
  agentId: number;
}

export class Deal extends Model<DealAttributes> implements DealAttributes {
  declare id: number;
  declare title: string;
  declare stage: DealStage;
  declare salePrice: number;
  declare commissionRate: number;
  declare clientId: number;
  declare propertyId: number;
  declare agentId: number;
}

Deal.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    stage: {
      type: DataTypes.ENUM("negotiation", "agreement", "closed"),
      defaultValue: "negotiation",
    },
    salePrice: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    commissionRate: { type: DataTypes.FLOAT, defaultValue: 2.5 },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    propertyId: { type: DataTypes.INTEGER, allowNull: false },
    agentId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: "deals" }
);
