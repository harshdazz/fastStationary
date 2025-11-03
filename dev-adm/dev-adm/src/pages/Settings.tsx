import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { settingsData, Settings as SettingsType } from '@/lib/dummy-data';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType>(settingsData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here you would normally save to Firestore
    // For now, just update local state
    
    setIsLoading(false);
    toast({
      title: "Settings Saved",
      description: "Your settings have been successfully updated.",
    });
  };

  const handleInputChange = (field: keyof SettingsType, value: number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Configure your store settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="minPurchase">Minimum Purchase Amount ($)</Label>
              <Input
                id="minPurchase"
                type="number"
                min="0"
                step="0.01"
                value={settings.minPurchaseAmount}
                onChange={(e) => handleInputChange('minPurchaseAmount', parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Set the minimum amount required for checkout
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Overall Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.overallDiscount}
                onChange={(e) => handleInputChange('overallDiscount', parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Apply a store-wide discount percentage
              </p>
            </div>

            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-gradient-primary hover:opacity-90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Settings Preview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Settings Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <h4 className="font-semibold mb-2">Current Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Minimum Purchase:</span>
                    <span className="font-medium text-primary">
                      ${settings.minPurchaseAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Store Discount:</span>
                    <span className="font-medium text-success">
                      {settings.overallDiscount}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h4 className="font-semibold mb-2 text-accent-foreground">Example Calculation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Original Price:</span>
                    <span>$100.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount ({settings.overallDiscount}%):</span>
                    <span className="text-success">
                      -${(100 * settings.overallDiscount / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-accent/20 pt-2">
                    <span>Final Price:</span>
                    <span className="text-primary">
                      ${(100 - (100 * settings.overallDiscount / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {settings.minPurchaseAmount > 0 && (
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <h4 className="font-semibold mb-1 text-warning-foreground">Notice</h4>
                  <p className="text-sm text-warning-foreground">
                    Customers must spend at least ${settings.minPurchaseAmount.toFixed(2)} to complete their purchase.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Store Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Store is Active</span>
              <div className="h-3 w-3 bg-success rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">USD ($)</div>
            <p className="text-sm text-muted-foreground">United States Dollar</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Time Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">UTC-5</div>
            <p className="text-sm text-muted-foreground">Eastern Standard Time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}