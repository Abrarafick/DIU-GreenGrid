# DIU GreenGrid

> **Software-First Smart Campus Energy Intelligence, Sustainability & Action Management Platform**  
> Tailored for the Daffodil International University (DIU) Ashulia Smart Campus.

---

## 🏛️ Core Architectural Principles

1. **100% Software-First (Zero New Hardware)**:
   - Does **not** require or propose installing any new microcontrollers (ESP32), smart meters, IoT devices, or electrical modifications.
   - Integrates with DIU's existing inverter portals, database exports, CSV/Excel records, digital sub-meters, and authorized network feeds.

2. **Transparent Data Provenance**:
   - Every metric carries auditable provenance metadata (`sourceType`, `confidenceRating`, `isSimulated`).
   - Demonstration data is prominently flagged as **`SIMULATED / DEMO MODE`** to ensure 100% ethical integrity during evaluations.

3. **Strictly Non-Financial & Technical Focus**:
   - Completely removes all financial ROI, electric bill management, and monetary cost tracking.
   - Diesel backup generator consumption is tracked **strictly in technical Litres and runtime hours**.

4. **Documented & Configurable Emission Factors**:
   - Grid Electricity Factor: **0.637 kg CO₂e / kWh** (Source: Bangladesh Department of Environment (DoE) & UNFCCC Grid Study).
   - Diesel Combustion Factor: **2.68 kg CO₂e / Litre** (Source: IPCC 2006 Guidelines for Stationary Combustion).
   - Fully configurable by authorized Administrators and Facility Managers with transparent assumption notes.

5. **Realistic Infrastructure Assumptions**:
   - Does **not** assume battery energy storage systems (BESS) or automated electrical controls exist at DIU.
   - Focuses on Grid Incomer, Rooftop Solar PV Arrays, and Emergency Standby Diesel Generation.

6. **Targeted Sustainability & SDG Tracking**:
   - **SDG 7**: Affordable & Clean Energy (Renewable solar generation ratio).
   - **SDG 9**: Industry, Innovation & Infrastructure (Pure software digitalization).
   - **SDG 12**: Responsible Consumption (Idle baseload mitigation & waste reduction).
   - **SDG 13**: Climate Action (Scope 2 emissions avoided via on-campus solar).
   - *SDG 11*: Sustainable Cities & Communities (Campus green score indicator).

7. **Action & Improvement Management**:
   - Tracks detected issues, recommended technical interventions, assigned maintenance teams, before-and-after consumption, and **verified kWh energy savings**.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ (tested on Node v22)
- npm or pnpm

### 2. Environment Configuration
The project is preconfigured with SQLite for zero-setup execution. A `.env` file is already generated:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="diu-greengrid-secure-jwt-secret-key-2026"
```
*(To switch to PostgreSQL in staging/production, update `provider = "postgresql"` in `prisma/schema.prisma` and configure `DATABASE_URL`)*.

### 3. Database Migration & Demonstration Seeding
```bash
# Push schema to SQLite/PostgreSQL
npm run db:push

# Populate Phase 1 buildings, energy sources, emission factors, and demo records
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Demonstration RBAC Credentials

For hackathon review and role testing, one-click login buttons or the following credentials can be used:

| Role | University Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@diu.edu.bd` | `Admin@GreenGrid2026!` | Full configuration, edit emission factors, create actions, manage users |
| **Facility Manager** | `facility@diu.edu.bd` | `Facility@2026!` | Log energy improvement actions, update operational factors, view all analytics |
| **Sustainability Auditor** | `auditor@diu.edu.bd` | `Auditor@2026!` | Read-only audit access to SDG indicators, carbon models, and verification logs |

---

## 🧪 Verification & Integration Tests
To execute the automated 17-point test suite:
```bash
node tests/phase1-check.js
```
Expected output: **17/17 PASSED (100% SUCCESS)**.
