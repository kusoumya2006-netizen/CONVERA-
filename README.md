# CaseWatch | SIH26264
> **Unified Institution Complaint Intelligence & Cross-Bureau Coordination Platform**  
> *Developed for Smart India Hackathon 2026 — Problem Statement SIH26264: Integrated Institution Complaint Monitoring and Status Dashboard*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-Passing%20(15%2F15)-emerald.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 1. Executive Summary & Problem Statement

The **All India Council for Technical Education (AICTE)** receives thousands of institution-related grievances and compliance reports annually. Currently, these complaints are handled independently by disparate Bureaus and Cells:
* **Regulation Bureau (RB)**: Manages compliance with AICTE Approval Process Handbooks (APH), infrastructure audits, land and building encumbrances, and faculty cadre ratios.
* **Public Grievance Redressal Cell (PGRC)**: Investigates student grievances, arbitrary fee demands, certificate withholding, anti-ragging complaints, and faculty pay scale non-compliance.
* **Approval Bureau (AB)**, **Finance Bureau**, and **Vigilance Cell**: Process Extension of Approvals (EoA), forensic audits, and whistleblower allegations.

### The Operational Challenge
Because cases are logged across disjointed silos:
1. **Duplicated Regulatory Burden**: Multiple inspection committees visit the same campus simultaneously for overlapping matters.
2. **Conflicting Regulatory Directives**: One bureau might issue a Show-Cause notice or halt admissions while another bureau conducts conciliation or grants Extension of Approval.
3. **Delayed Grievance Disposal**: Lack of inter-cell coordination leads to severe SLA violations and prolonged student/faculty distress.

### The CaseWatch Solution
**CaseWatch** acts as a centralized intelligence layer connecting all AICTE bureaus. Powered by a **Deterministic Overlap Detection Engine**, CaseWatch monitors all incoming and active cases in real time, automatically alerts officials when multiple open proceedings target the same technical institution across cells (with special priority on **RB + PGRC** conflicts), tracks chronological action histories, and empowers authorized officers to establish coordinated joint review protocols without prematurely dismissing or merging valid complaints.

---

## 2. SIH Sprint Deliverables & Demo Credentials

### 🔐 Verified Official Demo Credentials
For evaluators, CONVERA includes pre-configured authorized credentials with persistent role-based sessions:

| Official Name | Role & Designation | Bureau | Official Email | Password |
|---|---|---|---|---|
| **Dr. Amitabh Ghosh** | Regulation Bureau Director | RB | `director.rb@aicte-india.org` | `Regulation@2026` |
| **Smt. Sunita Mohanty** | Grievance Redressal Director | PGRC | `director.pgrc@aicte-india.org` | `Grievance@2026` |
| **Dr. R. K. Verma** | National AICTE Coordinator | Super Admin | `coordinator@aicte-india.org` | `Synchra@2026` |
| **Dr. Suresh N. Patil** | Regional Officer | Western Cell | `officer.western@aicte-india.org` | `Western@2026` |

*Note: Any official email ending in `@aicte-india.org` with a password of 6+ characters is also dynamically authenticated as a demo scrutiny officer.*

### 🚀 P0 — Authentication & Visual Theme
* Split-screen enterprise authentication UI featuring authentic campus photography of **Sri Venkateswara College of Engineering (SVCE)** with dark overlay and readable typography.
* Real-time field validation, password show/hide, "Remember me" session persistence, error feedback, and seamless sign-out.
* Fully operational standalone demo mode without external backend dependencies.

### 📅 P1 — Core Case Management & "Completed — Last 14 Days"
* **Dedicated 14-Day Completion View**: Filters cases strictly by their completion timestamp (`completedAt`), ignoring initial receipt/creation dates.
* **Audit Stamping**: Stamping `completedAt`, `completedBy`, `completedByOfficerId`, and `resolutionSummary` directly into the immutable regulatory ledger.
* **High-Visibility Resolution Dossier**: Disposed cases render a specialized green resolution card with full details and authorizing officer credentials.
* **Reopen Case Workflow**: Authorized officers can reopen disposed proceedings with an official justification. The prior disposal and resolution are preserved in the audit trail while removing the case from the active completed list.

