import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export type ClientType = "buyer" | "seller";

export interface ClientAttributes {
  id: number;
  name: string;
  phone: string;
  email: string;
  type: ClientType;
  preferences: string;
  leadId: number | null;
}

export class Client extends Model<ClientAttributes>
  implements ClientAttributes {
  declare id: number;
  declare name: string;
  declare phone: string;
  declare email: string;
  declare type: ClientType;
  declare preferences: string;
  declare leadId: number | null;
}

Client.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    type: { type: DataTypes.ENUM("buyer", "seller"), defaultValue: "buyer" },
    preferences: { type: DataTypes.TEXT, defaultValue: "" },
    leadId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: "clients" }
);
