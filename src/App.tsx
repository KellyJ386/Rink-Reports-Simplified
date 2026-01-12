import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { SessionTimeout } from '@/components/auth/SessionTimeout'
import { RequireRole } from '@/components/auth/RequireRole'
import { LoginPage } from '@/pages/LoginPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { IceDepthPage } from '@/pages/modules/IceDepthPage'
import { SchedulingPage } from '@/pages/modules/SchedulingPage'
import { MaintenancePage } from '@/pages/modules/MaintenancePage'
import { IncidentsPage } from '@/pages/modules/IncidentsPage'
import { DailyReportsPage } from '@/pages/modules/DailyReportsPage'
import { RefrigerationPage } from '@/pages/modules/RefrigerationPage'
import { AirQualityPage } from '@/pages/modules/AirQualityPage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { UserEditPage } from '@/pages/admin/UserEditPage'
import { UserInvitePage } from '@/pages/admin/UserInvitePage'
import { PermissionsPage } from '@/pages/admin/PermissionsPage'
import { FacilitySettingsPage } from '@/pages/admin/FacilitySettingsPage'
import { ReportsPage } from '@/pages/admin/ReportsPage'
import { SystemSettingsPage } from '@/pages/admin/SystemSettingsPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Session timeout warning - only shows for authenticated users */}
      <SessionTimeout timeoutMinutes={30} warningMinutes={5} />

      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route
            path="/forgot-password"
            element={user ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />}
          />
          <Route
            path="/reset-password"
            element={user ? <Navigate to="/dashboard" /> : <ResetPasswordPage />}
          />
        </Route>

        {/* Protected Routes */}
        <Route element={user ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ice-depth" element={<IceDepthPage />} />
          <Route path="/scheduling" element={<SchedulingPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/daily-reports" element={<DailyReportsPage />} />
          <Route path="/refrigeration" element={<RefrigerationPage />} />
          <Route path="/air-quality" element={<AirQualityPage />} />
        </Route>

        {/* Admin Routes - Require admin or super_admin role */}
        {user && (
          <Route
            path="/admin/*"
            element={
              <RequireRole roles={['admin', 'super_admin']}>
                <AdminLayout />
              </RequireRole>
            }
          >
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:userId" element={<UserEditPage />} />
            <Route path="users/invite" element={<UserInvitePage />} />
            <Route path="permissions" element={<PermissionsPage />} />
            <Route path="facility" element={<FacilitySettingsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
          </Route>
        )}

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </>
  )
}

export default App