### 🔀 P2 — Consolidated & Merged Case Registry
* **Dedicated Merged Cases View**: Groups lead primary dossiers with all consolidated sub-complaints.
* **Consolidation Details**: Displays primary case ID, child case IDs, merging officer, merge timestamp, and official regulatory reason.
* **Integrity Guardrails**: Strictly prevents self-merges (`caseId === childId`), duplicate merges, already-merged parent re-merging, and circular relationships. Original child records and audit histories are 100% preserved.
* **Unmerge Capability**: Allows authorized officers to safely separate complaints if independent proceedings are later warranted.

---

## 3. Key Capabilities & Architectural Features

### 🏛️ Professional Government Administrative Interface
Designed strictly following enterprise Indian government portal aesthetics:
* Deep slate/charcoal sidebar (`#1e293b`) with Ashoka / AICTE identity motifs.
* High-density, accessible layout optimized for desktop and tablet screens.
* Controlled, restrained alert color system (Olive green `#365314` for compliance, Amber for pending, Rose for critical SLA / overlap warnings).

### 🔍 Deterministic Overlap Detection Engine
* **Priority 1 (Normalized Permanent IDs)**: Strips non-alphanumeric noise and performs exact matching against AICTE institute IDs (e.g., `1-4392811`).
* **Priority 2 (Normalized Name Fallback)**: If institution ID is missing from intake, runs token-normalized name matching flagged with `MEDIUM` confidence to prevent false positives.
* **Priority 3 (Cross-Bureau Flagging)**: Triggers an alert when 2 or more distinct bureaus (specifically RB + PGRC) hold open cases for the institution.
* **Idempotent & Preserving**: Preserves coordination decisions, notes, and reviewer signatures across re-evaluations.

### 📋 Full Case Lifecycle Management
* **Search & Multi-Facet Filtering**: Filter by keyword, Case ID, Permanent Institute ID, Bureau, Status, Region, Category, and SLA cutoff.
* **Immutable Chronological Action Log**: Records every Show-Cause notice, inspection committee recommendation, status change, and bureau transfer.
* **Case Linkage**: Connects cross-referenced complaints without destructively merging them.

### 🏫 Institution Profiles
* Directory of technical institutes with consolidated complaint histories across all bureaus.
* Risk indicators highlighting institutions with concurrent regulatory actions.

### 📊 Reports & CSV Export Engine
* Live calculation of National Disposal Rates, Bureau-wise workload, Regional footprints, and SLA Ageing (0-15d, 16-30d, 31-60d, >60d).
* Filter-aware CSV exports for statutory recordkeeping.

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | React 18 + Vite | Blazing fast client-side rendering and rapid HMR |
| **Language** | TypeScript 5.6 | Strict type safety for complex regulatory data structures |
| **Styling** | Tailwind CSS 3.4 | Government enterprise palette, responsive grid layouts |
| **Visualizations**| Recharts 2.13 | Interactive SVG charts (Stacked Workload, Status Donut, Ageing) |
| **Icons** | Lucide React | Clean, standard administrative iconography |
| **Testing** | Vitest | Deterministic test runner for the overlap engine |
| **Persistence** | LocalStorage + Firebase Hooks | Zero-config standalone Demo Mode + optional cloud sync |

---

## 4. Overlap Detection Engine & Matching Logic

