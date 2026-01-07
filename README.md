# MFO - Max Facility Operations

**Simplified Edition - January 2026**

## Overview

MFO (Max Facility Operations) is a comprehensive SaaS platform designed specifically for ice rink facility management. It replaces paper logs, spreadsheets, and fragmented systems with a unified digital solution that tracks ice quality, staff operations, equipment maintenance, safety compliance, and daily operations.

## Target Market

- **Primary**: Ice skating facilities in North America (1,800+ US, 250+ Canada)
- **Scale**: 100-300 employees per facility, 1-8 rinks per facility
- **Goal**: 1,000 facilities within 3 years

## Technology Stack

- **Frontend**: React 18.3.1 + TypeScript 5.8.3, Vite, Tailwind CSS, shadcn-ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: TanStack React Query, React Hook Form
- **Integrations**: Stripe Connect, Resend API, Twilio, Web Bluetooth API

## Core Modules

1. **Ice Depth Log** - Bluetooth caliper integration, custom templates, branded PDFs
2. **Employee Scheduling** - Shift management, time-off requests, mobile access
3. **Ice Maintenance Log** - Resurfacing, blade changes, circle checks
4. **Incident Reports** - Interactive body diagrams, auto-notifications, 7-year retention
5. **Refrigeration Log** - Custom field configuration, trend analysis
6. **Air Quality Log** - CO/NO2 monitoring, threshold alerts
7. **Daily Reports** - Admin-created templates, role-based access

## Documentation

- **[Complete PRD](docs/MFO-PRD.md)** - Full product requirements document (60+ pages)
- Database schemas, wireframes, and Lovable build prompts included

## Pricing Model

- **Starter**: $49/month (5 users, 1 facility)
- **Standard**: $99/month (15 users, all modules)
- **Professional**: $199/month (50 users, API access)
- **Enterprise**: Custom pricing (unlimited users, white-label)

## Development Timeline

- **Phase 1 (Months 1-3)**: MVP - Ice Depth, Scheduling, Maintenance
- **Phase 2 (Months 4-5)**: Incidents, Refrigeration, Air Quality
- **Phase 3 (Months 6-7)**: Daily Reports, offline mode, API
- **Phase 4 (Months 8-12)**: Mobile apps, enterprise features

## Revenue Projections

- **Year 1**: 100 facilities, $144K ARR
- **Year 2**: 500 facilities, $600K ARR
- **Year 3**: 1,000 facilities, $1.44M ARR

## Status

**Version**: 1.0
**Status**: Approved for Development
**Owner**: Kelly
**Contact**: maxfacility.com

---

Ready for Lovable.dev development
