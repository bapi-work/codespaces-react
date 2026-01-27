import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ settings }) => {
  const [stats, setStats] = useState(null);
  const [depreciation, setDepreciation] = useState(null);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, depRes, assignRes, healthRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/depreciation'),
        axios.get('/api/dashboard/recent-assignments'),
        axios.get('/api/dashboard/health')
      ]);

      setStats(statsRes.data);
      setDepreciation(depRes.data);
      setRecentAssignments(assignRes.data);
      setHealth(healthRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  // Prepare chart data
  const assetStatusChart = {
    labels: stats?.assetsByStatus?.map(item => item.status) || [],
    datasets: [{
      label: 'Assets by Status',
      data: stats?.assetsByStatus?.map(item => item.count) || [],
      backgroundColor: [
        '#10b981',
        '#3b82f6',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6'
      ]
    }]
  };

  const assetTypeChart = {
    labels: stats?.assetsByType?.map(item => item._id) || [],
    datasets: [{
      label: 'Assets by Type',
      data: stats?.assetsByType?.map(item => item.count) || [],
      backgroundColor: '#3b82f6'
    }]
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h2>
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-700 dark:text-gray-300">
            Database: <strong>{health?.database}</strong>
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Assets" value={stats?.totalAssets || 0} icon="🏷️" />
        <StatCard label="Assigned" value={stats?.assignedAssets || 0} icon="📤" color="blue" />
        <StatCard label="Available" value={stats?.availableAssets || 0} icon="✅" color="green" />
        <StatCard label="In Maintenance" value={stats?.maintenanceAssets || 0} icon="🔧" color="yellow" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Employees" value={stats?.totalEmployees || 0} icon="👥" />
        <StatCard label="Active Employees" value={stats?.activeEmployees || 0} icon="✅" color="green" />
        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon="👤" />
      </div>

      {/* Depreciation */}
      {depreciation && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Depreciation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Purchase Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {settings?.currency || 'USD'} {depreciation.totalPurchaseValue?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Current Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {settings?.currency || 'USD'} {depreciation.totalCurrentValue?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Depreciation</p>
              <p className="text-2xl font-bold text-red-600">
                {settings?.currency || 'USD'} {depreciation.totalDepreciation?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Depreciation %</p>
              <p className="text-2xl font-bold text-orange-600">{depreciation.depreciationPercentage}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assets by Status</h2>
          <Doughnut data={assetStatusChart} options={{ responsive: true }} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assets by Type</h2>
          <Bar data={assetTypeChart} options={{ responsive: true }} />
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Assignments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Asset</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Employee</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentAssignments.slice(0, 10).map(assignment => (
                <tr key={assignment._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2 text-gray-900 dark:text-gray-100">{assignment.asset?.name}</td>
                  <td className="py-2 text-gray-900 dark:text-gray-100">
                    {assignment.employee?.firstName} {assignment.employee?.lastName}
                  </td>
                  <td className="py-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      assignment.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">
                    {new Date(assignment.assignedDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color = 'gray' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`text-4xl p-4 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
