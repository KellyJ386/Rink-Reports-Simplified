# Database Hierarchy & User Roles Analysis

## ✅ What You HAVE (Currently Implemented)

### 1. **Database Hierarchy** ✅ EXCELLENT

Your database has a strong multi-tenant architecture:

```
Super Admin (cross-facility access)
    └── Facilities (organizations)
        ├── Profiles (users with roles)
        │   ├── super_admin (all facilities)
        │   ├── admin (facility-level)
        │   ├── manager (mid-level)
        │   └── staff (basic access)
        ├── Rinks (sub-locations)
        ├── Ice Machines
        ├── Schedule Staff
        └── All Module Data (ice depth, incidents, etc.)
```

**Key Features:**
- ✅ Multi-tenant architecture (facility-based isolation)
- ✅ Row Level Security (RLS) enforces data isolation
- ✅ Hierarchical structure (facility → rinks → equipment)
- ✅ User permissions table for granular module access
- ✅ Cascade deletions properly configured

---

### 2. **User Hierarchy** ✅ GOOD (But No UI Yet)

**Roles Defined in Database:**

| Role | Level | Access | Current Status |
|------|-------|--------|----------------|
| `super_admin` | 1 | All facilities, all data | ✅ Schema only |
| `admin` | 2 | Full facility access | ✅ Schema only |
| `manager` | 3 | Department/rink access | ✅ Schema only |
| `staff` | 4 | Limited submit access | ✅ Schema only |

**user_permissions Table:**
```sql
user_permissions:
  - user_id
  - module_name (e.g., "ice_depth", "scheduling")
  - permission_level: 'none', 'view', 'submit', 'full'
```

**Status:**
- ✅ Database schema is perfect
- ❌ No UI to manage roles/permissions
- ❌ No role-based route protection
- ❌ No permission checks in components

---

### 3. **Employee Scheduling** ✅ VERY GOOD

Your employee scheduling module is **highly functional**:

**Features Currently Built:**
- ✅ Staff management (add, edit, deactivate staff)
- ✅ Weekly calendar view
- ✅ Shift management (create, edit, delete shifts)
- ✅ Shift types: opening, closing, mid, event
- ✅ Role-based shifts (manager, supervisor, attendant, instructor, maintenance)
- ✅ Time-off request system (pending/approved/denied)
- ✅ Publish/unpublish schedules
- ✅ Copy previous week's schedule
- ✅ Export schedule to CSV
- ✅ Special instructions per shift
- ✅ Staff assignment to shifts
- ✅ Multi-view interface (calendar, staff, time-off)

**What's Missing:**
- ❌ Recurring shifts (weekly templates)
- ❌ Shift swap requests
- ❌ Availability tracking
- ❌ Overtime tracking
- ❌ Labor cost calculations
- ❌ Conflict detection (double-booking)
- ❌ Mobile notifications
- ❌ Clock in/out tracking

---

## ❌ What You DON'T HAVE (Missing Features)

### 1. **Admin Dashboard** ❌ MISSING

**No dedicated admin interface for:**
- User management (create/edit users, assign roles)
- Facility settings
- Module permissions configuration
- System-wide reports
- Audit logs
- Bulk operations

---

### 2. **Role-Based Access Control (RBAC) UI** ❌ MISSING

**Database supports it, but no UI:**
- No role selection during user creation
- No permission assignment interface
- No role-based menu/navigation hiding
- No permission checks in components
- Everyone sees everything (no filtering)

---

### 3. **Super Admin Portal** ❌ MISSING

**No cross-facility management:**
- Can't switch between facilities
- Can't view all facilities
- Can't create new facilities
- Can't manage facility admins
- No system-wide analytics

---

### 4. **User Management Pages** ❌ MISSING

**No pages for:**
- User listing
- Create/edit users
- Assign roles and permissions
- Deactivate/reactivate users
- Password reset (admin-initiated)
- View user activity

