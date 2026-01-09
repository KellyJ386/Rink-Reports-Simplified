import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, ArrowUp, ArrowDown, Save, Trash2 } from 'lucide-react';
import {
  useCircleCheckTemplates,
  useCircleCheckTemplate,
  useUpdateCircleCheckItem,
  useBulkUpdateItemOrders,
  useAddCircleCheckItem,
  useInitializeDefaultTemplates,
} from '@/hooks/useCircleCheck';

interface CircleCheckTemplateBuilderProps {
  facilityId: string;
}

export function CircleCheckTemplateBuilder({ facilityId }: CircleCheckTemplateBuilderProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('mechanical');

  const { data: templates = [] } = useCircleCheckTemplates(facilityId);
  const { data: templateData } = useCircleCheckTemplate(selectedTemplateId);
  const updateItem = useUpdateCircleCheckItem();
  const bulkUpdateOrders = useBulkUpdateItemOrders();
  const addItem = useAddCircleCheckItem();
  const initializeDefaults = useInitializeDefaultTemplates();

  const items = templateData?.circle_check_items || [];

  const handleToggleEnabled = async (itemId: string, currentValue: boolean) => {
    await updateItem.mutateAsync({
      id: itemId,
      is_enabled: !currentValue,
    });
  };

  const handleToggleMandatory = async (itemId: string, currentValue: boolean) => {
    await updateItem.mutateAsync({
      id: itemId,
      is_mandatory: !currentValue,
    });
  };

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newItems.length) return;

    // Swap items
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

    // Update orders
    const updates = newItems.map((item: any, idx: number) => ({
      id: item.id,
      item_order: idx + 1,
    }));

    await bulkUpdateOrders.mutateAsync(updates);
  };

  const handleAddCustomItem = async () => {
    if (!newItemText.trim() || !selectedTemplateId) return;

    const maxOrder = items.length > 0 ? Math.max(...items.map((i: any) => i.item_order)) : 0;

    await addItem.mutateAsync({
      template_id: selectedTemplateId,
      item_text: newItemText,
      item_order: maxOrder + 1,
      category: newItemCategory,
      is_enabled: true,
      is_mandatory: false,
    });

    setNewItemText('');
    setShowAddItem(false);
  };

  const handleInitializeDefaults = async () => {
    if (window.confirm('This will create Electric and Gas Zamboni templates with standard check items. Continue?')) {
      await initializeDefaults.mutateAsync(facilityId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Circle Check Templates</CardTitle>
          <CardDescription>
            Configure which check items are shown to operators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No templates found</p>
              <Button onClick={handleInitializeDefaults}>
                <Plus className="mr-2 h-4 w-4" />
                Create Default Templates
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Select Template to Edit</Label>
              <select
                value={selectedTemplateId || ''}
                onChange={(e) => setSelectedTemplateId(e.target.value || null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">-- Select Template --</option>
                {templates.map((template: any) => (
                  <option key={template.id} value={template.id}>
                    {template.template_name} ({template.machine_type})
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Items */}
      {selectedTemplateId && templateData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{templateData.template_name}</CardTitle>
                <CardDescription>
                  {items.filter((i: any) => i.is_enabled).length} of {items.length} items enabled
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddItem(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Add Custom Item Form */}
            {showAddItem && (
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new_item_text">Item Text</Label>
                      <Input
                        id="new_item_text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="e.g., Check custom component"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_item_category">Category</Label>
                      <select
                        id="new_item_category"
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="mechanical">Mechanical</option>
                        <option value="electrical">Electrical</option>
                        <option value="hydraulic">Hydraulic</option>
                        <option value="safety">Safety</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddCustomItem} disabled={!newItemText.trim()}>
                        <Save className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setShowAddItem(false);
                        setNewItemText('');
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items List */}
            <div className="space-y-1">
              {items.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded border ${
                    item.is_enabled ? 'bg-background' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  {/* Order Controls */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMoveItem(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMoveItem(index, 'down')}
                      disabled={index === items.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Order Number */}
                  <div className="text-sm text-muted-foreground w-8">
                    #{item.item_order}
                  </div>

                  {/* Item Text */}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.item_text}</div>
                    <div className="text-xs text-muted-foreground">
                      Category: {item.category || 'N/A'}
                    </div>
                  </div>

                  {/* Mandatory Toggle */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`mandatory-${item.id}`} className="text-xs cursor-pointer">
                      Required
                    </Label>
                    <Switch
                      id={`mandatory-${item.id}`}
                      checked={item.is_mandatory}
                      onCheckedChange={(checked) => handleToggleMandatory(item.id, item.is_mandatory)}
                      disabled={!item.is_enabled}
                    />
                  </div>

                  {/* Enabled Toggle */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`enabled-${item.id}`} className="text-xs cursor-pointer">
                      Enabled
                    </Label>
                    <Switch
                      id={`enabled-${item.id}`}
                      checked={item.is_enabled}
                      onCheckedChange={(checked) => handleToggleEnabled(item.id, item.is_enabled)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No check items found in this template</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!selectedTemplateId && templates.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Select a template above to view and configure its check items</li>
                <li>Use the <strong>Enabled</strong> toggle to show/hide items from operators</li>
                <li>Use the <strong>Required</strong> toggle to mark items as mandatory</li>
                <li>Use arrow buttons to reorder items</li>
                <li>Click <strong>Add Custom Item</strong> to add facility-specific checks</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
