import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Metric, Col, Grid, Button, BarChart, DonutChart } from '@tremor/react';
import { Users, Ticket, Flag, UserX, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalPromos: 0,
    activePromos: 0,
    totalReports: 0,
    pendingReports: 0,
    dormantAccounts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);



  const userStatsChartData = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
    },
    {
      name: 'Active Now',
      value: stats.activeUsers,
    },
    {
      name: 'New Today',
      value: stats.newUsersToday,
    }
  ];

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
            <Title>User Statistics</Title>
            <div className="mt-4">
              <BarChart
                className="h-48"
                data={userStatsChartData}
                index="name"
                categories={['value']}
                colors={['indigo']}
                yAxisWidth={48}
                showAnimation={true}
                showLegend={false}
              />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                  <Text>Total Users</Text>
                </div>
                <Metric className="text-lg">{stats.totalUsers}</Metric>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  <Text>Active Now</Text>
                  {stats.activeUsers > 0 && (
                    <span className="ml-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <Metric className="text-lg">{stats.activeUsers}</Metric>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <Text>New Today</Text>
                </div>
                <Metric className="text-lg">{stats.newUsersToday}</Metric>
              </div>
            </div>
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
