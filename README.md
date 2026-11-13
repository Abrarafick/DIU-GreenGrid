# DIU GreenGrid — Smart Campus Energy Intelligence & Sustainability Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-10b981.svg)](https://github.com/diu-greengrid)
[![Tests Passing](https://img.shields.io/badge/Tests-177%2F177%20Passed-10b981.svg)](https://github.com/diu-greengrid)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2d3748.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **DIU GreenGrid** is a 100% software-first smart campus energy intelligence, predictive analytics, and sustainability management platform engineered specifically for **Daffodil International University (DIU Ashulia Smart Campus)**.
>
> It unifies multi-source energy telemetry, resolves campus energy balance discrepancies, powers AI-driven demand and solar forecasting, detects empirical operational anomalies, tracks UN Sustainable Development Goals (SDG 7, 9, 12, 13), and manages verifiable energy conservation actions from detection to audited kWh savings.

---

## 🏛️ Executive Summary & Vision

University campuses in South Asia face mounting challenges with grid reliability, rising distribution losses, complex mixed energy generation (rooftop solar, grid incomers, standby diesel generators), and institutional carbon reduction commitments.

Traditional energy management solutions typically require massive capital outlays for intrusive new smart meters, ESP32 IoT gateways, electrical sub-panel disruptions, and proprietary hardware lock-in.

**DIU GreenGrid completely flips this paradigm:**
- **Zero New Hardware Required**: Operates entirely over DIU's existing infrastructure, inverter exports, utility incomer meters, and database interfaces.
- **Mathematical Transparency**: Never forces energy balance to artificially equal zero. It unmasks substation transformer line losses and unutilized solar surplus.
- **Strict Anti-Double-Counting**: Only clean renewable electricity *actually consumed on campus* is credited toward avoided greenhouse gas emissions.
- **Strictly Non-Financial**: Excludes financial ROI, electricity billing, and currency proxies. Evaluates performance purely in engineering units: **kWh**, **kW**, **Litres of Diesel**, and **kg CO₂e**.
- **Auditable Action Lifecycle**: Connects automated AI anomaly detection directly to physical maintenance teams, verifying permanent before-and-after kilowatt-hour savings.

---

## 📐 System Architecture

DIU GreenGrid employs an asynchronous, multi-layered decoupled architecture:

```mermaid
flowchart TD
    subgraph Data Sources [DIU Campus Energy Sources - Zero Hardware Ingress]
        Solar[850 kWp Rooftop Solar PV Inverters]
        Grid[11 kV / 415 V Substation Incomer Meter]
        Genset[1000 kW Standby Diesel Generator Fuel Logbook]
        Biogas[30 kW Pilot Biogas Digestor]
    end

    subgraph Ingestion Layer [Multi-Source Data Ingestion & Provenance Engine]
        Adapters[REST API Connectors / Polling Adapters]
        Upload[CSV & Excel Batch Ingestor]
        Manual[Authorized Manual Sub-Meter Portal]
        Provenance[Data Provenance & Freshness Engine]
    end

    subgraph Analytical Core [High-Precision Energy Accounting]
        Balance[Energy Balance Engine - Unmasked Residual Δ]
        SelfCons[Renewable Self-Consumption vs Surplus Segregator]
        GHG[Scope 1 & Scope 2 GHG Inventory]
        Losses[Substation Distribution Loss Modeling]
    end

    subgraph AI Engine [Predictive Intelligence & Anomaly Detection]
        DemandForecaster[Diurnal EWMA Demand Forecaster - 24h & 7d with 90% CI]
        SolarForecaster[Diurnal Clear-Sky Irradiance Model]
        AnomalyDetector[6-Vector Z-Score Anomaly Detector]
        RecEngine[Actionable Recommendation Engine]
    end

    subgraph Management Modules [Institutional Governance & Actions]
        SDGTracker[UN SDG 7, 9, 12, 13 Indicator Framework]
        TargetManager[Institutional Target Management & Gap Tracking]
        ActionManager[Green Campus Action Lifecycle - Before vs After Audit]
        Reporting[Multi-Sheet Excel .xlsx & CSV Reporting Hub]
    end

    Solar --> Adapters
    Grid --> Adapters
    Genset --> Manual
    Biogas --> Upload

    Adapters --> IngestionLayer
    Upload --> IngestionLayer
    Manual --> IngestionLayer

    IngestionLayer --> AnalyticalCore
    AnalyticalCore --> AI Engine
    AnalyticalCore --> ManagementModules
    AI Engine --> ActionManager
```

---

## 🌟 Key Capabilities by Phase

### Phase 1: Foundation, Building Registry & Documented Emission Factors
- **Role-Based Access Control (RBAC)**: Enforces three distinct operational roles (`ADMIN`, `FACILITY_MANAGER`, `AUDITOR_VIEWER`) with HTTP-only encrypted JWT session cookies.
- **Ashulia Campus Building Registry**: Pre-configured with the 5 permanent campus facilities totaling **69,000 m² Gross Floor Area (GFA)**:
  1. *Academic Building 01 (AB-01)* — 18,500 m² (Classrooms & Lecture Halls)
  2. *Academic Building 02 (AB-02)* — 16,000 m² (Computer & AI Labs, Engineering Workshops)
  3. *Yunus Khan Scholar Garden (YK-SG)* — 22,000 m² (Student Halls of Residence)
  4. *Central Library & Knowledge Center (LIB)* — 5,500 m² (Reading Halls & Digital Archives)
  5. *Administrative Building (ADMIN)* — 7,000 m² (Syndicate Hall & Executive Offices)
- **Documented Emission Factors**:
  - **Grid Electricity**: `0.637 kg CO₂e / kWh` (Source: Bangladesh Department of Environment & CDM Combined Margin).
  - **Diesel Combustion**: `2.68 kg CO₂e / Litre` (Source: 2006 IPCC Guidelines for National GHG Inventories, Vol. 2 Energy, Table 2.2).

### Phase 2: Multi-Source Energy Data Ingestion & Provenance Tracking
- **Multi-Source Ingestion Pipeline**: Ingests Solar PV yield, Utility Grid incomer power, Standby generator runtime & fuel volume, and Biogas pilot data.
- **Data Provenance & Freshness Machine**: Every reading carries provenance tracking:
  - `REAL_API` (0.98 confidence)
  - `CSV_IMPORT` (0.95 confidence)
  - `MANUAL_ENTRY` (0.85 confidence)
  - `SIMULATED_DEMO` (0.00 confidence, transparently labeled)
- **Template Generation & Validation**: Downloadable CSV and Excel templates with unit normalization, duplicate detection, and automated error logging.

### Phase 3: Real-Time Analytics & Building Consumption Dashboard
- **Energy Balance Residual ($\Delta$) Unmasking**: Rejects forced zero-balance assumptions. Positively quantifies and displays the residual:
  $$\Delta = \text{Total Inputs} - \text{Total Campus Consumption} = +12,468.2\text{ kWh } (+24.67\%)$$
  Composed of **$937.8\text{ kWh}$** in technical line/transformer distribution losses and **$11,530.4\text{ kWh}$** in unutilized midday solar generation surplus.
- **Renewable Self-Consumption**: Distinguishes gross renewable generation ($30,485\text{ kWh}$) from clean energy actually consumed on campus ($18,954.6\text{ kWh}$), yielding an accurate clean energy self-consumption contribution of **$49.8\%$**.
- **Freshness State Machine**: Visual state indicator dynamically classifying data into `LIVE`, `RECENT`, `STALE`, or `SIMULATED`.

### Phase 4: AI Energy Intelligence & Predictive Analytics
- **24-Hour & 7-Day Demand Forecasting**: Diurnal Holt-Winters exponential smoothing and time-of-week decomposition with statistical **$90\%$ confidence intervals**.
- **Diurnal Solar Forecasting**: Clear-sky solar irradiance model mapped to DIU Ashulia coordinates ($23.8763^\circ\text{ N}, 90.3204^\circ\text{ E}$) with performance ratio adjustments and explicit weather disconnect disclaimers.
- **6-Vector Empirical Anomaly Detection**:
  1. *Unusual Nighttime Consumption* ($Z > 2.0$)
  2. *Unexpected Consumption Spikes*
  3. *Abnormal Building EUI Variance*
  4. *Sudden Generation Drops*
  5. *Weekend Off-Peak Baseload Elevation*
  6. *Meter Telemetry Quality Gaps*
- **Actionable AI Recommendations**: Directly converts detected anomalies into operational work orders with 1-click dispatch to engineering teams.

### Phase 5: Sustainability, SDG Tracking & Action Management
- **UN Sustainable Development Goals (SDG)**:
  - **SDG 7 (Affordable & Clean Energy)**: Indicator 7.2.1 Clean Energy Contribution ($49.8\%$, Target $50.0\%$, Gap $0.2\%$). Indicator 7.3.1 EUI ($0.074\text{ kWh/m}^2$, Target $0.070$).
  - **SDG 9 (Industry, Innovation & Infrastructure)**: Indicator 9.4.1 Digital Sub-Metering ($100\%$, $69,000\text{ m}^2$, Status: `ACHIEVED`).
  - **SDG 12 (Responsible Consumption & Production)**: Indicator 12.2.1 Off-Peak Waste Ratio ($18.2\%$, Target $15.0\%$). Indicator 12.5.1 Verified Permanent Savings ($1,280\text{ kWh}$, Target $2,000$).
  - **SDG 13 (Climate Action)**: Indicator 13.2.1 Avoided Scope 2 Emissions ($19,469\text{ kg CO}_2\text{e}$ monthly rate). Indicator 13.2.2 Verified GHG Reductions ($815.4\text{ kg CO}_2\text{e}$, Target $1,250$).
- **GHG Corporate Protocol Inventory**: Strict segregation between Scope 1 (Diesel fuel), Scope 2 (Grid import), and Avoided Emissions. Strict non-double-counting protocol ensures unconsumed solar surplus is never counted as avoided carbon.
- **Green Campus Action Management**: Complete lifecycle workflow (`IDENTIFIED` $\to$ `IN_PROGRESS` $\to$ `COMPLETED` $\to$ `VERIFIED`) with empirical before-and-after baseline sub-meter verification.
- **Formal Reporting Hub**: Downloadable reports in **CSV** and multi-sheet **Microsoft Excel (`.xlsx`)** workbooks, plus a print-friendly summary view modal.

### Phase 6: Quality Assurance, Security Audit & Production Deployment
- **177 / 177 Automated Tests Passing**: Zero regressions across all 6 modular test suites.
- **Security Hardened**: Server-side RBAC on all mutation routes, 15MB file upload guard with filename sanitization, rate-safe error boundaries, and secure cookie parameters.
- **Production Ready**: Verified Next.js 15 production build, PostgreSQL schema migration file (`prisma/schema.postgresql.prisma`), multi-stage Dockerfile, and production environment templates.

---

## 🛠️ Technology Stack

| Domain | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15.1.7 (App Router) | Full-stack server and client architecture |
| **Frontend UI** | React 19, TailwindCSS 3.4 | Responsive, modern dark-mode management interface |
| **Icons** | Lucide React | High-clarity operational iconography |
| **Data Visualizations** | Recharts 3.10 | Composed time-series charts, bar charts, heatmaps |
| **ORM & Database** | Prisma 6.4.1 (SQLite / PostgreSQL) | Type-safe schema modeling, migrations, and queries |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` | Stateless session management with HTTP-only cookies |
| **Spreadsheet Processing**| `xlsx` (SheetJS) & `papaparse` | CSV and multi-sheet Excel generation and validation |
| **Testing** | Node.js Test Runner & `tsx` | Automated integration and regression test suites |

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v20 and v22)
- npm or pnpm

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/diu-greengrid/diu-greengrid.git
cd diu-greengrid
npm install
```

### 3. Environment Configuration
The application comes preconfigured for local zero-setup execution using SQLite. Copy the environment template:
```bash
cp .env.example .env
```

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to local database
npm run db:push

# Seed with demonstration dataset (5 buildings, 4 sources, 210 telemetry metrics, 5 targets, 5 actions)
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔐 Demo Credentials (Evaluation Only)

The platform includes three pre-configured accounts mapped to DIU operational roles for competition testing:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@diu.edu.bd` | `DiuFacilities#2026` | Full administrative control, user management, targets, audit logs |
| **Facility Manager** | `facility@diu.edu.bd` | `DiuFacilities#2026` | Telemetry ingestion, manual entry, action dispatch, savings audit |
| **Auditor / Viewer** | `auditor@diu.edu.bd` | `DiuFacilities#2026` | Read-only access to analytics, SDGs, and formal reports |

> *Note: These credentials are strictly intended for local demonstration and evaluation. In production environments, credentials must be generated dynamically with distinct passwords and multi-factor authentication.*

---

## 🧪 Comprehensive Verification Suite

Run all automated test suites covering Phases 1 through 6:

```bash
# Run all test suites sequentially
node tests/phase1-check.js
node tests/phase2-check.js
node tests/phase3-check.js
node tests/phase4-check.js
node tests/phase5-check.js
node tests/phase6-e2e-security-audit.js
```

### Overall Test Matrix Summary:
- **Phase 1 Check**: 21 / 21 Passed (100%)
- **Phase 2 Check**: 20 / 20 Passed (100%)
- **Phase 3 Check**: 24 / 24 Passed (100%)
- **Phase 4 Check**: 32 / 32 Passed (100%)
- **Phase 5 Check**: 37 / 37 Passed (100%)
- **Phase 6 Audit**: 43 / 43 Passed (100%)
- **Total Passing**: **177 / 177 tests (100% success rate)**

---

## 🐳 Production Deployment Guide

### Deploying with Docker
A multi-stage `Dockerfile` is included for containerized deployment:

```bash
# Build production Docker image
docker build -t diu-greengrid:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/diu_greengrid?sslmode=require" \
  -e JWT_SECRET="your-cryptographically-secure-random-secret" \
  diu-greengrid:latest
```

### Deploying with PostgreSQL (Cloud / RDS / Neon / Supabase)
1. Copy `.env.production.example` to `.env.production`.
2. Replace `provider = "sqlite"` with `provider = "postgresql"` in `prisma/schema.prisma` (or use the pre-built `prisma/schema.postgresql.prisma`).
3. Set your production PostgreSQL URL in `DATABASE_URL`.
4. Apply migrations: `npx prisma db push`.
5. Seed initial data: `node prisma/seed.js`.
6. Run production build: `npm run build && npm start`.

---

## ⚠️ Known Limitations & Future Roadmap

1. **Weather Satellite Telemetry**: Current solar generation forecasting relies on historical clear-sky irradiance curves. Integrating live satellite API feeds (e.g. Open-Meteo Solar API) will enable cloudy-day solar yield adjustments.
2. **Sub-Panel Meter Sub-Dividing**: Building-level telemetry currently monitors total building incomer feeders. Future firmware updates on existing switchboards could allow floor-by-floor sub-metering without new hardware.
3. **Automated Modbus TCP Ingress**: The architecture currently supports REST API polling and batch uploads. A direct daemon service can be deployed at the Ashulia main substation for continuous live socket polling.

---

## 📜 Ethical Integrity & Compliance Pledge

- **No Hardware Fabrication**: DIU GreenGrid requires zero ESP32s, smart meters, or electrical retrofits.
- **No Hidden Simulation**: All demonstration telemetry is explicitly labeled as `SIMULATED` with $0.0$ confidence rating.
- **Strict Anti-Double-Counting**: Solar surplus not consumed on campus is never credited as avoided emissions.
- **Zero Financial ROI**: Complies strictly with the non-financial mandate. Evaluates performance purely in physical engineering units (**kWh**, **kW**, **Litres**, and **kg CO₂e**).
