# Real Estate CRM Module – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Real Estate CRM web application covering lead management, property listings, client tracking, deal pipelines, communications, agent roles, analytics, and third-party integrations.

**Architecture:** REST API backend (Node.js/Express + PostgreSQL) with a React + TypeScript frontend. Auth uses JWT with role-based middleware. Each domain (leads, properties, clients, deals) is its own Express router + service + Sequelize model, with React pages consuming them through a centralized Axios client.

**Tech Stack:** Node.js 20, Express 5, PostgreSQL 16, Sequelize ORM, React 18, TypeScript, Tailwind CSS, Vite, JWT, Nodemailer, Twilio (SMS), Multer (uploads), Recharts (analytics), Jest + Supertest (backend tests), Vitest + Testing Library (frontend tests).

---

## File Structure

```
real-estate-crm/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                  # Sequelize instance + connection
│   │   │   └── env.ts                 # Validated env vars (dotenv + zod)
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT verify middleware
│   │   │   ├── role.ts                # Role-based access control
│   │   │   └── errorHandler.ts        # Global error handler
│   │   ├── models/
│   │   │   ├── User.ts                # Agent/Admin/Manager
│   │   │   ├── Lead.ts                # Lead with status enum
│   │   │   ├── Property.ts            # Property listing
│   │   │   ├── Client.ts              # Buyer/seller profile
│   │   │   ├── Deal.ts                # Deal with stage enum
│   │   │   ├── Activity.ts            # Call/SMS/email log
│   │   │   ├── FollowUp.ts            # Scheduled follow-ups
│   │   │   └── Document.ts            # File attachment record
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── lead.routes.ts
│   │   │   ├── property.routes.ts
│   │   │   ├── client.routes.ts
│   │   │   ├── deal.routes.ts
│   │   │   ├── activity.routes.ts
│   │   │   ├── followup.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── report.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts        # register, login, token ops
│   │   │   ├── lead.service.ts
│   │   │   ├── property.service.ts
│   │   │   ├── client.service.ts
│   │   │   ├── deal.service.ts
│   │   │   ├── activity.service.ts
│   │   │   ├── followup.service.ts
│   │   │   ├── notification.service.ts # Email + push notifications
│   │   │   ├── sms.service.ts          # Twilio wrapper
│   │   │   ├── upload.service.ts       # Multer + local/S3 storage
│   │   │   └── report.service.ts       # SQL aggregations for KPIs
│   │   ├── jobs/
│   │   │   └── followup.job.ts        # Cron: fires follow-up reminders
│   │   └── index.ts                   # Express app entry point
│   ├── tests/
│   │   ├── auth.test.ts
│   │   ├── lead.test.ts
│   │   ├── property.test.ts
│   │   ├── deal.test.ts
│   │   └── report.test.ts
│   ├── .env.example
│   └── package.json
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.ts               # Axios instance with JWT interceptor
    │   ├── contexts/
    │   │   └── AuthContext.tsx         # currentUser, login, logout
    │   ├── hooks/
    │   │   ├── useLeads.ts
    │   │   ├── useProperties.ts
    │   │   ├── useDeals.ts
    │   │   └── useReport.ts
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── leads/
    │   │   │   ├── LeadList.tsx
    │   │   │   └── LeadForm.tsx
    │   │   ├── properties/
    │   │   │   ├── PropertyList.tsx
    │   │   │   └── PropertyForm.tsx
    │   │   ├── clients/
    │   │   │   ├── ClientList.tsx
    │   │   │   └── ClientDetail.tsx
    │   │   ├── deals/
    │   │   │   └── DealKanban.tsx
    │   │   ├── reports/
    │   │   │   └── ReportsDashboard.tsx
    │   │   └── agents/
    │   │       └── AgentManagement.tsx
    │   ├── components/
    │   │   ├── Layout.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── KanbanBoard.tsx
    │   │   ├── ActivityTimeline.tsx
    │   │   └── FileUploader.tsx
    │   ├── types/
    │   │   └── index.ts               # Shared TS interfaces
    │   ├── App.tsx
    │   └── main.tsx
    ├── tests/
    │   ├── Login.test.tsx
    │   ├── LeadForm.test.tsx
    │   └── DealKanban.test.tsx
    └── package.json
```

---

## Phase 1 – Project Scaffold & Database

---

### Task 1: Project Initialization

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/.env.example`
- Create: `server/src/config/env.ts`
- Create: `client/package.json`
- Create: `client/vite.config.ts`

- [ ] **Step 1: Scaffold server**

```bash
mkdir -p real-estate-crm/server && cd real-estate-crm/server
npm init -y
npm install express sequelize pg pg-hstore bcryptjs jsonwebtoken dotenv \
  multer nodemailer twilio node-cron cors helmet zod
npm install -D typescript ts-node-dev @types/express @types/node \
  @types/bcryptjs @types/jsonwebtoken @types/multer @types/cors \
  jest supertest @types/jest @types/supertest ts-jest
npx tsc --init --strict --module commonjs --outDir dist --rootDir src
```

- [ ] **Step 2: Create `server/src/config/env.ts`**

```typescript
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const schema = z.object({
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default("7d"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  TWILIO_SID: z.string().optional(),
  TWILIO_TOKEN: z.string().optional(),
  TWILIO_PHONE: z.string().optional(),
});

export const env = schema.parse(process.env);
```

- [ ] **Step 3: Create `server/.env.example`**

```
PORT=4000
DATABASE_URL=postgres://user:pass@localhost:5432/realestate_crm
JWT_SECRET=changeme_long_random_string
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_PHONE=
```

- [ ] **Step 4: Scaffold client**

```bash
cd ../client
npm create vite@latest . -- --template react-ts
npm install axios react-router-dom recharts @hello-pangea/dnd
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 5: Configure Tailwind – edit `client/tailwind.config.js`**

```js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 6: Commit**

```bash
cd .. && git init && git add .
git commit -m "chore: scaffold server and client"
```

---

### Task 2: Database Config & Base Models

**Files:**
- Create: `server/src/config/db.ts`
- Create: `server/src/models/User.ts`
- Create: `server/src/models/Lead.ts`
- Create: `server/src/models/Property.ts`
- Create: `server/src/models/Client.ts`
- Create: `server/src/models/Deal.ts`
- Create: `server/src/models/Activity.ts`
- Create: `server/src/models/FollowUp.ts`
- Create: `server/src/models/Document.ts`

- [ ] **Step 1: Create `server/src/config/db.ts`**

```typescript
import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

export async function connectDB() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true }); // use migrations in production
  console.log("DB connected and synced");
}
```

- [ ] **Step 2: Create `server/src/models/User.ts`**

```typescript
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

