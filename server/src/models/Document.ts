import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export interface DocumentAttributes {
  id: number;
  filename: string;
  url: string;
  dealId: number | null;
  propertyId: number | null;
}

export class Document extends Model<DocumentAttributes>
  implements DocumentAttributes {
  declare id: number;
  declare filename: string;
  declare url: string;
  declare dealId: number | null;
  declare propertyId: number | null;
}

Document.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    filename: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    dealId: { type: DataTypes.INTEGER, allowNull: true },
    propertyId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: "documents" }
);
