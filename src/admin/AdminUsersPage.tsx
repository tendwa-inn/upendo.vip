import React, { useState, useEffect } from 'react';
import { Card, Title, TextInput, MultiSelect, MultiSelectItem, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Button } from '@tremor/react';
import { profileService } from '../services/profileService';
import { Trash, UserX } from 'lucide-react';

interface User {
  id: string;
  name: string;
  dob: string;
  photos: string[];
  account_type: 'free' | 'pro' | 'vip';
  is_blocked: boolean;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypes, setAccountTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let newFilteredUsers = users;

    if (searchTerm) {
      newFilteredUsers = newFilteredUsers.filter(user => 
        user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (accountTypes.length > 0) {
      newFilteredUsers = newFilteredUsers.filter(user => 
        user.account_type && accountTypes.includes(user.account_type)
      );
    }

    setFilteredUsers(newFilteredUsers);
  }, [users, searchTerm, accountTypes]);

  const fetchUsers = async () => {
    const allUsers = await profileService.getAllProfiles();
    setUsers(allUsers || []);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await profileService.deleteProfile(userId);
      fetchUsers();
    }
  };

  const handleBlockUser = async (userId: string) => {
    await profileService.blockProfile(userId);
    fetchUsers();
  };

  const handleUnblockUser = async (userId: string) => {
    await profileService.unblockProfile(userId);
    fetchUsers();
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div>
      <Title>User Management</Title>
      <Card className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <TextInput
            placeholder="Search by name..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="w-1/3"
          />
          <MultiSelect
            placeholder="Filter by account type..."
            value={accountTypes}
            onValueChange={setAccountTypes}
            className="w-1/3"
          >
            <MultiSelectItem value="free">Free</MultiSelectItem>
            <MultiSelectItem value="pro">Pro</MultiSelectItem>
            <MultiSelectItem value="vip">VIP</MultiSelectItem>
          </MultiSelect>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Profile</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Age</TableHeaderCell>
              <TableHeaderCell>Account Type</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <img src={user.photos[0] || '/logo-splash.png'} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{calculateAge(user.dob)}</TableCell>
                <TableCell>{user.account_type || 'free'}</TableCell>
                                  <TableCell>
                    {user.is_blocked ? (
                      <Button onClick={() => handleUnblockUser(user.id)} variant="secondary" color="green">Unblock</Button>
                    ) : (
                      <Button icon={UserX} onClick={() => handleBlockUser(user.id)} variant="secondary" color="orange">Block</Button>
                    )}
                    <Button icon={Trash} onClick={() => handleDeleteUser(user.id)} variant="secondary" color="red" className="ml-2">Delete</Button>
                  </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