export type UserRole = "admin" | "manager" | "agent";

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "manager", "agent"),
      defaultValue: "agent",
    },
  },
  { sequelize, tableName: "users" }
);
```

- [ ] **Step 3: Create `server/src/models/Lead.ts`**

```typescript
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

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
  public id!: number;
  public name!: string;
  public phone!: string;
  public email!: string;
  public budget!: number;
  public preferences!: string;
  public status!: LeadStatus;
  public source!: LeadSource;
  public assignedAgentId!: number | null;
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
```

- [ ] **Step 4: Create `server/src/models/Property.ts`**

```typescript
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

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
  public id!: number;
  public title!: string;
  public type!: PropertyType;
  public location!: string;
  public price!: number;
  public sizeSqft!: number;
  public amenities!: string;
  public imageUrls!: string[];
  public status!: PropertyStatus;
  public agentId!: number | null;
  public latitude!: number | null;
  public longitude!: number | null;
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
```

- [ ] **Step 5: Create `server/src/models/Client.ts`**

```typescript
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

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
  public id!: number;
  public name!: string;
  public phone!: string;
  public email!: string;
  public type!: ClientType;
  public preferences!: string;
  public leadId!: number | null;
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
```

- [ ] **Step 6: Create `server/src/models/Deal.ts`**

```typescript
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

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
  public id!: number;
  public title!: string;
  public stage!: DealStage;
  public salePrice!: number;
  public commissionRate!: number;
  public clientId!: number;
  public propertyId!: number;
  public agentId!: number;
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
```

- [ ] **Step 7: Create `server/src/models/Activity.ts`**

```typescript
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

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
  public id!: number;
  public type!: ActivityType;
  public notes!: string;
  public agentId!: number;
  public leadId!: number | null;
  public clientId!: number | null;
  public dealId!: number | null;
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
```

- [ ] **Step 8: Create `server/src/models/FollowUp.ts`**

```typescript
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

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
  public id!: number;
  public scheduledAt!: Date;
  public note!: string;
  public done!: boolean;
  public agentId!: number;
  public leadId!: number | null;
  public clientId!: number | null;
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
```

- [ ] **Step 9: Create `server/src/models/Document.ts`**

```typescript
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

export interface DocumentAttributes {
  id: number;
  filename: string;
  url: string;
  dealId: number | null;
  propertyId: number | null;
}

export class Document extends Model<DocumentAttributes>
  implements DocumentAttributes {
  public id!: number;
  public filename!: string;
  public url!: string;
  public dealId!: number | null;
  public propertyId!: number | null;
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
```

- [ ] **Step 10: Commit**

```bash
git add server/src/models/ server/src/config/
git commit -m "feat: add all Sequelize models and DB config"
```

---

## Phase 2 – Auth System

---

### Task 3: Auth Middleware & Routes

**Files:**
- Create: `server/src/middleware/auth.ts`
- Create: `server/src/middleware/role.ts`
- Create: `server/src/middleware/errorHandler.ts`
- Create: `server/src/services/auth.service.ts`
- Create: `server/src/routes/auth.routes.ts`
- Create: `server/tests/auth.test.ts`

- [ ] **Step 1: Write failing test – `server/tests/auth.test.ts`**

```typescript
import request from "supertest";
import app from "../src/index";

describe("POST /api/auth/register", () => {
  it("creates a new agent and returns token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Agent",
      email: "agent@test.com",
      password: "Pass1234!",
      role: "agent",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });
});

describe("POST /api/auth/login", () => {
  it("returns 401 for wrong credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "wrong",
    });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd server && npx jest tests/auth.test.ts --no-coverage
```

Expected: FAIL – "Cannot find module '../src/index'"

- [ ] **Step 3: Create `server/src/middleware/auth.ts`**

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export function authenticateJWT(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      id: number;
      role: string;
    };
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
```

- [ ] **Step 4: Create `server/src/middleware/role.ts`**

```typescript
import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { UserRole } from "../models/User";

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole as UserRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
```

- [ ] **Step 5: Create `server/src/middleware/errorHandler.ts`**

```typescript
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
}
```

- [ ] **Step 6: Create `server/src/services/auth.service.ts`**

```typescript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, UserRole } from "../models/User";
import { env } from "../config/env";

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole
) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error("Email already registered");
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });
  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  return { token, user: { id: user.id, name: user.name, role: user.role } };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  return { token, user: { id: user.id, name: user.name, role: user.role } };
}
```

- [ ] **Step 7: Create `server/src/routes/auth.routes.ts`**

```typescript
import { Router, Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service";

const router = Router();

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await registerUser(name, email, password, role ?? "agent");
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ error: err.message });
  }
});

export default router;
```

- [ ] **Step 8: Create `server/src/index.ts`**

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(errorHandler);

if (require.main === module) {
  connectDB().then(() => {
    app.listen(env.PORT, () =>
      console.log(`Server running on port ${env.PORT}`)
    );
  });
}

export default app;
```

- [ ] **Step 9: Run tests to verify they pass**

```bash
npx jest tests/auth.test.ts --no-coverage
```

Expected: 2 PASS

- [ ] **Step 10: Commit**

```bash
git add server/src/middleware/ server/src/services/auth.service.ts \
  server/src/routes/auth.routes.ts server/src/index.ts server/tests/auth.test.ts
git commit -m "feat: auth register/login with JWT + role middleware"
```

---

## Phase 3 – Lead Management

---

### Task 4: Lead Service & API

**Files:**
- Create: `server/src/services/lead.service.ts`
- Create: `server/src/routes/lead.routes.ts`
- Modify: `server/src/index.ts` (mount lead router)
- Create: `server/tests/lead.test.ts`

- [ ] **Step 1: Write failing test – `server/tests/lead.test.ts`**

```typescript
import request from "supertest";
import app from "../src/index";

let agentToken: string;

beforeAll(async () => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Lead Agent",
    email: "leadagent@test.com",
    password: "Pass1234!",
    role: "agent",
  });
  agentToken = res.body.token;
});

