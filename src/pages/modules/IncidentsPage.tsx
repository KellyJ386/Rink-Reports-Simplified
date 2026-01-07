import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, AlertTriangle } from 'lucide-react'

export function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Incident Reports</h1>
          <p className="text-muted-foreground mt-2">
            Document safety incidents with interactive body diagrams and automatic notifications
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Incident Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Incidents</CardTitle>
            <CardDescription>Reports filed today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Total incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical</CardTitle>
            <CardDescription>Serious incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minor</CardTitle>
            <CardDescription>Minor incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incident Reports</CardTitle>
          <CardDescription>Latest safety incidents and injuries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No incident reports filed yet</p>
            <p className="text-sm mt-2">Click "New Incident Report" to document an incident</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
