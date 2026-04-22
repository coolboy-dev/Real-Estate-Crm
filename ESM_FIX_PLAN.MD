# ESM Compliance & Bug Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the server codebase complies with NodeNext ESM requirements by fixing imports and types, and resolve specific reported bugs.

**Architecture:** The project uses Node.js with ESM (`type: module`). TypeScript is configured with `module: NodeNext`. This requires relative imports to include the `.js` extension and encourages explicit `import type` usage.

**Tech Stack:** Node.js, TypeScript, Express, Sequelize, Nodemailer.

---

## File Structure

This plan touches almost all files in `server/src/` to update imports.
Specific fixes:
- `server/src/routes/user.routes.ts`: Type casting for `findByPk`.
- `server/src/services/sms.service.ts`: Type casting for `env.TWILIO_PHONE`.
- `server/src/config/db.ts`: Import extension.
- `server/src/models/*.ts`: Import extensions.
- `server/src/services/lead.service.ts`: Type casting for `Lead.create`.

---

### Task 1: Specific Bug Fixes

**Files:**
- Modify: `server/src/routes/user.routes.ts`
- Modify: `server/src/services/sms.service.ts`
- Modify: `server/src/config/db.ts`
- Modify: `server/src/services/lead.service.ts`

- [ ] **Step 1: Fix `req.params.id` casting in `user.routes.ts`**
Cast `req.params.id` to `string` (as it comes from URL) before passing to `findByPk`.

- [ ] **Step 2: Fix `env.TWILIO_PHONE` casting in `sms.service.ts`**
Cast `env.TWILIO_PHONE` to `string` in `client.messages.create`.

- [ ] **Step 3: Add `.js` to `env` import in `config/db.ts`**
Change `import { env } from "./env"` to `import { env } from "./env.js"`.

- [ ] **Step 4: Ensure `data` is cast to `any` in `lead.service.ts`**
Verify/ensure `Lead.create(data as any)` is used.

---

### Task 2: Batch Model Import Fixes

**Files:**
- Modify: `server/src/models/*.ts` (all 8 models)

- [ ] **Step 1: Update `db` import in all models**
Change `import { sequelize } from "../config/db"` to `import { sequelize } from "../config/db.js"` in:
- `Activity.ts`
- `Client.ts`
- `Deal.ts`
- `Document.ts`
- `FollowUp.ts`
- `Lead.ts`
- `Property.ts`
- `User.ts`

---

### Task 3: Batch Import & Type Extension Fixes

**Files:**
- Modify: `server/src/index.ts`
- Modify: `server/src/config/*.ts`
- Modify: `server/src/middleware/*.ts`
- Modify: `server/src/routes/*.ts`
- Modify: `server/src/services/*.ts`
- Modify: `server/src/jobs/*.ts`

- [ ] **Step 1: Add `.js` extensions to all relative imports**
Search and replace all `from "./..."` and `from "../..."` to include `.js`.

- [ ] **Step 2: Use `import type` for TypeScript-only imports**
Identify imports that are interfaces or types (e.g., `UserRole`, `AuthRequest`, `LeadStatus`) and use `import type` or `{ type X }`.

---

### Task 4: Verification

- [ ] **Step 1: Run TypeScript compiler to verify changes**
Run `npm run build` in `server` directory.

- [ ] **Step 2: Check for any remaining relative imports without `.js`**
Use grep to verify.
