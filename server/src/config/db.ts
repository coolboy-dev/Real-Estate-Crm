import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // use migrations in production
    console.log("DB connected and synced");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