describe("POST /api/leads", () => {
  it("creates a lead when authenticated", async () => {
    const res = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${agentToken}`)
      .send({
        name: "John Doe",
        phone: "9876543210",
        email: "john@example.com",
        budget: 5000000,
        preferences: "3BHK, South Delhi",
        source: "website",
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("new");
  });
});

describe("PATCH /api/leads/:id/status", () => {
  it("updates lead status", async () => {
    const created = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ name: "Jane", phone: "1234567890", source: "ads" });
    const res = await request(app)
      .patch(`/api/leads/${created.body.id}/status`)
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ status: "contacted" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("contacted");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/lead.test.ts --no-coverage
```

Expected: FAIL – 404 on POST /api/leads

- [ ] **Step 3: Create `server/src/services/lead.service.ts`**

```typescript
import { Lead, LeadStatus, LeadSource } from "../models/Lead";

export async function createLead(data: {
  name: string;
  phone: string;
  email?: string;
  budget?: number;
  preferences?: string;
  source: LeadSource;
  assignedAgentId?: number;
}) {
  return Lead.create(data as any);
}

export async function getAllLeads(agentId?: number) {
  const where: any = {};
  if (agentId) where.assignedAgentId = agentId;
  return Lead.findAll({ where, order: [["createdAt", "DESC"]] });
}

export async function getLeadById(id: number) {
  const lead = await Lead.findByPk(id);
  if (!lead) throw Object.assign(new Error("Lead not found"), { status: 404 });
  return lead;
}

export async function updateLeadStatus(id: number, status: LeadStatus) {
  const lead = await getLeadById(id);
  lead.status = status;
  return lead.save();
}

export async function assignLead(id: number, agentId: number) {
  const lead = await getLeadById(id);
  lead.assignedAgentId = agentId;
  return lead.save();
}

export async function deleteLead(id: number) {
  const lead = await getLeadById(id);
  await lead.destroy();
}
```

- [ ] **Step 4: Create `server/src/routes/lead.routes.ts`**

```typescript
import { Router, Response, NextFunction } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import * as svc from "../services/lead.service";

const router = Router();
router.use(authenticateJWT);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const agentId = req.userRole === "agent" ? req.userId : undefined;
    res.json(await svc.getAllLeads(agentId));
  } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await svc.createLead({
      ...req.body,
      assignedAgentId: req.body.assignedAgentId ?? req.userId,
    });
    res.status(201).json(lead);
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await svc.getLeadById(Number(req.params.id)));
  } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.patch("/:id/status", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await svc.updateLeadStatus(Number(req.params.id), req.body.status));
  } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.patch("/:id/assign", requireRole("admin", "manager"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await svc.assignLead(Number(req.params.id), req.body.agentId));
    } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
  }
);

router.delete("/:id", requireRole("admin", "manager"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await svc.deleteLead(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
  }
);

export default router;
```

- [ ] **Step 5: Mount lead router in `server/src/index.ts`**

Add after the auth routes import block:

```typescript
import leadRoutes from "./routes/lead.routes";
// ...
app.use("/api/leads", leadRoutes);
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx jest tests/lead.test.ts --no-coverage
```

Expected: 2 PASS

- [ ] **Step 7: Commit**

```bash
git add server/src/services/lead.service.ts server/src/routes/lead.routes.ts \
  server/src/index.ts server/tests/lead.test.ts
git commit -m "feat: lead CRUD, status workflow, and agent assignment"
```

---

## Phase 4 – Property Management

---

### Task 5: Property Service, File Upload & Routes

**Files:**
- Create: `server/src/services/upload.service.ts`
- Create: `server/src/services/property.service.ts`
- Create: `server/src/routes/property.routes.ts`
- Modify: `server/src/index.ts`
- Create: `server/tests/property.test.ts`

- [ ] **Step 1: Write failing test – `server/tests/property.test.ts`**

```typescript
import request from "supertest";
import app from "../src/index";

let token: string;

beforeAll(async () => {
  const r = await request(app).post("/api/auth/register").send({
    name: "Prop Agent",
    email: "propagent@test.com",
    password: "Pass1234!",
    role: "agent",
  });
  token = r.body.token;
});

describe("POST /api/properties", () => {
  it("creates a property listing", async () => {
    const res = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "3BHK in Vasant Kunj",
        type: "residential",
        location: "Vasant Kunj, Delhi",
        price: 12000000,
        sizeSqft: 1450,
        amenities: "gym, pool, parking",
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("available");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/property.test.ts --no-coverage
```

Expected: FAIL – 404

- [ ] **Step 3: Create `server/src/services/upload.service.ts`**

```typescript
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`),
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  },
});

export function fileUrl(filename: string): string {
  return `/uploads/${filename}`;
}
```

- [ ] **Step 4: Create `server/src/services/property.service.ts`**

```typescript
import { Op } from "sequelize";
import { Property, PropertyStatus } from "../models/Property";

export async function createProperty(data: Partial<Property>) {
  return Property.create(data as any);
}

export async function getProperties(filters: {
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) {
  const where: any = {};
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { [Op.gte]: filters.minPrice } : {}),
      ...(filters.maxPrice ? { [Op.lte]: filters.maxPrice } : {}),
    };
  }
  if (filters.search) {
    where.title = { [Op.iLike]: `%${filters.search}%` };
  }
  return Property.findAll({ where, order: [["createdAt", "DESC"]] });
}

export async function getPropertyById(id: number) {
  const p = await Property.findByPk(id);
  if (!p) throw Object.assign(new Error("Property not found"), { status: 404 });
  return p;
}

export async function updateProperty(id: number, data: Partial<Property>) {
  const p = await getPropertyById(id);
  return p.update(data);
}

export async function addPropertyImages(id: number, urls: string[]) {
  const p = await getPropertyById(id);
  p.imageUrls = [...p.imageUrls, ...urls];
  return p.save();
}

export async function deleteProperty(id: number) {
  const p = await getPropertyById(id);
  await p.destroy();
}
```

- [ ] **Step 5: Create `server/src/routes/property.routes.ts`**

```typescript
import { Router, Response, NextFunction } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { upload, fileUrl } from "../services/upload.service";
import * as svc from "../services/property.service";

const router = Router();
router.use(authenticateJWT);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await svc.getProperties(req.query as any));
  } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const property = await svc.createProperty({
      ...req.body,
      agentId: req.userId,
    });
    res.status(201).json(property);
  } catch (err) { next(err); }
});

router.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await svc.getPropertyById(Number(req.params.id)));
  } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.put("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await svc.updateProperty(Number(req.params.id), req.body));
  } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.post("/:id/images", upload.array("images", 10),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const files = (req.files as Express.Multer.File[]) ?? [];
      const urls = files.map((f) => fileUrl(f.filename));
      res.json(await svc.addPropertyImages(Number(req.params.id), urls));
    } catch (err) { next(err); }
  }
);

