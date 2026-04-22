import { sequelize } from "./config/db.js";
import { User } from "./models/User.js";
import { Lead } from "./models/Lead.js";
import { Property } from "./models/Property.js";
import { Client } from "./models/Client.js";
import { Deal } from "./models/Deal.js";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log("Database cleared and synced.");

    const hashedPass = await bcrypt.hash("Password123", 10);

    // 1. Create Agents
    const admin = await User.create({ name: "Julian Thorne", email: "admin@example.com", password: hashedPass, role: "admin" } as any);
    const agent1 = await User.create({ name: "Elena Rossi", email: "elena@example.com", password: hashedPass, role: "agent" } as any);
    const agent2 = await User.create({ name: "Marcus Vane", email: "agent@example.com", password: hashedPass, role: "agent" } as any);

    // 2. Create Luxury Properties (New Delhi / NCR focus for Map)
    const props = await Property.bulkCreate([
      {
        title: "The Obsidian Penthouse",
        description: "Ultra-luxury penthouse with 360-degree skyline views.",
        price: 85000000,
        location: "Amrita Shergill Marg, New Delhi",
        type: "residential",
        status: "available",
        sizeSqft: 4500,
        amenities: ["Private Pool", "Automated Climate", "Concierge"],
        imageUrls: ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070"],
        latitude: 28.6010,
        longitude: 77.2215,
        agentId: agent1.id
      },
      {
        title: "Elysium Corporate Suite",
        description: "Industrial-grade workspace in the financial heart.",
        price: 120000000,
        location: "Cyber City, Gurgaon",
        type: "commercial",
        status: "available",
        sizeSqft: 12000,
        amenities: ["Fiber Optic", "Executive Lounge", "Helipad Access"],
        imageUrls: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"],
        latitude: 28.4950,
        longitude: 77.0890,
        agentId: agent2.id
      },
      {
        title: "Stone & Glass Villa",
        description: "Minimalist brutalist architecture surrounded by greenery.",
        price: 55000000,
        location: "Vasant Vihar, New Delhi",
        type: "residential",
        status: "available",
        sizeSqft: 3800,
        amenities: ["Zen Garden", "Smart Home Hub", "Wine Cellar"],
        imageUrls: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"],
        latitude: 28.5600,
        longitude: 77.1600,
        agentId: agent1.id
      }
    ] as any[]);

    // 3. Create Leads
    const lead1 = await Lead.create({
      name: "Sophia Sterling",
      phone: "+91 98765 43210",
      email: "sophia@sterling.com",
      budget: 90000000,
      source: "website",
      status: "qualified",
      assignedAgentId: agent1.id
    } as any);

    await Lead.create({
      name: "Alexander Knight",
      phone: "+91 99999 11111",
      email: "alex@knightcorp.in",
      budget: 150000000,
      source: "referral",
      status: "new",
      assignedAgentId: agent2.id
    } as any);

    // 4. Create Clients
    const client1 = await Client.create({
      name: "Victor Moretti",
      phone: "+91 88888 77777",
      email: "victor@moretti.io",
      type: "buyer",
      preferences: "Interested in industrial aesthetics and high-floor units."
    } as any);

    // 5. Create Deals
    await Deal.create({
      title: "Obsidian Acquisition - Moretti",
      clientId: client1.id,
      agentId: agent1.id,
      leadId: lead1.id,
      propertyId: props[0]?.id,
      salePrice: 82500000,
      commissionRate: 2.5,
      stage: "negotiation"
    } as any);

    await Deal.create({
      title: "South Block Portfolio Closure",
      clientId: client1.id,
      agentId: agent1.id,
      leadId: lead1.id,
      propertyId: props[2]?.id,
      salePrice: 42000000,
      commissionRate: 3.0,
      stage: "closed"
    } as any);

    console.log("Seeding complete. Systems primed.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
