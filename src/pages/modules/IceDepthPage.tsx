import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Settings } from 'lucide-react'

export function IceDepthPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ice Depth Log</h1>
          <p className="text-muted-foreground mt-2">
            Track ice surface thickness measurements with custom templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Measurement
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today's Measurements</CardTitle>
            <CardDescription>Measurements logged today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Templates</CardTitle>
            <CardDescription>Custom measurement templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Ice Depth</CardTitle>
            <CardDescription>Last 7 days average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Measurements</CardTitle>
          <CardDescription>Latest ice depth measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No measurements recorded yet</p>
            <p className="text-sm mt-2">Click "New Measurement" to get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
