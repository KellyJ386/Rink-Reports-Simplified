# MFO Implementation Plan - Phase 2
## Post-Module Development Roadmap

**Status**: All 7 core modules built ✅
**Next Phase**: Database, Testing, and Enhancement Features
**Timeline**: 4-6 weeks

---

## 1. Database Migrations - Create Supabase Tables and RLS Policies

### Priority: CRITICAL (Week 1-2)

### 1.1 Core Tables Creation

#### Ice Depth Module Tables
```sql
-- facilities table (if not exists)
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- rinks table
CREATE TABLE rinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  rink_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ice_depth_templates table
CREATE TABLE ice_depth_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  points JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ice_depth_logs table
CREATE TABLE ice_depth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID REFERENCES rinks(id) ON DELETE SET NULL,
  template_id UUID REFERENCES ice_depth_templates(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  log_time TIME,
  measurements JSONB NOT NULL,
  recorded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Employee Scheduling Tables
```sql
-- profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- shifts table
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  position TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- time_off_requests table
CREATE TABLE time_off_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Ice Maintenance Tables
```sql
-- ice_machines table
CREATE TABLE ice_machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  machine_name TEXT NOT NULL,
  machine_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- maintenance_logs table
CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID REFERENCES rinks(id) ON DELETE SET NULL,
  machine_id UUID REFERENCES ice_machines(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  log_time TIME,
  log_type TEXT NOT NULL, -- 'resurfacing', 'blade_change', 'edging', 'circle_check'
  recorded_by UUID REFERENCES auth.users(id),

  -- Resurfacing specific
  ice_temp NUMERIC(5,2),
  water_temp NUMERIC(5,2),
  blade_condition TEXT,

  -- Blade change specific
  blade_hours INTEGER,
  old_blade_id TEXT,
  new_blade_id TEXT,

  -- Edging specific
  edge_depth NUMERIC(5,2),

  -- Circle check specific
  center_spot_condition TEXT,
  blue_line_condition TEXT,
  face_off_dots_condition TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Daily Reports Tables
```sql
-- daily_report_tabs table
CREATE TABLE daily_report_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  tab_name TEXT NOT NULL,
  tab_order INTEGER NOT NULL,
  form_schema JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- daily_report_submissions table
CREATE TABLE daily_report_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  tab_id UUID REFERENCES daily_report_tabs(id) ON DELETE CASCADE,
  submission_date DATE NOT NULL,
  form_data JSONB NOT NULL,
  submitted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Incidents Tables
