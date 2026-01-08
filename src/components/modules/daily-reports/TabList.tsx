import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GripVertical, Plus } from 'lucide-react';

interface TabListProps {
  tabs: any[];
  onEdit: (tab: any) => void;
  onDelete: (tab: any) => void;
  onReorder: (tabs: any[]) => void;
  onCreate: () => void;
}

export function TabList({ tabs, onEdit, onDelete, onCreate }: TabListProps) {
  const getFieldCount = (formSchema: any[]) => {
    return formSchema?.length || 0;
  };

  if (tabs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <p className="text-lg font-medium">No report tabs configured yet</p>
              <p className="text-sm mt-2">Create your first custom report tab to get started</p>
              <p className="text-xs mt-1">You can configure up to 15 different report tabs</p>
            </div>
            <Button onClick={onCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create First Tab
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tabs.map((tab, index) => (
        <Card key={tab.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="cursor-move pt-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{tab.tab_name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Order: {tab.tab_order + 1} • {getFieldCount(tab.form_schema)} fields
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(tab)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(tab)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {tab.form_schema && tab.form_schema.length > 0 && (
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Form Fields:</div>
                <div className="flex flex-wrap gap-2">
                  {tab.form_schema.slice(0, 5).map((field: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary"
                    >
                      {field.label} ({field.type})
                    </span>
                  ))}
                  {tab.form_schema.length > 5 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs text-muted-foreground">
                      +{tab.form_schema.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
