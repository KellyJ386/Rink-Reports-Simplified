import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Users,
  Shield,
  Building2,
  Settings,
  BarChart3,
  ArrowLeft,
  LogOut,
} from 'lucide-react'

export function AdminLayout() {
  const { signOut } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Permissions', href: '/admin/permissions', icon: Shield },
    { name: 'Facility Settings', href: '/admin/facility', icon: Building2 },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (href: string) => location.pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Back to Main App */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r bg-white min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