---

## 📊 Feature Comparison

| Feature | Database | Backend | UI | Status |
|---------|----------|---------|----|---------|
| Multi-tenant hierarchy | ✅ | ✅ | ✅ | Complete |
| User roles (4 levels) | ✅ | ❌ | ❌ | Schema only |
| Module permissions | ✅ | ❌ | ❌ | Schema only |
| Employee scheduling | ✅ | ✅ | ✅ | Excellent |
| Admin dashboard | ❌ | ❌ | ❌ | Not started |
| User management | ✅ | ❌ | ❌ | Schema only |
| Facility settings | ✅ | ❌ | ❌ | Schema only |
| Permission UI | ❌ | ❌ | ❌ | Not started |
| Super admin portal | ❌ | ❌ | ❌ | Not started |

---

## 🎯 What You Need to Build

### Priority 1: Admin Dashboard (HIGH)

**Core Pages Needed:**

1. **Admin Home** (`/admin`)
   - System overview
   - Recent activity
   - Quick actions
   - Key metrics

2. **User Management** (`/admin/users`)
   - List all users in facility
   - Create new users
   - Edit user details
   - Assign roles (super_admin, admin, manager, staff)
   - Assign module permissions
   - Deactivate users
   - Reset passwords

3. **Facility Settings** (`/admin/facility`)
   - Facility details
   - Logo upload
   - Timezone settings
   - Temperature unit preference
   - Contact information

4. **Permissions Manager** (`/admin/permissions`)
   - Matrix view: Users × Modules
   - Quick permission assignment
   - Role templates
   - Bulk operations

---

### Priority 2: Role-Based Access Control (HIGH)

**Implement Permission Checks:**

```typescript
// Example: usePermissions hook
const { can } = usePermissions()

// In components:
{can('ice_depth', 'submit') && (
  <Button>Create Entry</Button>
)}

// In routes:
<Route
  path="/admin/*"
  element={
    <RequireRole roles={['admin', 'super_admin']}>
      <AdminLayout />
    </RequireRole>
  }
/>
```

**Features:**
- `usePermissions()` hook
- `<RequireRole>` component
- `<RequirePermission>` component
- Menu item filtering based on roles
- Button/action hiding based on permissions

---

### Priority 3: Enhanced Employee Scheduling (MEDIUM)

**Additional Features:**

1. **Recurring Shifts**
   - Create weekly templates
   - Apply template to multiple weeks
   - Modify single occurrence or all future

2. **Shift Swap Requests**
   - Staff requests shift swap
   - Manager approval workflow
   - Automatic assignment update

3. **Availability Management**
   - Staff sets weekly availability
   - Conflict warnings when scheduling
   - Preferred hours tracking

4. **Labor Cost Tracking**
   - Hourly rates per role
   - Weekly/monthly labor cost reports
   - Overtime calculation
   - Budget vs actual

5. **Conflict Detection**
   - Double-booking prevention
   - Overlapping shift warnings
   - Understaffing alerts

---

### Priority 4: Super Admin Portal (MEDIUM)

**Cross-Facility Management:**

1. **Facility Manager** (`/superadmin/facilities`)
   - List all facilities
   - Create new facilities
   - Edit facility details
   - Deactivate facilities
   - View facility stats

2. **Facility Admins** (`/superadmin/admins`)
   - Assign facility admins
   - Manage cross-facility access
   - View admin activity

3. **System Analytics** (`/superadmin/analytics`)
   - Usage across all facilities
   - Popular modules
   - Active users
   - System health

---

## 🚀 Recommended Implementation Plan

### Phase 1: Admin Dashboard (2-3 weeks)

**Week 1: User Management**
- [ ] Create admin layout
- [ ] Build user list page
- [ ] Create user form (with role selection)
- [ ] Implement role assignment
- [ ] Add permission matrix UI
- [ ] Create usePermissions hook

