import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { IceDepthPage } from '@/pages/modules/IceDepthPage'
import { SchedulingPage } from '@/pages/modules/SchedulingPage'
import { MaintenancePage } from '@/pages/modules/MaintenancePage'
import { IncidentsPage } from '@/pages/modules/IncidentsPage'
import { DailyReportsPage } from '@/pages/modules/DailyReportsPage'

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
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={user ? <MainLayout /> : <Navigate to="/login" />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ice-depth" element={<IceDepthPage />} />
        <Route path="/scheduling" element={<SchedulingPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/daily-reports" element={<DailyReportsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
