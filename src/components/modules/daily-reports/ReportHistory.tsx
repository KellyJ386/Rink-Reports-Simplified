import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Search, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface ReportHistoryProps {
  submissions: any[];
  tabs: any[];
  onEdit: (submission: any) => void;
  onDelete: (submission: any) => void;
}

export function ReportHistory({ submissions, tabs, onEdit, onDelete }: ReportHistoryProps) {
  const [searchDate, setSearchDate] = useState('');
  const [selectedTabId, setSelectedTabId] = useState('');

  const getTabName = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    return tab?.tab_name || 'Unknown Tab';
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (searchDate && sub.report_date !== searchDate) return false;
    if (selectedTabId && sub.tab_id !== selectedTabId) return false;
    return true;
  });

  const renderFormData = (formData: Record<string, any>, tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab || !tab.form_schema) return null;

    const fields = tab.form_schema.slice(0, 3); // Show first 3 fields
    const remaining = tab.form_schema.length - 3;

    return (
      <div className="space-y-1">
        {fields.map((field: any) => {
          const value = formData[field.id];
          if (value === undefined || value === null || value === '') return null;

          let displayValue = value;
          if (field.type === 'checkbox') {
            displayValue = value ? 'Yes' : 'No';
          }

          return (
            <div key={field.id} className="text-sm">
              <span className="font-medium text-muted-foreground">{field.label}:</span>{' '}
              <span>{displayValue}</span>
            </div>
          );
        })}
        {remaining > 0 && (
          <div className="text-xs text-muted-foreground">+{remaining} more fields</div>
        )}
      </div>
    );
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <p>No report submissions yet</p>
            <p className="text-sm mt-2">Submit your first daily report to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search_date">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date
              </Label>
              <Input
                id="search_date"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter_tab">
                <Search className="inline h-4 w-4 mr-1" />
                Report Tab
              </Label>
              <select
                id="filter_tab"
                value={selectedTabId}
                onChange={(e) => setSelectedTabId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Tabs</option>
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.tab_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchDate('');
                  setSelectedTabId('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredSubmissions.length} of {submissions.length} reports
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>No reports match your filters</p>
                <p className="text-sm mt-2">Try adjusting your search criteria</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {getTabName(submission.tab_id)}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(submission.report_date), 'MMMM d, yyyy')}
                      </div>
                      {submission.profiles && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {submission.profiles.first_name} {submission.profiles.last_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(submission)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(submission)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Form Data Preview */}
                {renderFormData(submission.form_data, submission.tab_id)}

                {/* Notes */}
                {submission.notes && (
                  <div className="pt-3 border-t">
                    <div className="text-sm font-medium text-muted-foreground">Notes</div>
                    <div className="mt-1 text-sm whitespace-pre-wrap">{submission.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
