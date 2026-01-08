import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Ruler, Calendar, Wrench, AlertTriangle, FileText, Snowflake } from 'lucide-react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const modules = [
    {
      name: 'Ice Depth Log',
      description: 'Track ice surface thickness measurements with custom templates',
      href: '/ice-depth',
      icon: Ruler,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Employee Scheduling',
      description: 'Manage staff schedules, shifts, and time-off requests',
      href: '/scheduling',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Ice Maintenance Log',
      description: 'Track resurfacing, blade changes, and circle checks',
      href: '/maintenance',
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'Daily Reports',
      description: 'Create custom report templates and track daily operations',
      href: '/daily-reports',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Incident Reports',
      description: 'Document safety incidents and track injury reports',
      href: '/incidents',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: 'Refrigeration Log',
      description: 'Monitor system performance with trend analysis and alerts',
      href: '/refrigeration',
      icon: Snowflake,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to Max Facility Operations. Select a module to get started.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Link key={module.name} to={module.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Users</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today's Logs</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Items</span>
                <span className="font-semibold">3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>No recent activity to display</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