router.delete("/:id", requireRole("admin", "manager"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await svc.deleteProperty(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
  }
);

export default router;
```

- [ ] **Step 6: Mount router and serve uploads in `server/src/index.ts`**

```typescript
import propertyRoutes from "./routes/property.routes";
import path from "path";
// ...
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/properties", propertyRoutes);
```

- [ ] **Step 7: Run test to verify it passes**

```bash
npx jest tests/property.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add server/src/services/upload.service.ts server/src/services/property.service.ts \
  server/src/routes/property.routes.ts server/src/index.ts server/tests/property.test.ts
git commit -m "feat: property CRUD, image upload, search filters"
```

---

## Phase 5 – Client & Deal Management

---

### Task 6: Client & Deal Services + Routes

**Files:**
- Create: `server/src/services/client.service.ts`
- Create: `server/src/routes/client.routes.ts`
- Create: `server/src/services/deal.service.ts`
- Create: `server/src/routes/deal.routes.ts`
- Modify: `server/src/index.ts`
- Create: `server/tests/deal.test.ts`

- [ ] **Step 1: Write failing test – `server/tests/deal.test.ts`**

```typescript
import request from "supertest";
import app from "../src/index";

let token: string;
let clientId: number;
let propertyId: number;

beforeAll(async () => {
  const a = await request(app).post("/api/auth/register").send({
    name: "Deal Agent", email: "dealagent@test.com",
    password: "Pass1234!", role: "agent",
  });
  token = a.body.token;

  const c = await request(app).post("/api/clients")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Client A", phone: "9999999999", type: "buyer" });
  clientId = c.body.id;

  const p = await request(app).post("/api/properties")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Deal Prop", type: "residential", location: "Delhi", price: 8000000, sizeSqft: 1200, amenities: "" });
  propertyId = p.body.id;
});

describe("POST /api/deals", () => {
  it("creates a deal in negotiation stage", async () => {
    const res = await request(app).post("/api/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Deal #1", salePrice: 8000000, commissionRate: 2, clientId, propertyId });
    expect(res.status).toBe(201);
    expect(res.body.stage).toBe("negotiation");
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
npx jest tests/deal.test.ts --no-coverage
```

Expected: FAIL – 404

- [ ] **Step 3: Create `server/src/services/client.service.ts`**

```typescript
import { Client } from "../models/Client";

export async function createClient(data: Partial<Client>) {
  return Client.create(data as any);
}

export async function getAllClients() {
  return Client.findAll({ order: [["createdAt", "DESC"]] });
}

export async function getClientById(id: number) {
  const c = await Client.findByPk(id);
  if (!c) throw Object.assign(new Error("Client not found"), { status: 404 });
  return c;
}

export async function updateClient(id: number, data: Partial<Client>) {
  const c = await getClientById(id);
  return c.update(data);
}
```

- [ ] **Step 4: Create `server/src/routes/client.routes.ts`**

```typescript
import { Router, Response, NextFunction } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import * as svc from "../services/client.service";

const router = Router();
router.use(authenticateJWT);

router.get("/", async (_req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getAllClients()); } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.status(201).json(await svc.createClient(req.body)); } catch (err) { next(err); }
});

router.get("/:id", async (req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getClientById(Number(req.params.id))); }
  catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.put("/:id", async (req, res: Response, next: NextFunction) => {
  try { res.json(await svc.updateClient(Number(req.params.id), req.body)); }
  catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

export default router;
```

- [ ] **Step 5: Create `server/src/services/deal.service.ts`**

```typescript
import { Deal, DealStage } from "../models/Deal";

export async function createDeal(data: {
  title: string;
  salePrice: number;
  commissionRate: number;
  clientId: number;
  propertyId: number;
  agentId: number;
}) {
  return Deal.create(data as any);
}

export async function getAllDeals() {
  return Deal.findAll({ order: [["createdAt", "DESC"]] });
}

export async function getDealById(id: number) {
  const d = await Deal.findByPk(id);
  if (!d) throw Object.assign(new Error("Deal not found"), { status: 404 });
  return d;
}

export async function updateDealStage(id: number, stage: DealStage) {
  const d = await getDealById(id);
  d.stage = stage;
  return d.save();
}

export function calculateCommission(salePrice: number, rate: number): number {
  return (salePrice * rate) / 100;
}
```

- [ ] **Step 6: Create `server/src/routes/deal.routes.ts`**

```typescript
import { Router, Response, NextFunction } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import * as svc from "../services/deal.service";

const router = Router();
router.use(authenticateJWT);

router.get("/", async (_req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getAllDeals()); } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deal = await svc.createDeal({ ...req.body, agentId: req.userId });
    res.status(201).json(deal);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getDealById(Number(req.params.id))); }
  catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.patch("/:id/stage", async (req, res: Response, next: NextFunction) => {
  try { res.json(await svc.updateDealStage(Number(req.params.id), req.body.stage)); }
  catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

router.get("/:id/commission", async (req, res: Response, next: NextFunction) => {
  try {
    const d = await svc.getDealById(Number(req.params.id));
    res.json({ commission: svc.calculateCommission(d.salePrice, d.commissionRate) });
  } catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

export default router;
```

- [ ] **Step 7: Mount routers in `server/src/index.ts`**

```typescript
import clientRoutes from "./routes/client.routes";
import dealRoutes from "./routes/deal.routes";
// ...
app.use("/api/clients", clientRoutes);
app.use("/api/deals", dealRoutes);
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
npx jest tests/deal.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add server/src/services/client.service.ts server/src/routes/client.routes.ts \
  server/src/services/deal.service.ts server/src/routes/deal.routes.ts \
  server/src/index.ts server/tests/deal.test.ts
git commit -m "feat: client + deal management with commission calculation"
```

---

## Phase 6 – Communications & Follow-ups

---

### Task 7: Activity Logging, Follow-up Scheduler & Notifications

**Files:**
- Create: `server/src/services/activity.service.ts`
- Create: `server/src/services/followup.service.ts`
- Create: `server/src/services/notification.service.ts`
- Create: `server/src/services/sms.service.ts`
- Create: `server/src/routes/activity.routes.ts`
- Create: `server/src/routes/followup.routes.ts`
- Create: `server/src/jobs/followup.job.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Create `server/src/services/notification.service.ts`**

```typescript
import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT ?? 587),
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.warn("SMTP not configured – email skipped:", subject);
    return;
  }
  await transporter.sendMail({ from: env.SMTP_USER, to, subject, html });
}
```

- [ ] **Step 2: Create `server/src/services/sms.service.ts`**

```typescript
import twilio from "twilio";
import { env } from "../config/env";

const client =
  env.TWILIO_SID && env.TWILIO_TOKEN
    ? twilio(env.TWILIO_SID, env.TWILIO_TOKEN)
    : null;

export async function sendSMS(to: string, body: string) {
  if (!client) {
    console.warn("Twilio not configured – SMS skipped:", body);
    return;
  }
  await client.messages.create({ from: env.TWILIO_PHONE, to, body });
}
```

- [ ] **Step 3: Create `server/src/services/activity.service.ts`**

```typescript
import { Activity, ActivityType } from "../models/Activity";

export async function logActivity(data: {
  type: ActivityType;
  notes: string;
  agentId: number;
  leadId?: number;
  clientId?: number;
  dealId?: number;
}) {
  return Activity.create(data as any);
}

export async function getActivities(filters: {
  leadId?: number;
  clientId?: number;
  dealId?: number;
}) {
  const where: any = {};
  if (filters.leadId) where.leadId = filters.leadId;
  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.dealId) where.dealId = filters.dealId;
  return Activity.findAll({ where, order: [["createdAt", "DESC"]] });
}
```

- [ ] **Step 4: Create `server/src/routes/activity.routes.ts`**

```typescript
import { Router, Response, NextFunction } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import * as svc from "../services/activity.service";

const router = Router();
router.use(authenticateJWT);

router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await svc.getActivities(req.query as any)); } catch (err) { next(err); }
});

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(
      await svc.logActivity({ ...req.body, agentId: req.userId })
    );
  } catch (err) { next(err); }
});

export default router;
```

- [ ] **Step 5: Create `server/src/services/followup.service.ts`**

```typescript
import { Op } from "sequelize";
import { FollowUp } from "../models/FollowUp";

export async function createFollowUp(data: {
  scheduledAt: Date;
  note: string;
  agentId: number;
  leadId?: number;
  clientId?: number;
}) {
  return FollowUp.create(data as any);
}

export async function getDueFollowUps(): Promise<FollowUp[]> {
  return FollowUp.findAll({
    where: {
      done: false,
      scheduledAt: { [Op.lte]: new Date() },
    },
  });
}

export async function markDone(id: number) {
  const f = await FollowUp.findByPk(id);
  if (!f) throw Object.assign(new Error("FollowUp not found"), { status: 404 });
  f.done = true;
  return f.save();
}
```

- [ ] **Step 6: Create `server/src/jobs/followup.job.ts`**

```typescript
import cron from "node-cron";
import { getDueFollowUps } from "../services/followup.service";
import { sendEmail } from "../services/notification.service";
import { User } from "../models/User";

// Runs every 5 minutes
export function startFollowUpJob() {
  cron.schedule("*/5 * * * *", async () => {
    const due = await getDueFollowUps();
    for (const f of due) {
      const agent = await User.findByPk(f.agentId);
      if (agent) {
        await sendEmail(
          agent.email,
          "Follow-up Reminder",
          `<p>You have a follow-up due: <strong>${f.note}</strong></p>`
        );
      }
    }
    console.log(`Follow-up job: notified ${due.length} agents`);
  });
}
```

- [ ] **Step 7: Create `server/src/routes/followup.routes.ts`**

```typescript
import { Router, Response, NextFunction } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import * as svc from "../services/followup.service";

const router = Router();
router.use(authenticateJWT);

router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(
      await svc.createFollowUp({ ...req.body, agentId: req.userId })
    );
  } catch (err) { next(err); }
});

router.patch("/:id/done", async (req, res: Response, next: NextFunction) => {
  try { res.json(await svc.markDone(Number(req.params.id))); }
  catch (err: any) { res.status(err.status ?? 500).json({ error: err.message }); }
});

export default router;
```

- [ ] **Step 8: Register routes and job in `server/src/index.ts`**

```typescript
import activityRoutes from "./routes/activity.routes";
import followUpRoutes from "./routes/followup.routes";
import { startFollowUpJob } from "./jobs/followup.job";
// ...
app.use("/api/activities", activityRoutes);
app.use("/api/followups", followUpRoutes);

if (require.main === module) {
  connectDB().then(() => {
    startFollowUpJob();
    app.listen(env.PORT, () => console.log(`Server on port ${env.PORT}`));
  });
}
```

- [ ] **Step 9: Commit**

```bash
git add server/src/services/activity.service.ts server/src/services/followup.service.ts \
  server/src/services/notification.service.ts server/src/services/sms.service.ts \
  server/src/routes/activity.routes.ts server/src/routes/followup.routes.ts \
  server/src/jobs/followup.job.ts server/src/index.ts
git commit -m "feat: activity log, follow-up scheduler with email reminders, SMS service"
```

---

## Phase 7 – Reports & Analytics

---

### Task 8: Reports Service & Routes

**Files:**
- Create: `server/src/services/report.service.ts`
- Create: `server/src/routes/report.routes.ts`
- Modify: `server/src/index.ts`
- Create: `server/tests/report.test.ts`

- [ ] **Step 1: Write failing test – `server/tests/report.test.ts`**

```typescript
import request from "supertest";
import app from "../src/index";
let token: string;

beforeAll(async () => {
  const r = await request(app).post("/api/auth/register").send({
    name: "Admin", email: "admin@test.com", password: "Pass1234!", role: "admin",
  });
  token = r.body.token;
});

describe("GET /api/reports/overview", () => {
  it("returns overview KPIs", async () => {
    const res = await request(app)
      .get("/api/reports/overview")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalLeads");
    expect(res.body).toHaveProperty("totalDeals");
    expect(res.body).toHaveProperty("totalRevenue");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/report.test.ts --no-coverage
```

Expected: FAIL – 404

- [ ] **Step 3: Create `server/src/services/report.service.ts`**

```typescript
import { sequelize } from "../config/db";
import { Lead } from "../models/Lead";
import { Deal } from "../models/Deal";
import { QueryTypes } from "sequelize";

export async function getOverviewKPIs() {
  const totalLeads = await Lead.count();
  const totalDeals = await Deal.count();

  const revenueResult = await sequelize.query<{ total: string }>(
    `SELECT COALESCE(SUM("salePrice"), 0) AS total FROM deals WHERE stage = 'closed'`,
    { type: QueryTypes.SELECT }
  );
  const totalRevenue = parseFloat(revenueResult[0]?.total ?? "0");

  const conversionResult = await sequelize.query<{ rate: string }>(
    `SELECT ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM leads),0) * 100, 2) AS rate
     FROM leads WHERE status = 'closed'`,
    { type: QueryTypes.SELECT }
  );
  const conversionRate = parseFloat(conversionResult[0]?.rate ?? "0");

  return { totalLeads, totalDeals, totalRevenue, conversionRate };
}

export async function getMonthlyDeals() {
  return sequelize.query(
    `SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*) AS deals,
     SUM("salePrice") AS revenue
     FROM deals GROUP BY month ORDER BY month`,
    { type: QueryTypes.SELECT }
  );
}

export async function getAgentPerformance() {
  return sequelize.query(
    `SELECT u.name, COUNT(d.id) AS total_deals,
     COALESCE(SUM(d."salePrice" * d."commissionRate" / 100), 0) AS total_commission
     FROM users u LEFT JOIN deals d ON d."agentId" = u.id
     WHERE u.role = 'agent' GROUP BY u.id, u.name ORDER BY total_deals DESC`,
    { type: QueryTypes.SELECT }
  );
}
```

- [ ] **Step 4: Create `server/src/routes/report.routes.ts`**

```typescript
import { Router, Response, NextFunction } from "express";
import { authenticateJWT } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import * as svc from "../services/report.service";

const router = Router();
router.use(authenticateJWT, requireRole("admin", "manager"));

router.get("/overview", async (_req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getOverviewKPIs()); } catch (err) { next(err); }
});

router.get("/monthly", async (_req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getMonthlyDeals()); } catch (err) { next(err); }
});

router.get("/agents", async (_req, res: Response, next: NextFunction) => {
  try { res.json(await svc.getAgentPerformance()); } catch (err) { next(err); }
});

export default router;
```

- [ ] **Step 5: Mount in `server/src/index.ts`**

```typescript
import reportRoutes from "./routes/report.routes";
// ...
app.use("/api/reports", reportRoutes);
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx jest tests/report.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add server/src/services/report.service.ts server/src/routes/report.routes.ts \
  server/src/index.ts server/tests/report.test.ts
git commit -m "feat: reports API – KPI overview, monthly deals, agent performance"
```

---

## Phase 8 – React Frontend

---

### Task 9: Auth Context, Axios Client & Types

**Files:**
- Create: `client/src/types/index.ts`
- Create: `client/src/api/axios.ts`
- Create: `client/src/contexts/AuthContext.tsx`
- Create: `client/src/components/ProtectedRoute.tsx`
- Create: `client/src/components/Layout.tsx`
- Create: `client/src/pages/Login.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Create `client/src/types/index.ts`**

```typescript
export type UserRole = "admin" | "manager" | "agent";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "lost";
export type LeadSource = "website" | "ads" | "call" | "referral" | "other";
export type PropertyType = "residential" | "commercial";
export type PropertyStatus = "available" | "sold" | "rented" | "unavailable";
export type DealStage = "negotiation" | "agreement" | "closed";
export type ClientType = "buyer" | "seller";
export type ActivityType = "call" | "sms" | "email" | "note";

export interface User { id: number; name: string; role: UserRole; }
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
```

- [ ] **Step 2: Create `client/src/api/axios.ts`**

```typescript
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:4000/api" });

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");
  if (raw) {
    const { token } = JSON.parse(raw);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

- [ ] **Step 3: Create `client/src/contexts/AuthContext.tsx`**

```tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { AuthState, User } from "../types";

interface AuthContextValue {
  auth: AuthState | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  });

  function login(token: string, user: User) {
    const state = { token, user };
    localStorage.setItem("auth", JSON.stringify(state));
    setAuth(state);
  }

  function logout() {
    localStorage.removeItem("auth");
    setAuth(null);
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
```

- [ ] **Step 4: Create `client/src/components/ProtectedRoute.tsx`**

```tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" replace />;
}
```

- [ ] **Step 5: Create `client/src/components/Layout.tsx`**

```tsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/leads", label: "Leads" },
  { to: "/properties", label: "Properties" },
  { to: "/clients", label: "Clients" },
  { to: "/deals", label: "Deals" },
  { to: "/reports", label: "Reports" },
];

export default function Layout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          RE CRM
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive ? "bg-blue-600" : "hover:bg-gray-700"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-sm">
          <p className="text-gray-400">{auth?.user.name}</p>
          <button onClick={handleLogout} className="mt-1 text-red-400 hover:underline">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Create `client/src/pages/Login.tsx`**

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit() {
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      navigate("/");
    } catch {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">RE CRM Login</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input
          className="w-full border rounded px-3 py-2 mb-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email" type="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Wire up `client/src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LeadList from "./pages/leads/LeadList";
import PropertyList from "./pages/properties/PropertyList";
import ClientList from "./pages/clients/ClientList";
import DealKanban from "./pages/deals/DealKanban";
import ReportsDashboard from "./pages/reports/ReportsDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadList />} />
            <Route path="properties" element={<PropertyList />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="deals" element={<DealKanban />} />
            <Route path="reports" element={<ReportsDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add client/src/
git commit -m "feat: React app shell – auth context, routing, layout, login page"
```

---

### Task 10: Lead, Property & Client Pages

**Files:**
- Create: `client/src/hooks/useLeads.ts`
- Create: `client/src/pages/leads/LeadList.tsx`
- Create: `client/src/pages/leads/LeadForm.tsx`
- Create: `client/src/hooks/useProperties.ts`
- Create: `client/src/pages/properties/PropertyList.tsx`
- Create: `client/src/pages/clients/ClientList.tsx`

- [ ] **Step 1: Create `client/src/hooks/useLeads.ts`**

```typescript
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { Lead } from "../types";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Lead[]>("/leads");
      setLeads(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function createLead(payload: Partial<Lead>) {
    const { data } = await api.post<Lead>("/leads", payload);
    setLeads((prev) => [data, ...prev]);
    return data;
  }

  async function updateStatus(id: number, status: Lead["status"]) {
    const { data } = await api.patch<Lead>(`/leads/${id}/status`, { status });
    setLeads((prev) => prev.map((l) => (l.id === id ? data : l)));
  }

  return { leads, loading, createLead, updateStatus, refetch: fetchLeads };
}
```

- [ ] **Step 2: Create `client/src/pages/leads/LeadList.tsx`**

```tsx
import { useState } from "react";
import { useLeads } from "../../hooks/useLeads";
import { Lead, LeadStatus } from "../../types";
import LeadForm from "./LeadForm";

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-purple-100 text-purple-700",
  closed: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

export default function LeadList() {
  const { leads, loading, createLead, updateStatus } = useLeads();
  const [showForm, setShowForm] = useState(false);

  if (loading) return <p className="text-gray-500">Loading leads…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          + New Lead
        </button>
      </div>

      {showForm && (
        <LeadForm
          onSubmit={async (data) => {
            await createLead(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Name", "Phone", "Budget", "Source", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{lead.name}</td>
                <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                <td className="px-4 py-3">₹{lead.budget?.toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{lead.source}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    {(["new", "contacted", "qualified", "closed", "lost"] as LeadStatus[]).map(
                      (s) => <option key={s} value={s}>{s}</option>
                    )}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <p className="text-center py-8 text-gray-400">No leads yet. Add your first one!</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `client/src/pages/leads/LeadForm.tsx`**

```tsx
import { useState } from "react";
import { Lead, LeadSource } from "../../types";

interface Props {
  onSubmit: (data: Partial<Lead>) => Promise<void>;
  onCancel: () => void;
}

export default function LeadForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<Partial<Lead>>({ source: "website", budget: 0 });
  const [saving, setSaving] = useState(false);

  function set(key: keyof Lead, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.phone) return;
    setSaving(true);
    try { await onSubmit(form); } finally { setSaving(false); }
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
      <h2 className="font-semibold text-gray-800 mb-3">New Lead</h2>
      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2 text-sm" placeholder="Name *"
          value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />
        <input className="border rounded px-3 py-2 text-sm" placeholder="Phone *"
          value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        <input className="border rounded px-3 py-2 text-sm" placeholder="Email"
          value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        <input className="border rounded px-3 py-2 text-sm" placeholder="Budget (₹)" type="number"
          value={form.budget ?? ""} onChange={(e) => set("budget", Number(e.target.value))} />
        <select className="border rounded px-3 py-2 text-sm" value={form.source}
          onChange={(e) => set("source", e.target.value as LeadSource)}>
          {(["website", "ads", "call", "referral", "other"] as LeadSource[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input className="border rounded px-3 py-2 text-sm" placeholder="Preferences"
          value={form.preferences ?? ""} onChange={(e) => set("preferences", e.target.value)} />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={handleSubmit} disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving…" : "Save Lead"}
        </button>
        <button onClick={onCancel}
          className="border px-4 py-2 rounded text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `client/src/hooks/useProperties.ts`**

```typescript
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { Property } from "../types";

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProperties = useCallback(async (filters: Record<string, string> = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get<Property[]>("/properties", { params: filters });
      setProperties(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  async function createProperty(payload: Partial<Property>) {
    const { data } = await api.post<Property>("/properties", payload);
    setProperties((prev) => [data, ...prev]);
    return data;
  }

  return { properties, loading, createProperty, refetch: fetchProperties };
}
```

- [ ] **Step 5: Create `client/src/pages/properties/PropertyList.tsx`**

```tsx
import { useProperties } from "../../hooks/useProperties";

export default function PropertyList() {
  const { properties, loading } = useProperties();

  if (loading) return <p className="text-gray-500">Loading properties…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow p-4">
            {p.imageUrls[0] && (
              <img src={p.imageUrls[0]} alt={p.title}
                className="w-full h-40 object-cover rounded mb-3" />
            )}
            <h2 className="font-semibold text-gray-800">{p.title}</h2>
            <p className="text-sm text-gray-500">{p.location}</p>
            <p className="text-blue-600 font-bold mt-1">₹{p.price.toLocaleString()}</p>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{p.type}</span>
              <span className={`capitalize px-2 py-0.5 rounded-full font-medium ${
                p.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100"
              }`}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>
      {properties.length === 0 && (
        <p className="text-center py-12 text-gray-400">No properties yet.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create `client/src/pages/clients/ClientList.tsx`**

```tsx
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Client } from "../../types";

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get<Client[]>("/clients")
      .then(({ data }) => setClients(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading clients…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Clients</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Name", "Phone", "Email", "Type"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 capitalize">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    c.type === "buyer" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                  }`}>{c.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add client/src/
git commit -m "feat: leads list + form, properties grid, clients table frontend"
```

---

### Task 11: Deal Kanban Board

**Files:**
- Create: `client/src/hooks/useDeals.ts`
- Create: `client/src/components/KanbanBoard.tsx`
- Create: `client/src/pages/deals/DealKanban.tsx`

- [ ] **Step 1: Create `client/src/hooks/useDeals.ts`**

```typescript
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { Deal, DealStage } from "../types";

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Deal[]>("/deals");
      setDeals(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  async function moveDeal(id: number, stage: DealStage) {
    const { data } = await api.patch<Deal>(`/deals/${id}/stage`, { stage });
    setDeals((prev) => prev.map((d) => (d.id === id ? data : d)));
  }

  return { deals, loading, moveDeal };
}
```

- [ ] **Step 2: Create `client/src/components/KanbanBoard.tsx`**

```tsx
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Deal, DealStage } from "../types";

const STAGES: DealStage[] = ["negotiation", "agreement", "closed"];
const STAGE_LABELS: Record<DealStage, string> = {
  negotiation: "Negotiation",
  agreement: "Agreement",
  closed: "Closed",
};
const STAGE_COLORS: Record<DealStage, string> = {
  negotiation: "border-yellow-400",
  agreement: "border-blue-400",
  closed: "border-green-400",
};

interface Props {
  deals: Deal[];
  onMove: (id: number, stage: DealStage) => void;
}

export default function KanbanBoard({ deals, onMove }: Props) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const stage = result.destination.droppableId as DealStage;
    const id = Number(result.draggableId);
    onMove(id, stage);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <Droppable key={stage} droppableId={stage}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-shrink-0 w-72 bg-gray-100 rounded-lg p-3 border-t-4 ${STAGE_COLORS[stage]}`}
              >
                <h2 className="font-semibold text-gray-700 mb-3">
                  {STAGE_LABELS[stage]}{" "}
                  <span className="text-gray-400 text-sm">
                    ({deals.filter((d) => d.stage === stage).length})
                  </span>
                </h2>
                {deals
                  .filter((d) => d.stage === stage)
                  .map((deal, index) => (
                    <Draggable key={deal.id} draggableId={String(deal.id)} index={index}>
                      {(prov) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className="bg-white rounded shadow p-3 mb-2 cursor-grab active:cursor-grabbing"
                        >
                          <p className="font-medium text-sm text-gray-800">{deal.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ₹{deal.salePrice?.toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-500 mt-0.5">
                            Commission: ₹{((deal.salePrice * deal.commissionRate) / 100).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
```

- [ ] **Step 3: Create `client/src/pages/deals/DealKanban.tsx`**

```tsx
import { useDeals } from "../../hooks/useDeals";
import KanbanBoard from "../../components/KanbanBoard";
import { DealStage } from "../../types";

export default function DealKanban() {
  const { deals, loading, moveDeal } = useDeals();

  if (loading) return <p className="text-gray-500">Loading deals…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Deal Pipeline</h1>
      <KanbanBoard deals={deals} onMove={moveDeal} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/
git commit -m "feat: drag-and-drop Kanban deal pipeline"
```

---

### Task 12: Reports Dashboard

**Files:**
- Create: `client/src/hooks/useReport.ts`
- Create: `client/src/pages/reports/ReportsDashboard.tsx`
- Create: `client/src/pages/Dashboard.tsx`

- [ ] **Step 1: Create `client/src/hooks/useReport.ts`**

```typescript
import { useState, useEffect } from "react";
import api from "../api/axios";

export interface OverviewKPIs {
  totalLeads: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface MonthlyData {
  month: string;
  deals: number;
  revenue: number;
}

export function useReport() {
  const [overview, setOverview] = useState<OverviewKPIs | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<OverviewKPIs>("/reports/overview"),
      api.get<MonthlyData[]>("/reports/monthly"),
    ])
      .then(([ov, mo]) => {
        setOverview(ov.data);
        setMonthly(mo.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { overview, monthly, loading };
}
```

- [ ] **Step 2: Create `client/src/pages/reports/ReportsDashboard.tsx`**

```tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { useReport } from "../../hooks/useReport";

function KPICard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export default function ReportsDashboard() {
  const { overview, monthly, loading } = useReport();

  if (loading) return <p className="text-gray-500">Loading reports…</p>;
  if (!overview) return <p className="text-gray-500">No data yet.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Reports & Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard label="Total Leads" value={overview.totalLeads} />
        <KPICard label="Total Deals" value={overview.totalDeals} />
        <KPICard label="Revenue" value={`₹${overview.totalRevenue.toLocaleString()}`} />
        <KPICard label="Conversion Rate" value={`${overview.conversionRate}%`} />
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-gray-700 mb-4">Deals Per Month</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="deals" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `client/src/pages/Dashboard.tsx`**

```tsx
import { useReport } from "../hooks/useReport";

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`bg-white rounded-lg shadow p-5 border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { overview, loading } = useReport();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Leads" value={overview.totalLeads} color="border-blue-500" />
          <StatCard label="Total Deals" value={overview.totalDeals} color="border-purple-500" />
          <StatCard label="Revenue" value={`₹${overview.totalRevenue.toLocaleString()}`} color="border-green-500" />
          <StatCard label="Conversion" value={`${overview.conversionRate}%`} color="border-orange-500" />
        </div>
      ) : (
        <p className="text-gray-400">No data available. Start adding leads and deals.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/
git commit -m "feat: reports dashboard with line/bar charts and KPI cards"
```

---

## Phase 9 – Integrations & Webhook API

---

### Task 13: Public Lead Capture Webhook & User Management Routes

**Files:**
- Create: `server/src/routes/user.routes.ts`
- Modify: `server/src/routes/lead.routes.ts` (add public webhook)
- Modify: `server/src/index.ts`

- [ ] **Step 1: Create `server/src/routes/user.routes.ts`**

```typescript
import { Router, Response, NextFunction } from "express";
import { authenticateJWT } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { User } from "../models/User";

const router = Router();
router.use(authenticateJWT, requireRole("admin"));

router.get("/", async (_req, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role"],
      order: [["name", "ASC"]],
    });
    res.json(users);
  } catch (err) { next(err); }
});

router.patch("/:id/role", async (req, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = req.body.role;
    await user.save();
    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (err) { next(err); }
});

export default router;
```

- [ ] **Step 2: Add public webhook endpoint to `server/src/routes/lead.routes.ts`**

Append at the top (before `router.use(authenticateJWT)`):

```typescript
import { Router, Response, NextFunction, Request } from "express";
import * as svc from "../services/lead.service";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const router = Router();

// Public: called by website contact forms
router.post("/webhook", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await svc.createLead({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      budget: req.body.budget ?? 0,
      preferences: req.body.preferences ?? "",
      source: "website",
    });
    res.status(201).json({ id: lead.id, message: "Lead received" });
  } catch (err) { next(err); }
});

router.use(authenticateJWT);
// ... rest of authenticated routes
```

- [ ] **Step 3: Mount user routes in `server/src/index.ts`**

```typescript
import userRoutes from "./routes/user.routes";
// ...
app.use("/api/users", userRoutes);
```

- [ ] **Step 4: Test the webhook manually**

```bash
curl -X POST http://localhost:4000/api/leads/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"Website Lead","phone":"9000000000","source":"website"}'
# Expected: {"id":1,"message":"Lead received"}
```

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/user.routes.ts server/src/routes/lead.routes.ts server/src/index.ts
git commit -m "feat: public lead webhook for website forms + user management routes"
```

---

## Phase 10 – Testing, Security & Deployment

---

### Task 14: Security Hardening

**Files:**
- Modify: `server/src/index.ts`
- Create: `server/src/middleware/rateLimiter.ts`

- [ ] **Step 1: Install rate-limiter**

```bash
cd server && npm install express-rate-limit
npm install -D @types/express-rate-limit
```

- [ ] **Step 2: Create `server/src/middleware/rateLimiter.ts`**

```typescript
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many requests, please try again later" },
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: { error: "Rate limit exceeded" },
});
```

- [ ] **Step 3: Apply limiters in `server/src/index.ts`**

```typescript
import { authLimiter, apiLimiter } from "./middleware/rateLimiter";
// ...
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", apiLimiter);
```

- [ ] **Step 4: Commit**

```bash
git add server/src/middleware/rateLimiter.ts server/src/index.ts
git commit -m "security: add rate limiting on auth and API routes"
```

---

### Task 15: Frontend Tests

**Files:**
- Create: `client/tests/Login.test.tsx`
- Create: `client/tests/DealKanban.test.tsx`

- [ ] **Step 1: Configure Vitest – edit `client/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },
});
```

- [ ] **Step 2: Create `client/tests/setup.ts`**

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 3: Create `client/tests/Login.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "../src/pages/Login";
import { AuthProvider } from "../src/contexts/AuthContext";
import api from "../src/api/axios";

vi.mock("../src/api/axios");

test("shows error on failed login", async () => {
  (api.post as any).mockRejectedValueOnce(new Error("401"));
  render(
    <AuthProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthProvider>
  );
  await userEvent.type(screen.getByPlaceholderText("Email"), "bad@test.com");
  await userEvent.type(screen.getByPlaceholderText("Password"), "wrong");
  await userEvent.click(screen.getByRole("button", { name: /login/i }));
  expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
});
```

- [ ] **Step 4: Run frontend tests**

```bash
cd client && npx vitest run
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/tests/ client/vite.config.ts
git commit -m "test: Login component error state test"
```

---

### Task 16: Docker & Deployment

**Files:**
- Create: `server/Dockerfile`
- Create: `client/Dockerfile`
- Create: `docker-compose.yml`
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `server/Dockerfile`**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

- [ ] **Step 2: Create `client/Dockerfile`**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

- [ ] **Step 3: Create `docker-compose.yml`**

```yaml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: crm
      POSTGRES_PASSWORD: crm_pass
      POSTGRES_DB: realestate_crm
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  server:
    build: ./server
    env_file: ./server/.env
    depends_on:
      - db
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgres://crm:crm_pass@db:5432/realestate_crm

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  pgdata:
```

- [ ] **Step 4: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: crm
          POSTGRES_PASSWORD: crm_pass
          POSTGRES_DB: realestate_crm
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: cd server && npm ci
      - run: cd server && npx jest --no-coverage
        env:
          DATABASE_URL: postgres://crm:crm_pass@localhost:5432/realestate_crm
          JWT_SECRET: test_secret_32chars_minimum_len

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: cd client && npm ci
      - run: cd client && npx vitest run
```

- [ ] **Step 5: Commit**

```bash
git add server/Dockerfile client/Dockerfile docker-compose.yml .github/
git commit -m "chore: Docker setup + GitHub Actions CI pipeline"
```

---

## Self-Review

### Spec Coverage Check

| Requirement | Task |
|---|---|
| Lead capture (website, ads, calls, referrals) | Task 4 + Task 13 (webhook) |
| Lead status workflow | Task 4 |
| Lead assignment to agents | Task 4 |
| Follow-up reminders | Task 7 |
| Property CRUD with images | Task 5 |
| Property search & filtering | Task 5 |
| Client profiles & interaction log | Task 6 + Task 7 |
| Deal pipeline (Kanban) | Task 6 + Task 11 |
| Commission calculation | Task 6 |
| Document management | Model in Task 2 (upload endpoints extend Task 5 pattern) |
| Call/SMS/Email tracking | Task 7 |
| Role-based access (Admin/Manager/Agent) | Task 3 |
| Agent performance reports | Task 8 |
| Lead conversion rate | Task 8 |
| Revenue tracking | Task 8 |
| Website integration (webhook) | Task 13 |
| REST API | All route tasks |
| Mobile-friendly UI | Tailwind responsive grid in Task 10 |
| Auth & security | Task 3, Task 14 |
| Dockerized deployment | Task 16 |
| CI/CD pipeline | Task 16 |

### Known Gaps / Stretch Tasks
- **Document upload for deals:** The `Document` model exists (Task 2). Add a `POST /api/deals/:id/documents` route following the same Multer pattern as `POST /api/properties/:id/images`.
- **Map integration:** Add `latitude`/`longitude` to property form and render a Leaflet map in `PropertyList.tsx`.
- **WhatsApp / AI lead scoring:** Optional advanced features — implement after core is stable using n8n webhooks (the n8n instance in the PDF can orchestrate these flows).
- **Export (Excel/PDF):** Add `GET /api/reports/export` using `exceljs` on the backend.

---

**Plan complete and saved.** Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
