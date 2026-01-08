import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Save, X } from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'time';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormBuilderProps {
  tab: any;
  onSave: (data: { tab_name: string; form_schema: FormField[] }) => void;
  onCancel: () => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
];

export function FormBuilder({ tab, onSave, onCancel }: FormBuilderProps) {
  const [tabName, setTabName] = useState(tab?.tab_name || '');
  const [fields, setFields] = useState<FormField[]>(tab?.form_schema || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({ tab_name: tabName, form_schema: fields });
    } catch (error) {
      console.error('Error saving tab:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab Name */}
      <Card>
        <CardHeader>
          <CardTitle>Tab Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tab_name">
              Tab Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tab_name"
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
              placeholder="e.g., Morning Checklist"
              required
            />
            <p className="text-xs text-muted-foreground">
              This name will appear in the tab navigation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Form Fields ({fields.length})</CardTitle>
            <Button type="button" onClick={addField} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No fields added yet</p>
              <p className="text-sm mt-1">Click "Add Field" to start building your form</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="border-2">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="cursor-move pt-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-4">
                          {/* Field Label */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Field Label</Label>
                              <Input
                                value={field.label}
                                onChange={(e) =>
                                  updateField(index, { label: e.target.value })
                                }
                                placeholder="e.g., Temperature"
                              />
                            </div>

                            {/* Field Type */}
                            <div className="space-y-2">
                              <Label>Field Type</Label>
                              <select
                                value={field.type}
                                onChange={(e) =>
                                  updateField(index, {
                                    type: e.target.value as FormField['type'],
                                  })
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {FIELD_TYPES.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Placeholder */}
                          {(field.type === 'text' ||
                            field.type === 'number' ||
                            field.type === 'textarea') && (
                            <div className="space-y-2">
                              <Label>Placeholder (optional)</Label>
                              <Input
                                value={field.placeholder || ''}
                                onChange={(e) =>
                                  updateField(index, { placeholder: e.target.value })
                                }
                                placeholder="e.g., Enter temperature in °F"
                              />
                            </div>
                          )}

                          {/* Options for Select */}
                          {field.type === 'select' && (
                            <div className="space-y-2">
                              <Label>Options (one per line)</Label>
                              <Textarea
                                value={field.options?.join('\n') || ''}
                                onChange={(e) =>
                                  updateField(index, {
                                    options: e.target.value
                                      .split('\n')
                                      .filter((o) => o.trim()),
                                  })
                                }
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                rows={4}
                              />
                            </div>
                          )}

                          {/* Required Checkbox */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`required_${field.id}`}
                              checked={field.required}
                              onChange={(e) =>
                                updateField(index, { required: e.target.checked })
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor={`required_${field.id}`}>
                              Required field
                            </Label>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !tabName || fields.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Saving...' : tab ? 'Update Tab' : 'Create Tab'}
        </Button>
      </div>
    </form>
  );
}