```sql
-- incidents table
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  incident_number TEXT NOT NULL UNIQUE,
  incident_date DATE NOT NULL,
  incident_time TIME,
  location TEXT,
  incident_type TEXT,
  severity TEXT,

  -- Injured person info
  injured_name TEXT,
  injured_age INTEGER,
  injured_phone TEXT,
  injured_address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,

  -- Incident details
  description TEXT,
  contributing_factors TEXT,
  injury_type TEXT,
  injury_data JSONB,

  -- Response actions
  first_aid_given BOOLEAN DEFAULT false,
  ice_pack_given BOOLEAN DEFAULT false,
  ambulance_called BOOLEAN DEFAULT false,
  parent_notified BOOLEAN DEFAULT false,
  scene_secured BOOLEAN DEFAULT false,
  manager_notified BOOLEAN DEFAULT false,

  recorded_by UUID REFERENCES auth.users(id),
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Refrigeration Tables
```sql
-- refrigeration_logs table
CREATE TABLE refrigeration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID REFERENCES rinks(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  log_time TIME,

  -- Standard fields
  refrigerant_type TEXT,
  supply_temp NUMERIC(5,2),
  return_temp NUMERIC(5,2),
  ambient_temp NUMERIC(5,2),
  high_pressure NUMERIC(6,2),
  low_pressure NUMERIC(6,2),
  compressor_status TEXT DEFAULT 'running',

  -- Custom fields
  custom_fields JSONB,

  notes TEXT,
  has_alerts BOOLEAN DEFAULT false,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- refrigeration_field_configs table
CREATE TABLE refrigeration_field_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  unit TEXT,
  min_threshold NUMERIC,
  max_threshold NUMERIC,
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Air Quality Tables
```sql
-- air_quality_logs table
CREATE TABLE air_quality_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID REFERENCES rinks(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  log_time TIME,

  -- Gas levels
  co_level NUMERIC(6,2),
  co_status TEXT DEFAULT 'normal',
  no2_level NUMERIC(6,3),
  no2_status TEXT DEFAULT 'normal',

  -- Environmental
  temperature NUMERIC(5,2),
  humidity NUMERIC(5,2),
  ventilation_status TEXT DEFAULT 'normal',

  notes TEXT,
  corrective_actions TEXT,
  has_alerts BOOLEAN DEFAULT false,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- air_quality_thresholds table
CREATE TABLE air_quality_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  co_warning_threshold NUMERIC(6,2) DEFAULT 9,
  co_danger_threshold NUMERIC(6,2) DEFAULT 35,
  no2_warning_threshold NUMERIC(6,3) DEFAULT 0.05,
  no2_danger_threshold NUMERIC(6,3) DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(facility_id)
);
```

### 1.2 Row Level Security (RLS) Policies

**Apply to ALL tables:**

```sql
-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access data from their facility
CREATE POLICY "Users access own facility data"
  ON [table_name]
  FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert data for their facility
CREATE POLICY "Users insert own facility data"
  ON [table_name]
  FOR INSERT
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );
```

### 1.3 Indexes for Performance

```sql
-- Facility-based queries
CREATE INDEX idx_logs_facility_date ON [table]_logs(facility_id, log_date DESC);
CREATE INDEX idx_logs_recorded_by ON [table]_logs(recorded_by);

-- Air Quality alerts
CREATE INDEX idx_air_quality_alerts ON air_quality_logs(facility_id, has_alerts) WHERE has_alerts = true;

-- Incidents by number
CREATE INDEX idx_incidents_number ON incidents(incident_number);

-- Daily reports by date
CREATE INDEX idx_daily_reports_date ON daily_report_submissions(facility_id, submission_date DESC);
```

### 1.4 Migration Script Structure

**File**: `supabase/migrations/001_initial_schema.sql`

Order:
1. Create extensions (uuid-ossp)
2. Create facilities table
3. Create profiles table
4. Create rinks table
5. Create all module tables
6. Enable RLS on all tables
7. Create RLS policies
8. Create indexes
9. Create triggers (updated_at)

---

## 2. Testing - Run Application and Test All Modules

### Priority: HIGH (Week 2-3)

### 2.1 Local Development Setup

**Prerequisites:**
- Node.js installed
- Supabase project created
- Environment variables configured

**Steps:**
1. Install dependencies: `npm install`
2. Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
3. Run migrations in Supabase dashboard
4. Start dev server: `npm run dev`

### 2.2 Module Testing Checklist

#### Ice Depth Log ✓
- [ ] Create custom template (5+ points)
- [ ] Log measurements using template
- [ ] View measurements grid
- [ ] Edit existing log
- [ ] Delete log (confirm dialog)
- [ ] Filter by rink
- [ ] Filter by date range
- [ ] Verify empty states

#### Employee Scheduling ✓
- [ ] Add employee to facility
- [ ] Create shift for employee
- [ ] View weekly calendar
- [ ] Edit shift
- [ ] Delete shift
- [ ] Submit time-off request
- [ ] Approve/reject time-off
- [ ] Filter by employee
- [ ] Verify conflict detection

#### Ice Maintenance Log ✓
- [ ] Test Ice Make tab (log resurfacing)
- [ ] Test Blade Change tab
- [ ] Test Edging tab
- [ ] Test Circle Check tab
- [ ] Verify stats update
- [ ] Edit log from each tab
- [ ] Delete logs
- [ ] Filter by date

#### Daily Reports ✓
- [ ] Create custom tab (Admin view)
- [ ] Add fields (all 7 types: text, number, textarea, select, checkbox, date, time)
- [ ] Reorder fields
- [ ] Submit report using custom form
- [ ] View submission history
- [ ] Edit submission
- [ ] Delete submission
- [ ] Verify up to 15 tabs

#### Incidents ✓
- [ ] Create incident report
- [ ] Verify auto-generated number (YYYY-NNNN)
- [ ] Fill all sections
- [ ] Verify alert detection (severity)
- [ ] Lock incident
- [ ] Attempt to edit locked (should fail)
- [ ] Unlock incident
- [ ] View full details
- [ ] Delete incident
- [ ] Filter by severity

#### Refrigeration Log ✓
- [ ] Log temperature readings
- [ ] Log pressure readings
- [ ] Verify alert on out-of-range values
- [ ] View trends (7/30/90 days)
- [ ] Filter by rink
- [ ] View stats dashboard
- [ ] Edit log
- [ ] Delete log
- [ ] Test custom fields (if configured)

#### Air Quality Log ✓
- [ ] Log CO level
- [ ] Log NO2 level
- [ ] Verify warning threshold alert
- [ ] Verify danger threshold alert
- [ ] Add corrective actions
- [ ] View trends with threshold lines
- [ ] View compliance summary
- [ ] Filter by alert status
- [ ] Edit log
- [ ] Delete log

### 2.3 Cross-Module Testing

- [ ] Create data in all 7 modules
- [ ] Verify Dashboard stats update
- [ ] Test navigation between modules
- [ ] Verify data isolation (multi-tenant)
- [ ] Test with multiple rinks
- [ ] Test date filtering across modules

### 2.4 Error Handling

- [ ] Test with no internet connection
- [ ] Test with invalid data
- [ ] Test with missing required fields
- [ ] Verify toast notifications
- [ ] Test database connection failures

---

## 3. Authentication Flow - Verify Login and Multi-Tenant Access

### Priority: HIGH (Week 2)

### 3.1 Authentication Setup

**Supabase Auth Configuration:**
- Enable email/password authentication
- Configure email templates
- Set up password requirements
- Enable email confirmation (optional)

### 3.2 Multi-Tenant Architecture

**Facility Assignment:**
```sql
-- When user signs up, assign to facility
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, facility_id, email)
  VALUES (
    NEW.id,
    -- Assign facility based on signup context
    NEW.raw_user_meta_data->>'facility_id',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 3.3 Testing Checklist

- [ ] Sign up new user
- [ ] Verify email confirmation (if enabled)
- [ ] Login with credentials
- [ ] Verify redirect to dashboard
- [ ] Logout
- [ ] Test "Remember me"
- [ ] Test password reset flow
- [ ] Create second facility
- [ ] Create user for second facility
- [ ] Verify data isolation (User A cannot see User B's data)
- [ ] Test concurrent sessions
- [ ] Test session expiration

### 3.4 Role-Based Access Control (Future)

**File**: `src/hooks/usePermissions.ts`
- Admin: Full access
- Manager: View + Edit
- Staff: View only
- Implement in Phase 3

---

## 4. Mobile Optimization - Test Responsive Design

### Priority: MEDIUM (Week 3)

### 4.1 Responsive Breakpoints

Current Tailwind breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 4.2 Mobile Testing Devices

Test on:
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S21 (360px)
- iPad (768px)
- iPad Pro (1024px)

### 4.3 Module-Specific Mobile Issues

#### Dashboard
- [ ] Module cards stack vertically
- [ ] Cards are tappable
- [ ] Navigation menu collapses to hamburger

#### Forms (All Modules)
- [ ] Forms are scrollable
- [ ] Input fields are appropriately sized
- [ ] Date/time pickers work on mobile
- [ ] Select dropdowns are native on mobile
- [ ] Submit buttons are accessible

#### Lists
- [ ] Lists scroll smoothly
- [ ] Action buttons are tappable (min 44x44px)
- [ ] Filters collapse on mobile

#### Charts (Trends)
- [ ] Charts are responsive
- [ ] Charts don't overflow
- [ ] Tooltips work on touch
- [ ] Legend is readable

### 4.4 Mobile-Specific Features

**Touch Optimizations:**
- Increase button size to 44x44px minimum
- Add touch feedback (active states)
- Implement swipe gestures (future)

**Performance:**
- Lazy load charts
- Optimize images
- Reduce bundle size

---

## 5. Additional Features

### Priority: LOW-MEDIUM (Week 4-6)

### 5.1 Threshold Configuration UI (Air Quality/Refrigeration)

**Component**: `src/components/modules/air-quality/ThresholdSettings.tsx`

Features:
- Edit CO warning/danger thresholds
- Edit NO2 warning/danger thresholds
- Save button with validation
- Preview current vs. new thresholds
- Warning if new thresholds would trigger many alerts

**Component**: `src/components/modules/refrigeration/FieldConfigBuilder.tsx`

Features:
- Add/remove custom fields
- Configure field type (number, text, select)
- Set min/max thresholds
- Set display order
- Mark as required

### 5.2 Custom Field Builder UI (Refrigeration)

**Interface Design:**
```typescript
interface FieldConfig {
  fieldName: string;
  label: string;
  fieldType: 'number' | 'text' | 'select';
  unit?: string;
  minThreshold?: number;
  maxThreshold?: number;
  options?: string[];
  isRequired: boolean;
  displayOrder: number;
}
```

**UI Flow:**
1. Settings tab in RefrigerationPage
2. "Add Field" button
3. Modal with field configuration
4. Drag-and-drop reordering
5. Preview section
6. Save and apply to new logs

### 5.3 Export/Print Functionality

**Implementation:**

**Option A: Browser Print**
```typescript
// src/utils/print.ts
export const printLog = (log: any) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(generatePrintHTML(log));
  printWindow.print();
};
```

**Option B: PDF Generation (react-pdf)**
```bash
npm install @react-pdf/renderer
```

Features:
- Export single log to PDF
- Export date range to PDF
- Export trends chart as PDF
- Facility branding on exports

**Components:**
- ExportButton (all list views)
- PrintButton (detail views)
- PDFGenerator service

### 5.4 Notifications System

**Implementation Strategy:**

**Database Table:**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'alert', 'info', 'warning'
  title TEXT NOT NULL,
  message TEXT,
  related_module TEXT,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Triggers:**
- Incident created (severity: serious/critical)
- Air quality danger threshold exceeded
- Refrigeration out of range
- Time-off request submitted
- Shift conflict detected

**UI Components:**
- Bell icon in header with badge
- Notification dropdown
- Mark as read
- Click to navigate to related item

**Real-time (Supabase Realtime):**
```typescript
supabase
  .channel('notifications')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'notifications' },
    (payload) => {
      showToast(payload.new.title);
    }
  )
  .subscribe();
