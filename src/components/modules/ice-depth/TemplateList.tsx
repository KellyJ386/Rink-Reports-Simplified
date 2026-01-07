import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Copy, Trash2, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Template {
  id: string;
  template_name: string;
  point_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface TemplateListProps {
  templates: Template[];
  onCreateNew: () => void;
  onEdit: (template: Template) => void;
  onDuplicate: (template: Template) => void;
  onDelete: (template: Template) => void;
  maxTemplates?: number;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onCreateNew,
  onEdit,
  onDuplicate,
  onDelete,
  maxTemplates = 4,
}) => {
  const activeTemplates = templates.filter(t => t.is_active);
  const canCreateMore = activeTemplates.length < maxTemplates;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Measurement Templates</h3>
          <p className="text-sm text-muted-foreground">
            {activeTemplates.length} of {maxTemplates} templates created
          </p>
        </div>
        <Button onClick={onCreateNew} disabled={!canCreateMore}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {activeTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{template.template_name}</CardTitle>
              <CardDescription>
                {template.point_count} measurement points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(template.created_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last updated:</span>
                  <span>{formatDate(template.updated_at)}</span>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(template)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDuplicate(template)}
                    disabled={!canCreateMore}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(template)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {activeTemplates.length === 0 && (
          <Card className="col-span-2">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No templates created yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Create New Template" to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
