import React, { useState, useEffect } from 'react';
import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, NumberInput, Switch, Button } from '@tremor/react';
import { adminSettingsService, AppSettings } from '../services/adminSettingsService';
import toast from 'react-hot-toast';
import EditableCell from '../components/EditableCell';

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings[]>([]);
  const [originalSettings, setOriginalSettings] = useState<AppSettings[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminSettingsService.getAppSettings();
      setSettings(data);
      setOriginalSettings(JSON.parse(JSON.stringify(data))); // Deep copy
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingId: number, feature: keyof AppSettings, value: any) => {
    const newSettings = settings.map(s => 
      s.id === settingId ? { ...s, [feature]: value } : s
    );
    setSettings(newSettings);
    setIsDirty(true);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      await Promise.all(settings.map(s => adminSettingsService.updateAppSettings(s)));
      toast.success('Settings saved successfully');
      setOriginalSettings(JSON.parse(JSON.stringify(settings))); // Deep copy
      setIsDirty(false);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelChanges = () => {
    setSettings(originalSettings);
    setIsDirty(false);
  };

  const renderValue = (value: number | boolean) => {
    if (typeof value === 'boolean') {
      return <Switch checked={value} readOnly />;
    }
    if (value === -1) {
      return 'Unlimited';
    }
    return value;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">App Settings</h1>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Feature</TableHeaderCell>
              <TableHeaderCell>Free</TableHeaderCell>
              <TableHeaderCell>Pro</TableHeaderCell>
              <TableHeaderCell>VIP</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[ 'swipes_per_week', 'rewind_count', 'visibility_rate', 'message_requests', 'profile_views', 'ghost_mode', 'read_receipts'].map(feature => (
              <TableRow key={feature}>
                <TableCell>{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                {settings.map(setting => (
                  <TableCell key={`${feature}-${setting.account_type}`}>
                    <EditableCell 
                      value={setting[feature as keyof AppSettings]} 
                      onChange={(newValue) => handleSettingChange(setting.id, feature as keyof AppSettings, newValue)} 
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 flex justify-end space-x-4 shadow-lg">
          <Button variant="secondary" onClick={handleCancelChanges}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