The matching algorithm is decoupled in [`src/engine/overlapDetector.ts`](file:///Users/kumarsubramanian/Desktop/CONVERA/src/engine/overlapDetector.ts) and follows a rigorous 3-tier deterministic pipeline:

```
+-------------------------------------------------------------+
|                      Incoming Cases                         |
+-------------------------------------------------------------+
                              │
                              ▼
               [ Filter to Active Cases Only ]
               (Exclude Disposed / Closed Cases)
                              │
                              ▼
            [ Group by Institution Identifier ]
       ┌──────────────────────┴──────────────────────┐
       ▼                                             ▼
  Has Institution ID?                         Missing Institution ID?
  Normalize: [0-9A-Z]                         Normalize: Lowercase, Strip Punct.
  Confidence = HIGH                           Confidence = MEDIUM
       └──────────────────────┬──────────────────────┘
                              ▼
       [ Count Distinct Active Bureaus per Group ]
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
        Single Bureau Only           >= 2 Distinct Bureaus
        (e.g., all RB)               (e.g., RB + PGRC, AB)
               │                             │
               ▼                             ▼
       [ NO OVERLAP ]           [ FLAG OVERLAP ALERT ]
                                Deterministic Alert ID Generated
                                Check if RB + PGRC Concurrent
                                Preserve Existing Coordination Remarks
```

### Unit Test Suite
The test suite in [`src/engine/overlapDetector.test.ts`](file:///Users/kumarsubramanian/Desktop/CONVERA/src/engine/overlapDetector.test.ts) validates 7 critical scenarios:
1. ✅ **RB + PGRC Overlap**: Correctly flags concurrent cases with `HIGH` confidence.
2. ✅ **Single-Bureau Handling**: Multiple cases in the same bureau do not trigger cross-bureau alarms.
3. ✅ **Disposed Case Exclusion**: Resolved cases are excluded from active alarms.
4. ✅ **Cross-Institution Isolation**: Cases across different institutions never cross-pollinate.
5. ✅ **Missing ID Fallback**: Resolves institutions by normalized name with `MEDIUM` confidence.
6. ✅ **Duplicate Prevention**: Idempotent re-runs preserve user coordination directives.
7. ✅ **Normalization Verification**: Handles whitespaces, hyphens, and casing anomalies.

---

## 5. Seed Demonstration Scenarios

CaseWatch seeds 18 technical colleges across all 7 AICTE regions and 30 realistic cases, featuring **3 deliberate cross-bureau overlap scenarios**:

1. **Apex Institute of Technology & Engineering (PID: 1-4392811, Northern Region)**:
   * `AICTE/RB/2026/0104`: Regulation Bureau investigation into unapproved off-campus branch intake.
   * `AICTE/PGRC/2026/0047`: PGRC complaint from graduating students regarding certificate withholding and excess fees.
   * `AICTE/AB/2026/0019`: Approval Bureau holding Extension of Approval (EoA) pending inquiry resolution.
2. **Vidyapeeth College of Engineering & Research (PID: 1-8923412, Western Region)**:
   * `AICTE/RB/2026/0088`: RB Surprise EVC inspection revealing 42% faculty deficiency.
   * `AICTE/PGRC/2026/0029`: PGRC faculty grievance regarding 6 months withheld salary and PF defaulting.
   * `AICTE/FIN/2026/0007`: Finance Bureau audit notice for grant recovery.
3. **Kalinga Institute of Science & Applied Tech (PID: 1-6712390, Eastern Region)**:
   * `AICTE/RB/2026/0121`: RB equipment deficiency notice for non-functional CAD/CAM laboratories.
   * `AICTE/PGRC/2026/0063`: PGRC parent complaint regarding compulsory unapproved "Infrastructure Cess".

---

## 6. Local Setup and Development

### Prerequisites
* **Node.js**: v18.0.0 or later (tested on v25.8.0)
* **npm**: v9.0.0 or later

### Installation Steps
```bash
# Clone repository
git clone https://github.com/your-team/casewatch-sih26264.git
cd casewatch-sih26264

# Install dependencies
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser. CaseWatch launches immediately in **Demo Mode** with persistent LocalStorage.

### Running Unit Tests
```bash
npm run test
```

### Creating Production Build
```bash
npm run build
```
Generates optimized static assets in the `dist/` directory ready for deployment on Vercel or Firebase Hosting.

---

## 7. Interactive Demo Workflow

Follow these steps to demonstrate the end-to-end hackathon workflow to evaluators:

1. **Dashboard Ticker & KPIs**:
   * Open the dashboard to view dynamic counters: Total Cases (30), Pending, Under Process, Disposed, Overdue (SLA), and Cross Overlaps (3).
   * Notice the prominent **Cross-Bureau Overlap Notification Banner**.
2. **Explore Cross-Bureau Overlaps**:
   * Click **Review Overlaps** in the banner or navigate to **Overlap Monitoring**.
   * Inspect the side-by-side comparison for **Apex Institute of Technology**.
   * Click **Coordinate Matters** to open the coordination modal.
   * Select `Coordinated`, designate `Regulation Bureau (RB)` as lead, write joint hearing directives, and check "Automatically establish cross-reference links".
   * Click **Save Coordination Decision**. Observe the status update to `Coordinated` without closing either case.
3. **Inspect the Case Registry**:
   * Navigate to **Case Registry**. Filter by Bureau (`RB`) or Region (`Northern`).
   * Click **Dossier** on `AICTE/RB/2026/0104`.
   * View the chronological action timeline, linked PGRC case, and assigned officer.
   * Click **Record Action / Update Status** to add a hearing remark or change status.
4. **Test Dynamic Overlap Engine (Live Intake)**:
   * Click **+ Register Complaint** in the top navigation bar.
   * Select **Vidyapeeth College of Engineering** (an institute with an existing RB case).
   * Select receiving bureau as **PGRC** and submit.
   * Observe the real-time notification: *“WARNING: Cross-bureau overlap detected!”*.
   * Verify the Overlap Monitoring counter updates immediately.
5. **Analytics & CSV Export**:
   * Navigate to **Reports & Analytics**.
   * Review the Overdue Ageing Analysis and Bureau Disposal Efficiency charts.
   * Click **Download Cases Register (CSV)** and verify the downloaded file.
6. **Reset State**:
   * Click **Reset Seed Data** at any time to restore the pristine seed dataset.

---

## 8. Optional Firebase Configuration

CaseWatch is designed with a resilient dual-mode architecture:
* **Demo Mode (Default)**: Uses browser `localStorage` for complete offline functionality with zero configuration.
* **Production Cloud Mode**: To connect to a live Google Cloud Firestore backend:
  1. Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
  2. Populate your Firebase project configuration keys:
     ```env
     VITE_FIREBASE_API_KEY=AIzaSy...
     VITE_FIREBASE_PROJECT_ID=your-project-id
     ```
  3. The storage service will automatically detect the credentials and switch to cloud synchronization.

---

## 9. System Screenshots

| Overview Administrative Command Dashboard | Cross-Bureau Overlap Monitoring Console |
|:---:|:---:|
| *(Add dashboard screenshot here)* | *(Add overlap monitoring screenshot here)* |

| Filterable Case Registry & SLA Radar | Chronological Case Dossier & Action Log |
|:---:|:---:|
| *(Add registry table screenshot here)* | *(Add case detail screenshot here)* |

---

## 10. Known Limitations & Roadmap

* **External Complainant Authentication**: The current prototype demonstrates the internal administrative portal used by AICTE officers. An external citizen portal with Aadhaar/DigiLocker KYC is slated for Phase 2.
* **Automated Hearing Calendar Sync**: Integration with National Informatics Centre (NIC) video conferencing APIs is planned.
* **Multi-lingual Support**: Grievance registration in 12 regional languages under National Education Policy (NEP 2020) guidelines.

---

## 11. Campus Photo Attribution

The institutional context hero visual uses **SVCE entrance close up.jpg** by PlaneMad via Wikimedia Commons, licensed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
* **Institution**: Sri Venkateswara College of Engineering (SVCE), Pennalur, Sriperumbudur, Tamil Nadu.
* **Source**: [Wikimedia Commons File Page](https://commons.wikimedia.org/wiki/File:SVCE_entrance_close_up.jpg).
* **Local Asset**: Stored locally in `src/assets/svce-entrance.jpg` and `public/assets/svce-entrance.jpg` to guarantee offline reliability and avoid fragile runtime network requests.
* **License**: Creative Commons Attribution-ShareAlike 3.0 Unported ([CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)).

---

## 12. Disclaimer
*This project was developed exclusively as an academic prototype for Smart India Hackathon 2026 Problem Statement SIH26264. It is not affiliated with, nor does it claim official endorsement by the All India Council for Technical Education (AICTE) or the Ministry of Education, Government of India. All institution names, complaint descriptions, and officer designations are synthetic and fictional.*
