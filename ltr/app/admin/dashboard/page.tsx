'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalManagers: 0,
    totalTrains: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'super_admin') {
      router.push('/unauthorized');
      return;
    }

    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');

      const [usersRes, managersRes, trainsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/station-managers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/trains', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!usersRes.ok || !managersRes.ok || !trainsRes.ok) {
        throw new Error('Failed to fetch stats');
      }

      const [usersData, managersData, trainsData] = await Promise.all([
        usersRes.json(),
        managersRes.json(),
        trainsRes.json(),
      ]);

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalManagers: managersData.stationManagers?.length || 0,
        totalTrains: trainsData.trains?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalManagers}</div>
            <div className="text-sm text-gray-600">Station Managers</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalTrains}</div>
            <div className="text-sm text-gray-600">Total Trains</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/admin/station-managers"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium text-center"
            >
              Manage Station Managers
            </Link>
            <Link
              href="/admin/create-station-manager"
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium text-center"
            >
              Create New Manager
            </Link>
            <Link
              href="/admin/users"
              className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors font-medium text-center"
            >
              View All Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