```

### 5.5 Offline Mode

**Implementation Strategy:**

**Technology Stack:**
- Service Workers
- IndexedDB (via Dexie.js)
- React Query with persistent cache

**Steps:**

1. **Install Dependencies**
```bash
npm install dexie workbox-webpack-plugin
```

2. **Service Worker Setup**
```typescript
// src/service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses
registerRoute(
  /^https:\/\/.*\.supabase\.co\/.*/,
  new NetworkFirst({
    cacheName: 'api-cache',
  })
);
```

3. **Offline Queue**
```typescript
// src/utils/offlineQueue.ts
interface QueuedAction {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: Date;
}

export class OfflineQueue {
  async add(action: QueuedAction) {
    await db.queue.add(action);
  }

  async sync() {
    const queue = await db.queue.toArray();
    for (const action of queue) {
      await this.processAction(action);
      await db.queue.delete(action.id);
    }
  }
}
```

4. **Offline Indicator**
```typescript
// src/components/OfflineIndicator.tsx
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-orange-500 text-white p-2 text-center">
      You are offline. Changes will sync when connection is restored.
    </div>
  );
}
```

**Features:**
- Cache recent logs for offline viewing
- Queue create/update/delete actions
- Sync when connection restored
- Offline indicator in UI
- Conflict resolution strategy

---

## 6. Implementation Order & Timeline

### Week 1: Database Foundation
- Day 1-2: Create all database tables
- Day 3-4: Implement RLS policies
- Day 5: Create indexes and test queries

### Week 2: Testing & Authentication
- Day 1-2: Module testing (Ice Depth, Scheduling, Maintenance)
- Day 3-4: Module testing (Daily Reports, Incidents, Refrigeration, Air Quality)
- Day 5: Authentication flow and multi-tenant testing

### Week 3: Mobile & Polish
- Day 1-3: Mobile responsive testing and fixes
- Day 4-5: Cross-browser testing (Chrome, Safari, Firefox)

### Week 4: Threshold Configuration UIs
- Day 1-2: Air Quality threshold configuration
- Day 3-5: Refrigeration custom field builder

### Week 5: Export & Notifications
- Day 1-3: Export/Print functionality
- Day 4-5: Notifications system

### Week 6: Offline Mode
- Day 1-3: Service worker setup and offline cache
- Day 4-5: Offline queue and sync logic

---

## 7. Critical Path Items

**Must Have (P0):**
1. Database migrations ✅
2. RLS policies ✅
3. Basic module testing ✅
4. Authentication flow ✅
5. Mobile responsiveness ✅

**Should Have (P1):**
6. Threshold configuration UI
7. Export functionality
8. Notifications system

**Nice to Have (P2):**
9. Custom field builder UI
10. Offline mode

---

## 8. Risk Assessment

**High Risk:**
- RLS policy misconfiguration (data leak)
- Multi-tenant data isolation failure
- Mobile performance on older devices

**Medium Risk:**
- Offline sync conflicts
- Export PDF formatting issues
- Notification spam

**Mitigation:**
- Thorough RLS testing with multiple users
- Implement conflict resolution strategy
- Rate limiting on notifications
- Progressive enhancement (offline mode optional)

---

## 9. Success Metrics

**Technical:**
- All 7 modules functional
- < 3 second page load time
- > 90% test coverage (critical paths)
- Zero data leaks between facilities

**User Experience:**
- Mobile usable on all devices
- Forms completable in < 2 minutes
- Charts load in < 1 second
- Offline mode syncs successfully

---

## 10. Next Steps After Implementation

**Phase 3 (Future):**
- Role-based access control
- Audit logs
- Advanced analytics
- Mobile native apps (React Native)
- API access for integrations
- White-label customization
- Automated backups
- Performance monitoring
- Error tracking (Sentry)

---

**Plan Created**: January 2026
**Last Updated**: January 2026
**Owner**: MFO Development Team
