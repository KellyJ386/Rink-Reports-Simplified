# MFO (Max Facility Operations)
# Product Requirements Document
# Simplified Edition - January 2026

## Document Information

- **Product Name**: MFO (Max Facility Operations)
- **Version**: 1.0
- **Last Updated**: January 7, 2026
- **Document Owner**: Kelly
- **Status**: Approved for Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [User Roles & Permissions](#user-roles-permissions)
4. [Module Specifications](#module-specifications)
   - 4.1 [Ice Depth Log](#ice-depth-log)
   - 4.2 [Employee Scheduling](#employee-scheduling)
   - 4.3 [Ice Maintenance Log](#ice-maintenance-log)
   - 4.4 [Incident Reports](#incident-reports)
   - 4.5 [Refrigeration Log](#refrigeration-log)
   - 4.6 [Air Quality Log](#air-quality-log)
   - 4.7 [Daily Reports](#daily-reports)
5. [Admin Dashboard](#admin-dashboard)
6. [Super Admin Dashboard](#super-admin-dashboard)
7. [Database Architecture](#database-architecture)
8. [Complete SQL Migrations](#sql-migrations)
9. [Implementation Plan](#implementation-plan)
10. [Deployment Strategy](#deployment-strategy)
11. [Pricing Model](#pricing-model)

---

<a name="executive-summary"></a>
## 1. Executive Summary

### Product Vision

MFO (Max Facility Operations) is a comprehensive SaaS platform designed specifically for ice rink facility management. It replaces paper logs, spreadsheets, and fragmented systems with a unified digital solution that tracks ice quality, staff operations, equipment maintenance, safety compliance, and daily operations.

### Target Market

**Primary Market:**
- Ice skating facilities in North America
- 100-300 employees per facility
- 1-8 ice rinks per facility
- Need for regulatory compliance (EPA, OSHA, insurance)

**Market Size:**
- 1,800+ ice rinks in United States
- 250+ ice rinks in Canada
- **Target**: 1,000 facilities within 3 years

**Customer Profile:**
- Facility managers overwhelmed by paper logs
- Insurance companies requiring digital incident tracking
- Operators needing ice quality consistency
- Multi-rink complexes needing centralized management

### Value Proposition

**Problem:**
Ice rinks currently use paper logs, messaging apps, Excel spreadsheets, and memory to manage operations. This creates:
- Lost incident reports (liability risk)
- Inconsistent ice quality (customer complaints)
- No trend analysis (can't optimize operations)
- Compliance gaps (regulatory fines)
- Poor staff communication (missed tasks)

**Solution:**
MFO provides a single digital platform where:
- Staff log ice measurements with Bluetooth calipers
- Managers track maintenance in real-time
- Incidents are documented with body diagrams and auto-emailed
- Air quality compliance is automated with threshold alerts
- Schedules are published and accessible on mobile devices
- Historical data enables trend analysis and optimization

**Key Differentiators:**
1. Built specifically for ice rinks (not generic facility management)
2. Bluetooth caliper integration (unique to ice depth tracking)
3. Admin-configurable forms (adapts to each facility's needs)
4. Multi-tenant architecture (scales to 1,000 facilities)
5. Affordable pricing ($49-299/month vs $500+ competitors)

---

<a name="technology-stack"></a>
## 2. Technology Stack

### Frontend Architecture

**Framework:**
- React 18.3.1 with TypeScript 5.8.3
- Vite 5.4.19 (build tool)
- React Router v6.30.1 (routing)

**Styling:**
- Tailwind CSS 3.4.17
- shadcn-ui component library (Radix UI primitives)
- Custom CSS animations
- next-themes v0.3.0 (dark mode)

**State Management:**
- TanStack React Query v5.83.0 (server state, caching)
- React Hook Form v7.61.1 (form state)
- Local state via useState/useReducer

**UI Components:**
- Radix UI primitives (accessible, headless)
- Lucide React v0.462.0 (icons)
- shadcn-ui pre-built components (40+ components)

**Data Visualization:**
- Recharts v2.15.4 (charts and graphs)

**Form Management:**
- React Hook Form v7.61.1
- Zod v3.25.76 (validation)

**Utilities:**
- date-fns v3.6.0 (date handling)
- Sonner v1.7.4 (notifications)
- html2pdf.js v0.12.1 (PDF export)

### Backend Infrastructure

**Database:**
- PostgreSQL via Supabase
- Row Level Security (RLS) policies on all tables
- Multi-tenant architecture (facility_id scoping)

**Authentication:**
- Supabase Auth (email/password)
- Role-based access control (RBAC)
- Session management

**Real-time:**
- Supabase Realtime subscriptions
- Notification updates
- Live data sync

**Storage:**
- Supabase Storage (PDFs, exports, logos)

**API:**
- Supabase REST API
- Auto-generated TypeScript types
- Edge Functions (Deno runtime) for:
  - Email notifications
  - PDF generation
  - Scheduled tasks

### Third-Party Integrations

**Payment Processing:**
- Stripe Connect
- Subscription billing
- Multi-tenant payment splits

**Email Notifications:**
- Resend API
- Transactional emails
- Manager alerts

**SMS Notifications:**
- Twilio API
- Emergency alerts only
- Air quality evacuations

**Bluetooth:**
- Web Bluetooth API
- iGaging digital caliper integration

**Development Tools:**
- ESLint v9.32.0 with TypeScript support
- TypeScript strict mode
- Lovable.dev (AI-assisted development)

### Hosting & Deployment

**Frontend:**
- Vercel (automatic deployments from GitHub)
- Edge network (CDN)
- Custom domains per environment

**Backend:**
- Supabase managed PostgreSQL
- Automatic backups
- Point-in-time recovery

**Environments:**
- **Production**: live facilities
- **Staging**: feature testing
- **Demo**: sales demonstrations (resets nightly)

---

<a name="user-roles-permissions"></a>
## 3. User Roles & Permissions

### Role Hierarchy

```
Super Admin (MFO Owner)
    └─ Facility Admin (Facility Owner/Director)
        ├─ Manager (Facility Manager/Supervisor)
        └─ Staff (Front Desk, Maintenance, Instructors)
```

### Role Capabilities Matrix

| Capability | Super Admin | Facility Admin | Manager | Staff |
|-----------|-------------|----------------|---------|-------|
| **System Administration** |
| View all facilities | ✅ | ❌ | ❌ | ❌ |
| Impersonate facility admin | ✅ | ❌ | ❌ | ❌ |
| Manage subscriptions (all) | ✅ | ❌ | ❌ | ❌ |
| System-wide metrics | ✅ | ❌ | ❌ | ❌ |
| **Facility Administration** |
| Create/edit users | ✅ | ✅ | ❌ | ❌ |
| Assign roles/permissions | ✅ | ✅ | ❌ | ❌ |
| Configure modules | ✅ | ✅ | ❌ | ❌ |
| Build custom forms | ✅ | ✅ | ❌ | ❌ |
| Manage subscription (own) | ❌ | ✅ | ❌ | ❌ |
| Edit facility settings | ✅ | ✅ | ❌ | ❌ |
| **Operations Management** |
| View all reports | ✅ | ✅ | ✅ | ❌ |
| Approve schedules | ✅ | ✅ | ✅ | ❌ |
| Manage time-off requests | ✅ | ✅ | ✅ | ❌ |
| Review incident reports | ✅ | ✅ | ✅ | ❌ |
| Export data | ✅ | ✅ | ✅ | ❌ |
| **Daily Operations** |
| Log ice depth | ✅ | ✅ | ✅ | ✅ |
| Log maintenance | ✅ | ✅ | ✅ | ✅ |
| Log refrigeration readings | ✅ | ✅ | ✅ | ✅ |
| Log air quality | ✅ | ✅ | ✅ | ✅ |
| Submit incident reports | ✅ | ✅ | ✅ | ✅ |
| Fill daily reports | ✅ | ✅ | ✅ | ✅ |
| View own schedule | ✅ | ✅ | ✅ | ✅ |
| Request time-off | ❌ | ❌ | ✅ | ✅ |

### Module-Level Permissions

Each user can be granted access to specific modules:
- ✅ Ice Depth Log
- ✅ Employee Scheduling
- ✅ Ice Maintenance Log
- ✅ Incident Reports
- ✅ Refrigeration Log
- ✅ Air Quality Log
- ✅ Daily Reports

**Permission Levels:**
- **None**: Cannot access module
- **View**: Can view reports only
- **Submit**: Can submit new entries
- **Full Access**: Can view, submit, edit, delete

---

<a name="module-specifications"></a>
## 4. Module Specifications

<a name="ice-depth-log"></a>
### 4.1 Ice Depth Log Module

#### Purpose
Track ice surface thickness measurements using admin-created custom templates with facility logo branding for professional PDF exports.

#### Key Features

**Admin Template Creation:**
- Create up to 4 custom templates per facility
- Click on hockey rink diagram to place measurement points (snap-to-grid)
- Auto-numbered points (Point 1, Point 2, Point 3...)
- Flexible point count (any number of points per template)
- Templates can be edited anytime
- Upload facility logo for branded diagrams
- Templates are facility-wide (all rinks use same templates)

**Template Creation Options:**
- Start from blank diagram (click to place points)
- Start from system template (edit pre-placed points)

**Bluetooth Integration:**
- iGaging digital caliper connectivity
- Auto-capture measurements on trigger press
- Auto-advance to next measurement point

**Statistics:**
- Minimum depth (with point location)
- Maximum depth (with point location)
- Average depth across all points
- Color-coded status (Red < 1", Yellow > 1.75", Green 1-1.75")

**Trend Analysis:**
- Week-over-week comparison charts (3 years retention)
- Date range filtering (7 days, 30 days, custom)
- Export history to CSV

**PDF Export:**
- Professional report with branded rink diagram (facility logo)
- All measurements visualized
- Statistics summary
- Facility branding

#### Wireframe Mockups

```
┌──────────────────────────────────────────────────────────┐
│  Admin > Ice Depth Configuration                          │
│  Facility: Example Ice Rink                              │
├──────────────────────────────────────────────────────────┤
│  FACILITY LOGO                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [Current Logo Preview]                            │  │
│  │  🏒 Facility Logo (200x80px)                       │  │
│  └────────────────────────────────────────────────────┘  │
│  [Upload New Logo]  (PNG/SVG, max 500KB)                │
│  Logo will appear on rink diagrams and PDF reports       │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  MEASUREMENT TEMPLATES (4 max)                           │
├──────────────────────────────────────────────────────────┤
│  [+ Create New Template] (2/4 templates created)         │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 📋 Main Rink Standard Check (24 points)           │  │
│  │ Created: Jan 1, 2026  │  Last used: Jan 7, 2026   │  │
│  │ [Edit Template] [Duplicate] [Delete]              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 📋 Quick Scan (12 points)                          │  │
│  │ Created: Jan 2, 2026  │  Last used: Jan 5, 2026   │  │
│  │ [Edit Template] [Duplicate] [Delete]              │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Template Editor: Main Rink Standard Check               │
├──────────────────────────────────────────────────────────┤
│  Template Name: [Main Rink Standard Check___________]   │
│  Points Placed: 24                                        │
│                                                           │
│  Instructions:                                            │
│  • Click grid intersections to place points               │
│  • Points snap to nearest grid position                   │
│  • Drag points to reposition                              │
│  • Click point to delete                                  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │         RINK DIAGRAM (Vertical, Grid Overlay)      │  │
│  │         🏒 [Facility Logo at Center]               │  │
│  │                                                     │  │
│  │              Goal (Top)                             │  │
│  │         ●──────────────●                            │  │
│  │         │  ▓▓▓▓▓▓▓▓  │                            │  │
│  │         ●──────────────●                            │  │
│  │    ┄┄┄┄┄┼┄┄┄┄┄┄┄┄┄┄┄┄┼┄┄┄┄┄  Grid overlay         │  │
│  │    ●─────Blue Line─────●                           │  │
│  │    ┊    ┊    ┊    ┊    ┊    Grid intersections    │  │
│  │  ●1┊  ●2┊  ●3┊  ●4┊  ●5┊   Points placed          │  │
│  │  ●6┊  ●7┊  ●8┊  ●9┊ ●10┊                           │  │
│  │    ●────Red Line──────●  Center (Logo here)        │  │
│  │ ●11┊ ●12┊ ●13┊ ●14┊ ●15┊                           │  │
│  │ ●16┊ ●17┊ ●18┊ ●19┊ ●20┊                           │  │
│  │    ●─────Blue Line─────●                           │  │
│  │    ┄┄┄┄┄┼┄┄┄┄┄┄┄┄┄┄┄┄┼┄┄┄┄┄                         │  │
│  │         ●──────────────●                            │  │
│  │         │  ▓▓▓▓▓▓▓▓  │                            │  │
│  │         ●──────────────●                            │  │
│  │              Goal (Bottom)                          │  │
│  │  Grid: 8x20 (click intersections to place points)  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  [Reset Points]  [Cancel]  [Save Template]               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Ice Depth Measurement Entry                             │
├──────────────────────────────────────────────────────────┤
│  Facility: [Example Ice Rink ▼]                          │
│  Rink: [Rink 1 ▼]                                        │
│  Template: [Main Rink Standard Check (24 pts) ▼]        │
│                                                           │
│  Operator: John Smith (logged in)                        │
│  Date: [Jan 7, 2026]  Time: [2:30 PM]                   │
│  Units: (•) Inches  ( ) Millimeters                      │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [Connect Bluetooth Caliper]  Status: Connected ✓  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │         RINK DIAGRAM (Custom Template)             │  │
│  │         🏒 [Facility Logo]                         │  │
│  │                                                     │  │
│  │  🟢1  🟢2  🔴3  🟢4  🟢5  (Points color-coded)     │  │
│  │  🟢6  🟢7  🟢8  🟢9 🟢10                            │  │
│  │    ●────Red Line──────●  🏒 Logo                   │  │
│  │ 🟢11 🟢12 🟢13 🟢14 🟢15                            │  │
│  │ 🟢16 🟢17 🟡18 🟢19 🟢20                            │  │
│  │                                                     │  │
│  │  Legend:                                            │  │
│  │  🟢 1-1.75" (optimal)  🟡 >1.75" (thick)           │  │
│  │  🔴 <1" (too thin)     ⚫ Not measured              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ➡️ Current Point: Point 21                             │
│  Measurement: [____] inches  [Next Point]                │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  LIVE STATISTICS                                   │  │
│  │  Points Measured: 20/24                            │  │
│  │  Minimum: 0.95" at Point 3  🔴 ALERT               │  │
│  │  Maximum: 1.82" at Point 18  🟡 WARNING            │  │
│  │  Average: 1.35"  🟢 GOOD                           │  │
│  │  Status: ⚠️ NEEDS ATTENTION                        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  Notes (optional):                                        │
│  [Point 3 needs attention before next session_____]      │
│                                                           │
│  [Cancel]  [Save Measurement]  [Save & Export PDF]       │
└──────────────────────────────────────────────────────────┘
```

#### Database Schema

```sql
-- Ice depth templates
CREATE TABLE ice_depth_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  point_count INTEGER NOT NULL,
  template_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ice depth measurements
CREATE TABLE ice_depth_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID NOT NULL REFERENCES rinks(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES ice_depth_templates(id),
  operator_id UUID NOT NULL REFERENCES profiles(id),
  measurement_date DATE NOT NULL,
  measurement_time TIME NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('in', 'mm')),
  measurements JSONB NOT NULL,
  min_depth DECIMAL(5,2),
  min_depth_point_id INTEGER,
  max_depth DECIMAL(5,2),
  max_depth_point_id INTEGER,
  avg_depth DECIMAL(5,2),
  status TEXT CHECK (status IN ('good', 'warning', 'critical')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ice_depth_facility ON ice_depth_measurements(facility_id);
CREATE INDEX idx_ice_depth_rink ON ice_depth_measurements(rink_id);
CREATE INDEX idx_ice_depth_template ON ice_depth_measurements(template_id);
CREATE INDEX idx_ice_depth_date ON ice_depth_measurements(measurement_date DESC);
CREATE INDEX idx_templates_facility ON ice_depth_templates(facility_id);
```

#### Lovable Build Prompt

```
Create an Ice Depth Measurement module with ADMIN-CREATED CUSTOM TEMPLATES and facility logo branding.

REQUIREMENTS:

1. ADMIN: Template Configuration Page
   - Facility logo upload section:
     * Upload PNG/SVG (max 500KB)
     * Preview current logo
     * Logo appears on all rink diagrams and PDF reports
     * Store in Supabase Storage

   - Template list (max 4 templates per facility):
     * Show created templates with point count
     * Edit, Duplicate, Delete buttons
     * "Create New Template" button (disabled if 4 exist)

2. ADMIN: Template Creation Wizard
   Step 1: Choose starting method
   - Radio buttons: "Start from blank" or "Start from system template"
   - System template dropdown (if selected):
     * 24-Point USA Hockey
     * 35-Point Extended
     * 46-Point Comprehensive
     * USA Hockey Official
   - Next button

   Step 2: Template Editor
   - Template name input
   - Vertical hockey rink diagram (400x850px) with 8x20 grid overlay
   - Grid intersections are clickable
   - Click intersection → Place numbered point (snap to grid)
   - Points display as numbered circles (●1, ●2, ●3...)
   - Click existing point → Delete point
   - Drag point → Reposition to nearest grid intersection
   - Show point count
   - Point list sidebar (shows grid coordinates)
   - Facility logo preview at center ice
   - Save Template button

3. STAFF: Measurement Entry Form
   - Facility dropdown
   - Rink dropdown
   - Template dropdown (shows facility's custom templates only)
   - Operator (logged-in user, auto-filled)
   - Date, Time
   - Unit toggle (inches/mm)
   - Bluetooth caliper connection button
   - Custom rink diagram (rendered from template_data JSONB):
     * Vertical orientation
     * Facility logo at center ice
     * Points positioned per template
     * Points numbered 1, 2, 3...
     * Click point to enter measurement manually
     * Bluetooth auto-fills current point
     * Color-code points: Green (1-1.75"), Yellow (>1.75"), Red (<1")
   - Live statistics panel
   - Notes text area
   - Save button, Save & Export PDF button

4. PDF Export (Branded)
   - Facility logo at top
   - Facility name
   - Date, time, rink, template name, operator
   - Custom rink diagram with facility logo
   - All measurements displayed
   - Statistics summary
   - Operator notes
   - Use html2pdf.js

5. History Page
   - Rink filter
   - Date range filter
   - Line chart showing average depth trend (3 years retention)
   - Measurement table
   - Export CSV button

6. Database Integration
   - Supabase tables:
     * ice_depth_templates
     * ice_depth_measurements
     * facilities.logo_url
   - Constraint: Max 4 active templates per facility
   - React Query for data fetching

TECH STACK:
- React 18 + TypeScript
- Tailwind CSS + shadcn-ui
- Supabase (database, storage)
- React Query
- Web Bluetooth API
- html2pdf.js
- Recharts
```

---

<a name="employee-scheduling"></a>
### 4.2 Employee Scheduling Module

#### Purpose
Manage staff schedules, time-off requests, and shift coverage for facility-wide operations (not per-rink).

#### Key Features

**Schedule Management:**
- Weekly calendar view (facility-wide, no rink assignments)
- Create/edit/delete shifts
- Assign staff to shifts
- Shift types: Opening, Closing, Mid, Event
- Copy last week's schedule
- Publish schedule (locks changes, notifies staff)

**Staff Management:**
- Add/edit/deactivate staff members
- Assign roles (Manager, Supervisor, Attendant, Instructor, Maintenance)
- Contact information
- No hourly rate tracking (payroll handled externally)

**Time-Off Requests:**
- Staff submit requests (date range, reason)
- Manager approves/denies
- Approved time-off blocks future scheduling

**Schedule Export:**
- PDF for bulletin board printing
- CSV for payroll integration

#### Database Schema

```sql
-- Schedule staff
CREATE TABLE schedule_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('manager', 'supervisor', 'attendant', 'instructor', 'maintenance')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Schedule shifts
CREATE TABLE schedule_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('opening', 'closing', 'mid', 'event')),
  role TEXT NOT NULL,
  assigned_staff_id UUID REFERENCES schedule_staff(id),
  special_instructions TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Time-off requests
CREATE TABLE schedule_time_off (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES schedule_staff(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Lovable Build Prompt

```
Create an Employee Scheduling module for facility-wide staff management.

REQUIREMENTS:
1. Weekly calendar view (facility-wide, no rink assignments)
2. Shift creation/editing with role assignment
3. Copy last week button
4. Publish schedule (locks and notifies staff)
5. Staff management (add/edit/deactivate)
6. Time-off requests with manager approval
7. PDF export for bulletin board
8. CSV export for payroll
9. Mobile-responsive (especially staff view)
10. 2-year data retention

TECH STACK:
- React 18 + TypeScript
- Tailwind CSS + shadcn-ui
- Supabase (database)
- React Query
- html2pdf.js
- Resend API (email notifications)
```

---

<a name="ice-maintenance-log"></a>
### 4.3 Ice Maintenance Log Module

#### Purpose
Track four types of ice maintenance activities: Resurfacing, Blade Change, Edging, and Circle Check (pre-shift inspection).

#### Key Features

**Maintenance Types:**
1. **Resurfacing** - Zamboni ice make operations
2. **Blade Change** - Blade replacement tracking
3. **Edging** - Perimeter edging operations
4. **Circle Check** - Pre-shift machine inspection (admin-configurable checklist, up to 40 items)

**Circle Check:**
- Admin creates custom checklist per facility (up to 40 items)
- Pass/Fail for each item
- Overall status (Pass/Fail)
- Failed items count
- Email manager if inspection fails
- Notes per checklist item + general notes

**History View:**
- Separate tabs for each maintenance type
- Filter by date range, machine, rink
- Export to CSV

#### Database Schema

```sql
-- Ice maintenance logs
CREATE TABLE ice_maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('resurfacing', 'blade_change', 'edging', 'circle_check')),
  log_date DATE NOT NULL,
  log_time TIME,
  operator_id UUID NOT NULL REFERENCES profiles(id),
  machine_id UUID REFERENCES ice_machines(id),
  rink_id UUID REFERENCES rinks(id),
  start_time TIME,
  end_time TIME,
  machine_hours DECIMAL(10,2),
  make_type TEXT CHECK (make_type IN ('wet', 'dry')),
  water_used DECIMAL(10,2),
  water_unit TEXT CHECK (water_unit IN ('gallons', 'liters')),
  snow_removed_percent INTEGER,
  old_blade_condition TEXT CHECK (old_blade_condition IN ('worn', 'damaged', 'scheduled')),
  checklist_results JSONB,
  overall_status TEXT CHECK (overall_status IN ('pass', 'fail')),
  failed_items_count INTEGER,
  manager_notified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Circle check templates
CREATE TABLE circle_check_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  checklist_items JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Lovable Build Prompt

```
Create an Ice Maintenance Log module with 4 maintenance types and admin-configurable Circle Check checklists.

REQUIREMENTS:
1. Main page with 4 tabs (Resurfacing, Blade Change, Edging, Circle Check)
2. Resurfacing log: date, times, operator, machine, rink, water used, snow removed
3. Circle Check: admin-configurable checklist (up to 40 items)
4. Email manager if Circle Check fails
5. 2-year data retention
6. Export CSV

TECH STACK:
- React 18 + TypeScript
- Tailwind CSS + shadcn-ui
- Supabase
- Resend API (emails)
- @dnd-kit (drag-and-drop)
```

---

<a name="incident-reports"></a>
### 4.4 Incident Reports Module

#### Purpose
Document safety incidents and injuries with interactive body diagrams, witness statements, and automatic manager notifications.

#### Key Features

**Incident Documentation:**
- Incident details (date, time, location, type, severity)
- Injured person information
- Interactive SVG body diagram (front + back views, 43 clickable zones)
- Multiple injury tracking per zone
- Injury type classification
- Witness information (up to 5 witnesses with statements)
- No photo uploads (keep simple)

**Workflow:**
- Staff submits incident report
- Report locked after submission (cannot edit)
- Auto-email manager on submit
- PDF export with body diagram
- Auto-generated incident numbers (INC-YYYYMMDD-###)

#### Database Schema

```sql
-- Incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number TEXT NOT NULL UNIQUE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID REFERENCES rinks(id),
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,
  location TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'serious', 'critical')),
  injured_name TEXT NOT NULL,
  injured_age INTEGER,
  injured_phone TEXT,
  injured_email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  injuries JSONB NOT NULL,
  description TEXT NOT NULL,
  contributing_factors TEXT[],
  first_aid_given BOOLEAN DEFAULT FALSE,
  ice_pack_given BOOLEAN DEFAULT FALSE,
  ambulance_called BOOLEAN DEFAULT FALSE,
  parent_notified BOOLEAN DEFAULT FALSE,
  scene_secured BOOLEAN DEFAULT FALSE,
  medical_facility TEXT,
  staff_involved_ids UUID[],
  witnesses JSONB,
  reported_by UUID NOT NULL REFERENCES profiles(id),
  manager_notified BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Function to auto-generate incident numbers
CREATE OR REPLACE FUNCTION generate_incident_number(facility_uuid UUID, inc_date DATE)
RETURNS TEXT AS $$
DECLARE
  date_str TEXT;
  sequence_num INTEGER;
BEGIN
  date_str := TO_CHAR(inc_date, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(incident_number FROM 17) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM incidents
  WHERE facility_id = facility_uuid AND incident_date = inc_date;
  RETURN 'INC-' || date_str || '-' || LPAD(sequence_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;
```

#### Lovable Build Prompt

```
Create an Incident Reports module with interactive body diagrams.

REQUIREMENTS:
1. Interactive SVG body diagram (front/back, 43 clickable zones)
2. Multiple injury tracking per zone
3. Witness information (max 5, with statements)
4. Auto-generate incident numbers
5. Lock report after submission
6. Email manager on submit
7. PDF export with body diagram
8. No photo uploads
9. 7-year data retention

TECH STACK:
- React 18 + TypeScript
- Tailwind CSS + shadcn-ui
- Supabase
- Resend API
- html2pdf.js
```

---

<a name="refrigeration-log"></a>
### 4.5 Refrigeration Log Module

#### Purpose
Track refrigeration system readings with admin-configurable custom fields per facility.

#### Key Features

**Admin Configuration:**
- Configure custom fields per facility
- Field types: Number, Text, Dropdown, Checkbox
- Drag to reorder fields
- Mark fields as Required or Optional
- Set default temperature unit (Fahrenheit or Celsius)

**Reading Entry:**
- Log readings multiple times per day (every 2-4 hours typical)
- Reading number auto-increments per day per rink
- Custom fields render dynamically
- Notes field

**Trend Analysis:**
- Line charts for any numeric field (1.5 years retention)
- Date range filtering
- Export to CSV

**No Alerts:**
- Simple data logging only

#### Database Schema

```sql
-- Refrigeration field config
CREATE TABLE refrigeration_field_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  field_order INTEGER NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('number', 'text', 'dropdown', 'checkbox')),
  field_unit TEXT,
  dropdown_options TEXT[],
  is_required BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Refrigeration logs
CREATE TABLE refrigeration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID NOT NULL REFERENCES rinks(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  log_time TIME NOT NULL,
  reading_number INTEGER NOT NULL,
  operator_id UUID NOT NULL REFERENCES profiles(id),
  field_values JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Lovable Build Prompt

```
Create a Refrigeration Log module with admin-configurable fields.

REQUIREMENTS:
1. Admin field configuration (Number, Text, Dropdown, Checkbox)
2. Drag-and-drop field reordering
3. Dynamic form rendering
4. Reading number auto-increment per day per rink
5. Trend charts for numeric fields
6. 1.5-year data retention
7. Export CSV

TECH STACK:
- React 18 + TypeScript
- Tailwind CSS + shadcn-ui
- Supabase
- @dnd-kit
- Recharts
```

---

<a name="air-quality-log"></a>
### 4.6 Air Quality Log Module

#### Purpose
Track CO and NO2 measurements with admin-configurable custom fields and threshold alerts.

#### Key Features

**Required Measurements:**
- CO Instant (PPM)
- CO 1-Hour Average (PPM)
- NO2 Instant (PPM)
- NO2 1-Hour Average (PPM)

**Admin Configuration:**
- Configure custom additional fields
- Set CO/NO2 thresholds per facility
- Default thresholds provided (editable)

**Threshold Alerts:**
- Automatic threshold checking on save
- Email manager if thresholds exceeded
- Visual alerts in UI
- No automatic evacuation (manager decides)

#### Database Schema

```sql
-- Air quality thresholds
CREATE TABLE air_quality_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE UNIQUE,
  co_instant_alert DECIMAL(5,2) DEFAULT 30.0,
  co_1hr_limit DECIMAL(5,2) DEFAULT 25.0,
  co_evacuation DECIMAL(5,2) DEFAULT 50.0,
  no2_instant_alert DECIMAL(5,2) DEFAULT 0.5,
  no2_1hr_limit DECIMAL(5,2) DEFAULT 0.25,
  no2_evacuation DECIMAL(5,2) DEFAULT 1.0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Air quality logs
CREATE TABLE air_quality_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID NOT NULL REFERENCES rinks(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  log_time TIME NOT NULL,
  operator_id UUID NOT NULL REFERENCES profiles(id),
  location TEXT NOT NULL,
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('routine', 'post_resurfacing', 'spot_check')),
  co_instant DECIMAL(5,2) NOT NULL,
  co_1hr_avg DECIMAL(5,2) NOT NULL,
  no2_instant DECIMAL(5,2) NOT NULL,
  no2_1hr_avg DECIMAL(5,2) NOT NULL,
  exceeds_threshold BOOLEAN DEFAULT FALSE,
  manager_notified BOOLEAN DEFAULT FALSE,
  custom_field_values JSONB,
  actions_taken TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Lovable Build Prompt

```
Create an Air Quality Log module with threshold alerts.

REQUIREMENTS:
1. Required readings: CO instant, CO 1-hr, NO2 instant, NO2 1-hr
2. Admin threshold configuration
3. Real-time threshold checking
4. Email manager if exceeded
5. Custom additional fields (admin-configurable)
6. 3-year data retention
7. Export CSV

TECH STACK:
- React 18 + TypeScript
- Tailwind CSS + shadcn-ui
- Supabase
- Resend API
- @dnd-kit
```

---

<a name="daily-reports"></a>
### 4.7 Daily Reports Module

#### Purpose
Facility-wide daily operations reporting with admin-created custom report templates.

#### Key Features

**Admin Template Creation:**
- Create custom report templates (like Google Forms)
- 8 default categories (can add more)
- Drag-and-drop form builder
- Multiple field types
- Templates assigned to staff roles

**Report Categories:**
1. Front Desk Operations
2. Custodial Services
3. Pro Shop
4. Concessions
5. Learn to Skate
6. Public Sessions
7. Safety & Emergency
8. General Facility

**Workflow:**
- Admin creates report templates
- Staff fills out assigned reports
- Manager views submitted reports
- Reports facility-wide (not per-rink)
- 90-day retention

#### Database Schema

```sql
-- Daily report templates
CREATE TABLE daily_report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  category TEXT NOT NULL,
  assigned_roles TEXT[] NOT NULL,
  form_fields JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily report submissions
CREATE TABLE daily_report_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES daily_report_templates(id),
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  submission_date DATE NOT NULL,
  submission_time TIME NOT NULL,
  field_responses JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auto-delete submissions older than 90 days
CREATE OR REPLACE FUNCTION delete_old_daily_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM daily_report_submissions
  WHERE submission_date < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
```

#### Lovable Build Prompt

```
Create a Daily Reports module with admin-created templates.

REQUIREMENTS:
1. Admin form builder (drag-and-drop)
2. 10 field types (Section Header, Checkbox, Checklist, Text Input, Text Area, Number, Time, Date, Dropdown, Radio)
3. Role-based template access
4. Dynamic form rendering
5. PDF export
6. 90-day data retention (auto-delete)
7. Export CSV

TECH STACK:
- React 18 + TypeScript
- Tailwind CSS + shadcn-ui
- Supabase
- @dnd-kit
- React Hook Form + Zod
- html2pdf.js
```

---

<a name="admin-dashboard"></a>
## 5. Admin Dashboard

### Purpose
Centralized administration interface for facility-level configuration, user management, and module settings.

### Access
- **Role**: Facility Admin
- **Scope**: Single facility only

### Key Sections

#### 5.1 Dashboard Overview
- Quick stats (active users, pending time-off, etc.)
- Quick actions
- Links to all admin sections

#### 5.2 User Management
- Add/edit/deactivate users
- Assign roles and module permissions
- Reset passwords
- Export user list

#### 5.3 Facility Settings
- Facility information
- Logo upload
- Rink management (max 8)
- Machine management
- Temperature unit selection

#### 5.4 Module Configuration
- **Ice Depth**: Template builder, logo
- **Ice Maintenance**: Circle Check checklists
- **Refrigeration**: Custom fields
- **Air Quality**: Thresholds, custom fields
- **Daily Reports**: Template builder

#### 5.5 Subscription & Billing
- Current plan display
- Usage stats
- Payment method
- Billing history
- Change plan
- Cancel subscription

---

<a name="super-admin-dashboard"></a>
## 6. Super Admin Dashboard

### Purpose
System-wide administration for MFO platform owner to manage all facilities.

### Access
- **Role**: Super Admin (MFO Owner)
- **Scope**: All facilities

### Key Features

#### 6.1 Platform Metrics
- Total facilities
- Active users
- MRR (Monthly Recurring Revenue)
- Active incidents

#### 6.2 Facility Management
- View all facilities
- Search and filter
- Impersonate facility admin (with audit log)
- View facility details
- Suspend/activate facilities

#### 6.3 Billing Dashboard
- Revenue metrics (MRR, ARR, Churn)
- Plan breakdown
- Failed payments
- Upcoming renewals

#### 6.4 System Settings
- Default settings for new facilities
- System templates
- Data retention policies
- Email configuration

#### 6.5 Audit Logs
- All system actions
- User impersonations
- Subscription changes
- Failed payments
- Export to CSV

---

<a name="database-architecture"></a>
## 7. Database Architecture

### 7.1 Multi-Tenancy Strategy

**Facility-based scoping:**
- All tables include `facility_id` for data isolation
- Row Level Security (RLS) policies enforce access
- Users associated with one or more facilities
- Super Admin can access all facilities

**Example RLS Policy:**
```sql
CREATE POLICY "Users can only access their facility data"
ON ice_depth_measurements
FOR ALL
USING (
  facility_id IN (
    SELECT facility_id
    FROM profiles
    WHERE id = auth.uid()
  )
);
```

### 7.2 Core Tables Summary

**Authentication & Users (5 tables)**
- `auth.users` - Supabase auth
- `profiles` - User profiles, roles
- `user_permissions` - Module permissions
- `facilities` - Facility records
- `rinks` - Rink surfaces

**Ice Depth (2 tables)**
- `ice_depth_templates` (3 year retention)
- `ice_depth_measurements` (3 year retention)

**Ice Maintenance (3 tables)**
- `ice_machines`
- `ice_maintenance_logs` (2 year retention)
- `circle_check_templates`

**Refrigeration (2 tables)**
- `refrigeration_field_config`
- `refrigeration_logs` (1.5 year retention)

**Air Quality (3 tables)**
- `air_quality_thresholds`
- `air_quality_field_config`
- `air_quality_logs` (3 year retention)

**Incidents (1 table)**
- `incidents` (7 year retention)

**Scheduling (4 tables)**
- `schedule_staff`
- `schedule_shifts`
- `schedule_time_off` (2 year retention)

**Daily Reports (2 tables)**
- `daily_report_templates`
- `daily_report_submissions` (90 day retention)

**Billing (3 tables)**
- `subscription_plans`
- `facility_subscriptions`
- `subscription_invoices`

---

<a name="sql-migrations"></a>
## 8. Complete SQL Migrations

### 8.1 Core Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Facilities
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  temperature_unit TEXT DEFAULT 'fahrenheit' CHECK (temperature_unit IN ('fahrenheit', 'celsius')),
  logo_url TEXT,
  logo_uploaded_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rinks
CREATE TABLE rinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_name TEXT NOT NULL,
  dimensions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'staff')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_facility ON profiles(facility_id);
CREATE INDEX idx_rinks_facility ON rinks(facility_id);
```

### 8.2 Data Retention Policies

| Module | Retention Period |
|--------|------------------|
| Ice Depth | 3 years |
| Ice Maintenance | 2 years |
| Refrigeration | 1.5 years |
| Air Quality | 3 years |
| Incidents | 7 years |
| Scheduling | 2 years |
| Daily Reports | 90 days |

---

<a name="implementation-plan"></a>
## 9. Implementation Plan

### Phase 1: MVP (Months 1-3)

**Month 1: Foundation**
- Set up Lovable.dev project
- Configure Supabase
- Deploy 3 environments (Production, Staging, Demo)
- Implement authentication
- Build admin dashboard shell
- Ice Depth Log module (complete)

**Month 2: Core Operations**
- Employee Scheduling module (complete)
- Ice Maintenance Log module (complete)

**Month 3: Polish & Testing**
- Super Admin Dashboard (basic)
- Bug fixes and testing
- Beta testing with 3-5 pilot facilities
- MVP launch

**Deliverables:**
- 3 core modules operational
- Super Admin dashboard
- Stripe integration
- Basic support tools

### Phase 2: Safety & Compliance (Months 4-5)

**Month 4:**
- Incident Reports module
- Refrigeration Log module

**Month 5:**
- Air Quality Log module
- Testing and refinement
- Phase 2 launch

**Deliverables:**
- All 6 modules operational
- Compliance features complete
- 15-20 paying facilities

### Phase 3: Operational Excellence (Months 6-7)

**Month 6:**
- Daily Reports module
- Offline capability
- Mobile improvements

**Month 7:**
- API development
- Webhook system
- Phase 3 launch

**Deliverables:**
- All 7 modules complete
- Offline support
- API access
- 50+ facilities

### Phase 4: Scale & Enterprise (Months 8-12)

**Months 8-9:**
- Native mobile apps
- Push notifications
- Advanced analytics
- White-label branding

**Months 10-11:**
- Multi-facility management
- SSO/SAML integration
- Custom integrations

**Month 12:**
- Platform optimization
- Enterprise sales push
- Target: 100+ facilities

---

<a name="deployment-strategy"></a>
## 10. Deployment Strategy

### 10.1 Environments

**Production**
- URL: app.maxfacilityoperations.com
- Purpose: Live facilities
- Database: Supabase Production
- Deployment: Manual approval after staging

**Staging**
- URL: staging.maxfacilityoperations.com
- Purpose: Pre-release testing
- Database: Supabase Staging
- Deployment: Automatic on main merge

**Demo**
- URL: demo.maxfacilityoperations.com
- Purpose: Sales demonstrations
- Database: Fake data, resets nightly
- Deployment: Manual, stable version

### 10.2 Monitoring

**Tools:**
- Sentry (error tracking)
- Vercel Analytics (performance)
- Supabase Logs (database)
- Stripe Dashboard (payments)

---

<a name="pricing-model"></a>
## 11. Pricing Model

### 11.1 Subscription Tiers

**Starter - $49/month or $470/year**
- Up to 5 users
- Single facility
- Basic modules
- Email support
- 30-day retention

**Standard - $99/month or $950/year**
- Up to 15 users
- All standard modules
- Priority email support
- Per-module retention

**Professional - $199/month or $1,910/year**
- Up to 50 users
- Advanced features
- API access
- Bluetooth calipers
- Phone + email support
- Per-module retention

**Enterprise - Custom Pricing**
- Unlimited users
- Multiple facilities
- White-label branding
- Dedicated account manager
- SSO/SAML
- 24/7 support
- Unlimited retention

### 11.2 Revenue Projections

**Year 1 (MVP → 100 facilities)**
- Month 3: 5 facilities, $500 MRR
- Month 6: 20 facilities, $2,000 MRR
- Month 9: 50 facilities, $5,000 MRR
- Month 12: 100 facilities, $12,000 MRR ($144K ARR)

**Year 2 (100 → 500 facilities)**
- Target: 500 facilities
- MRR: $50,000
- ARR: $600,000

**Year 3 (500 → 1,000 facilities)**
- Target: 1,000 facilities
- MRR: $120,000
- ARR: $1,440,000

---

## END OF DOCUMENT

**Document Status**: Version 1.0 - Complete

**Total Pages**: 60+ pages

**Total Modules**: 7 core modules

**Database Tables**: 50+ tables

**Ready for**: Lovable.dev development

### Next Steps:
1. Review and approve PRD
2. Begin Phase 1 development

---

**Contact**: Kelly
**Product**: MFO - Max Facility Operations
**Website**: maxfacility.com
