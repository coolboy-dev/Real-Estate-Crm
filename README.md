# Real Estate CRM | Architectural Grade Management

A high-end, production-ready Real Estate CRM designed with a **Modern Architectural / Refined Editorial** aesthetic. This system manages the entire property lifecycle, from automated lead acquisition to geospatial portfolio visualization and fiscal intelligence reporting.

## 🏛️ Core Features
*   **Architectural Dashboard:** Dynamic, role-based interfaces for Admins (Global oversight) and Agents (Personal performance).
*   **Geospatial Intelligence:** Integrated Leaflet mapping system for property portfolio visualization.
*   **Strategic Deal Pipeline:** A high-fidelity Kanban board for managing multi-stage property transactions.
*   **Automated Fiscal Reporting:** Real-time revenue tracking and agent performance analytics with one-click **Excel Dossier** generation.
*   **Automated Follow-ups:** Cron-based scheduling system with Email and SMS (Twilio) integration.

## 🛠️ Tech Stack
*   **Frontend:** React 19 + TypeScript + Tailwind CSS 4.0
*   **Backend:** Node.js + Express (ESM NodeNext)
*   **Database:** PostgreSQL + Sequelize ORM
*   **Infrastructure:** Docker + Nginx (Production Routing)
*   **CI/CD:** GitHub Actions

---

## 🚀 Quick Start (Docker)

The easiest way to start the system is using Docker Compose.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/coolboy-dev/Real-Estate-Crm.git
    cd Real-Estate-Crm
    ```

2.  **Environment Setup:**
    Create a `.env` file in the `server/` directory (see [Environment Variables](#-environment-variables) below).

3.  **Launch:**
    ```bash
    docker compose up -d --build
    ```

4.  **Access:**
    *   **Frontend:** [http://localhost](http://localhost)
    *   **API:** [http://localhost:4000/api](http://localhost:4000/api)

---

## 🔑 Environment Variables

Create a `server/.env` file with these parameters:

```env
PORT=4000
DATABASE_URL=postgres://crm:crm_pass@db:5432/realestate_crm
JWT_SECRET=your_secure_random_key_here
JWT_EXPIRES_IN=7d

# Optional Integrations
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_pass
TWILIO_SID=your_sid
TWILIO_TOKEN=your_token
TWILIO_PHONE=your_twilio_number
```

---

## 📖 API Documentation
A comprehensive technical manual is available in the root directory: **`CRM_Documentation.pdf`**. 

This document details all endpoints for:
*   Authentication & User Roles
*   Lead Acquisitions & Webhooks
*   Property Portfolio Management
*   Deal Pipelines & Commissions
*   Fiscal Intelligence Reports

---

## 🧪 Mock Data
To populate the CRM with luxury property samples and agents for testing, run:
```bash
docker compose exec server node dist/seed.js
```

## 📜 License
Architectural Grade Systems © 2026. Internal Enterprise Use.
