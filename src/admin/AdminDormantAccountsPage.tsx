import React, { useState, useEffect } from 'react';
import { Card, Title, Tab, TabList, TabGroup, TabPanel, TabPanels, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Button } from '@tremor/react';
import { profileService } from '../services/profileService';
import { Trash } from 'lucide-react';

interface DormantUser {
  id: string;
  name: string;
  deactivated_at: string;
  photos: string[];
}

const AdminDormantAccountsPage: React.FC = () => {
  const [dormantUsers, setDormantUsers] = useState<DormantUser[]>([]);
  const [scheduledForDeletion, setScheduledForDeletion] = useState<DormantUser[]>([]);

  useEffect(() => {
    fetchDormantUsers();
  }, []);

  const fetchDormantUsers = async () => {
    const allDormantUsers = await profileService.getDormantProfiles();
    if (allDormantUsers) {
      setDormantUsers(allDormantUsers);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const forDeletion = allDormantUsers.filter(user => new Date(user.deactivated_at) < thirtyDaysAgo);
      setScheduledForDeletion(forDeletion);
    }
  };

  const handleDelete = async (userId: string) => {
    const success = await profileService.deleteProfile(userId);
    if (success) {
      fetchDormantUsers();
    }
  };

  return (
    <div>
      <Title>Dormant Accounts</Title>
      <TabGroup>
        <TabList>
          <Tab>Deactivated</Tab>
          <Tab>Scheduled for Deletion</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card className="mt-6">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Profile</TableHeaderCell>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Deactivated At</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dormantUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <img src={user.photos[0] || '/logo-splash.png'} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{new Date(user.deactivated_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>
          <TabPanel>
            <Card className="mt-6">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Profile</TableHeaderCell>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Deactivated At</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledForDeletion.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <img src={user.photos[0] || '/logo-splash.png'} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{new Date(user.deactivated_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleDelete(user.id)}
                          color="red"
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default AdminDormantAccountsPage;