**Week 2: Permission System**
- [ ] Build permission check utilities
- [ ] Add RequireRole component
- [ ] Add RequirePermission component
- [ ] Update all module pages with permission checks
- [ ] Filter navigation based on permissions
- [ ] Hide/disable actions based on roles

**Week 3: Facility Settings**
- [ ] Build facility settings page
- [ ] Add logo upload
- [ ] Implement timezone selector
- [ ] Add facility details editor
- [ ] Create admin dashboard home

---

### Phase 2: Enhanced Scheduling (1-2 weeks)

**Week 1: Templates & Recurring**
- [ ] Build shift template system
- [ ] Add weekly template creation
- [ ] Implement apply template to range
- [ ] Add conflict detection

**Week 2: Advanced Features**
- [ ] Build staff availability system
- [ ] Add shift swap requests
- [ ] Implement labor cost tracking
- [ ] Create schedule analytics

---

### Phase 3: Super Admin Portal (1-2 weeks)

**Week 1: Facility Management**
- [ ] Build facility list page
- [ ] Add create facility form
- [ ] Implement facility switcher
- [ ] Add facility deactivation

**Week 2: System-wide Features**
- [ ] Build system analytics dashboard
- [ ] Add facility admin management
- [ ] Implement cross-facility reports
- [ ] Create super admin navigation

---

## 📝 Database Migrations Needed

### Migration 009: User Management Enhancements

```sql
-- Add email to profiles (for user invitations)
ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE;

-- Add invitation system
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  facility_id UUID REFERENCES facilities(id),
  role TEXT NOT NULL,
  invited_by UUID REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add role change history
CREATE TABLE role_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  old_role TEXT,
  new_role TEXT,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migration 010: Scheduling Enhancements

```sql
-- Add staff availability
CREATE TABLE staff_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES schedule_staff(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add shift swap requests
CREATE TABLE shift_swaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES schedule_shifts(id) ON DELETE CASCADE,
  from_staff_id UUID REFERENCES schedule_staff(id),
  to_staff_id UUID REFERENCES schedule_staff(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'denied')),
  reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add recurring shift templates
CREATE TABLE shift_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_type TEXT,
  role TEXT,
  assigned_staff_id UUID REFERENCES schedule_staff(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 UI Components Needed

### Admin Components

1. **UserManagementTable.tsx**
   - Sortable, filterable user list
   - Inline role editing
   - Quick actions (edit, deactivate, reset password)

2. **UserForm.tsx**
   - Create/edit user details
   - Role selector
   - Module permission checkboxes
   - Email invitation

3. **PermissionMatrix.tsx**
   - Grid: Users (rows) × Modules (columns)
   - Click to toggle permissions
   - Visual permission levels (none/view/submit/full)

4. **RoleSelector.tsx**
   - Dropdown with role descriptions
   - Permission preview
   - Role badge styling

5. **FacilitySettingsForm.tsx**
   - Facility details editor
   - Logo upload with preview
   - Timezone selector
   - Temperature unit toggle

---

## 💡 Summary

**What You Have:**
- ✅ Excellent database architecture (5/5)
- ✅ Strong multi-tenant foundation (5/5)
- ✅ Very good employee scheduling (4/5)
- ✅ Role system defined in schema (5/5)

**What's Missing:**
- ❌ Admin dashboard and UI (0/5)
- ❌ User management interface (0/5)
- ❌ Permission management UI (0/5)
- ❌ Role-based access control in UI (0/5)
- ❌ Super admin portal (0/5)

**Recommendation:**
Focus on **Phase 1: Admin Dashboard** first. Your database is ready, you just need the UI layer to manage users, roles, and permissions. This will unlock the full potential of your hierarchical system.

---

**Would you like me to start building the Admin Dashboard?**

I can create:
1. Admin layout and navigation
2. User management pages
3. Role and permission system
4. Facility settings interface

Let me know which you'd like to tackle first!
