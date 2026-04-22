import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export type PropertyType = "residential" | "commercial";
export type PropertyStatus = "available" | "sold" | "rented" | "unavailable";

export interface PropertyAttributes {
  id: number;
  title: string;
  type: PropertyType;
  location: string;
  price: number;
  sizeSqft: number;
  amenities: string;
  imageUrls: string[];
  status: PropertyStatus;
  agentId: number | null;
  latitude: number | null;
  longitude: number | null;
}

export class Property extends Model<PropertyAttributes>
  implements PropertyAttributes {
  declare id: number;
  declare title: string;
  declare type: PropertyType;
  declare location: string;
  declare price: number;
  declare sizeSqft: number;
  declare amenities: string;
  declare imageUrls: string[];
  declare status: PropertyStatus;
  declare agentId: number | null;
  declare latitude: number | null;
  declare longitude: number | null;
}

Property.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM("residential", "commercial"),
      allowNull: false,
    },
    location: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    sizeSqft: { type: DataTypes.FLOAT, defaultValue: 0 },
    amenities: { type: DataTypes.TEXT, defaultValue: "" },
    imageUrls: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    status: {
      type: DataTypes.ENUM("available", "sold", "rented", "unavailable"),
      defaultValue: "available",
    },
    agentId: { type: DataTypes.INTEGER, allowNull: true },
    latitude: { type: DataTypes.FLOAT, allowNull: true },
    longitude: { type: DataTypes.FLOAT, allowNull: true },
  },
  { sequelize, tableName: "properties" }
);
