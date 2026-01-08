import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, FileText, History } from 'lucide-react';
import { useFacilityInfo } from '@/hooks/useIceDepth';
import { useDailyReportTabs, useDailyReportSubmissions } from '@/hooks/useDailyReports';
import { format } from 'date-fns';

type ViewType = 'overview' | 'admin' | 'submit' | 'history';

export function DailyReportsPage() {
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);

  const { data: facility } = useFacilityInfo();
  const facilityId = facility?.id || null;

  const { data: tabs = [] } = useDailyReportTabs(facilityId);
  const { data: recentSubmissions = [] } = useDailyReportSubmissions(facilityId);

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todaySubmissions = recentSubmissions.filter((s: any) => s.report_date === today).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Daily Reports</h1>
          <p className="text-muted-foreground mt-2">
            Configure custom report tabs and submit daily reports
          </p>
        </div>
        <div className="flex gap-2">
          {activeView === 'admin' && tabs.length < 15 && (
            <Button onClick={() => {/* Handle create new tab */}}>
              <Plus className="mr-2 h-4 w-4" />
              New Tab
            </Button>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Configured Tabs</CardTitle>
            <CardDescription>Custom report forms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tabs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {15 - tabs.length} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Reports</CardTitle>
            <CardDescription>Submitted today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todaySubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Submissions</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentSubmissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Report</CardTitle>
            <CardDescription>Most recent submission</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length > 0 ? (
              <div className="text-sm">
                {format(new Date(recentSubmissions[0].report_date), 'MMM d, yyyy')}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No reports yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Navigation */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
              activeView === 'overview'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveView('admin')}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
              activeView === 'admin'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            Configure Tabs
          </button>
          <button
            onClick={() => setActiveView('submit')}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
              activeView === 'submit'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="h-4 w-4" />
            Submit Report
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
              activeView === 'history'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
        </div>
      </div>

      {/* View Content */}
      <div>
        {activeView === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Daily Reports</CardTitle>
              <CardDescription>Create custom report forms for your facility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">1. Configure Report Tabs</h3>
                <p className="text-sm text-muted-foreground">
                  Go to the "Configure Tabs" section to create up to 15 custom report tabs. Each tab can have its own form with different fields.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">2. Build Custom Forms</h3>
                <p className="text-sm text-muted-foreground">
                  Use the form builder to add text fields, numbers, checkboxes, dropdowns, and more to each report tab.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">3. Submit Daily Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Your team can fill out and submit reports daily. All submissions are tracked with dates and user information.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">4. View History</h3>
                <p className="text-sm text-muted-foreground">
                  Search and review all past submissions by date, tab, or staff member.
                </p>
              </div>

              {tabs.length === 0 && (
                <div className="pt-4 border-t">
                  <Button onClick={() => setActiveView('admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Your First Tab
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeView === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Tab Configuration</CardTitle>
              <CardDescription>Manage your custom report tabs (max 15)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>Tab configuration interface coming next...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeView === 'submit' && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Daily Report</CardTitle>
              <CardDescription>Fill out today's report</CardDescription>
            </CardHeader>
            <CardContent>
              {tabs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No report tabs configured yet</p>
                  <p className="text-sm mt-2">Configure tabs first to start submitting reports</p>
                  <Button onClick={() => setActiveView('admin')} className="mt-4">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Tabs
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Report submission interface coming next...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeView === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>View all past submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>Report history interface coming next...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
