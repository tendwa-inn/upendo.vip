import React from 'react';
import { Card, Title, Text, Metric, Col, Grid, Button } from '@tremor/react';
import { Users, Ticket, Flag, UserX, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Placeholder data for demonstration
  const stats = {
    totalUsers: 1200,
    activeUsers: 850,
    newUsersToday: 50,
    totalPromos: 15,
    activePromos: 8,
    totalReports: 72,
    pendingReports: 12,
    dormantAccounts: 150,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button 
          icon={UsersIcon} 
          size="lg" 
          color="pink"
          onClick={() => navigate('/admin/connections')}
        >
          Manage Connections
        </Button>
      </div>
      
      <Grid numItemsLg={3} className="gap-6">
        <Col>
          <Card decoration="top" decorationColor="indigo">
            <Text>Total Users</Text>
            <Metric>{stats.totalUsers}</Metric>
            <Text className="mt-2">Active: {stats.activeUsers}</Text>
            <Text>New today: {stats.newUsersToday}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="emerald">
            <Text>Promo Codes</Text>
            <Metric>{stats.totalPromos}</Metric>
            <Text className="mt-2">Active: {stats.activePromos}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="rose">
            <Text>User Reports</Text>
            <Metric>{stats.totalReports}</Metric>
            <Text className="mt-2">Pending: {stats.pendingReports}</Text>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="yellow">
            <Text>Dormant Accounts</Text>
            <Metric>{stats.dormantAccounts}</Metric>
          </Card>
        </Col>
      </Grid>

      {/* Further sections for recent activities, charts, etc. */}
    </div>
  );
};

export default AdminDashboard;
