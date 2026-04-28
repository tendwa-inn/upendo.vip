import React, { useState, useEffect } from 'react';
import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, NumberInput, Switch, Button } from '@tremor/react';
import { adminSettingsService, AppSettings } from '../services/adminSettingsService';
import toast from 'react-hot-toast';
import { useAppSettingsStore } from '../stores/appSettingsStore';
import EditableCell from '../components/EditableCell';

const AdminSettingsPage: React.FC = () => {
  const { settings, getSettings, setSettings } = useAppSettingsStore();

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings();
  }, [getSettings]);



  const handleSettingChange = (settingId: number, feature: keyof AppSettings, value: any) => {
    setSettings(newSettings);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      await Promise.all(settings.map(s => adminSettingsService.updateAppSettings(s)));
      toast.success('Settings saved successfully');
      await getSettings();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelChanges = () => {
    getSettings();
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
            {[ 'swipes_per_day', 'rewind_count', 'visibility_rate', 'message_requests', 'profile_views', 'ghost_mode', 'read_receipts'].map(feature => (
              <TableRow key={feature}>
                <TableCell>{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                {['free', 'pro', 'vip'].map(tier => {
                  const setting = settings.find(s => s.account_type === tier);
                  if (!setting) return <TableCell key={tier}></TableCell>;

                  return (
                    <TableCell key={`${feature}-${setting.account_type}`}>
                      <EditableCell 
                        value={setting[feature as keyof AppSettings]} 
                        onChange={(newValue) => handleSettingChange(setting.id, feature as keyof AppSettings, newValue)} 
                      />
                    </TableCell>
                  );
                })}
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
