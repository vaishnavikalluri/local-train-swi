'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';

interface Train {
  _id: string;
  trainNumber: string;
  trainName: string;
  stationName: string;
  platform: string;
  status: string;
  delayMinutes: number;
  source: string;
  destination: string;
  arrivalTime: string;
  departureTime: string;
  createdByName?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalManagers: 0,
    totalTrains: 0,
  });
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrains, setShowTrains] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      
      // Store trains data
      setTrains(trainsData.trains || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, delayMinutes: number) => {
    if (status === 'on_time') {
      return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-900/30 text-green-400 border border-green-500">On Time</span>;
    } else if (status === 'delayed') {
      return <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-500">Delayed {delayMinutes}m</span>;
    } else if (status === 'cancelled') {
      return <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-900/30 text-red-400 border border-red-500">Cancelled</span>;
    }
    return null;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter trains based on search query
  const filteredTrains = trains.filter((train) => {
    const query = searchQuery.toLowerCase();
    return (
      train.trainName.toLowerCase().includes(query) ||
      train.trainNumber.toLowerCase().includes(query) ||
      train.stationName.toLowerCase().includes(query) ||
      train.source.toLowerCase().includes(query) ||
      train.destination.toLowerCase().includes(query) ||
      train.createdByName?.toLowerCase().includes(query)
    );
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalUsers}</div>
            <div className="text-base font-bold text-gray-400">Total Users</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.totalManagers}</div>
            <div className="text-base font-bold text-gray-400">Station Managers</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats.totalTrains}</div>
            <div className="text-base font-bold text-gray-400">Total Trains</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/admin/station-managers"
              className="bg-white text-slate-900 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium text-center"
            >
              Manage Station Managers
            </Link>
            <Link
              href="/admin/create-station-manager"
              className="bg-white text-slate-900 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium text-center"
            >
              Create New Manager
            </Link>
            <Link
              href="/admin/users"
              className="bg-white text-slate-900 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium text-center"
            >
              View All Users
            </Link>
            <button
              onClick={() => setShowTrains(!showTrains)}
              className="bg-white text-slate-900 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium text-center flex items-center justify-center gap-2"
            >
              {showTrains ? '▼' : '▶'} View All Trains ({stats.totalTrains})
            </button>
          </div>
        </div>

        {/* All Trains Section */}
        {showTrains && (
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">All Trains Across Network</h2>
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search trains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-700/50 text-white border border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>
            
            {filteredTrains.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  {searchQuery ? 'No trains match your search' : 'No trains in the system'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Train</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Station</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Route</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Arrival</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Departure</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Manager</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredTrains.map((train) => (
                      <tr key={train._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{train.trainName}</div>
                          <div className="text-xs text-gray-400">#{train.trainNumber}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-white font-medium">{train.stationName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-white">{train.source}</div>
                          <div className="text-xs text-gray-400">→ {train.destination}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-white font-medium">{train.platform}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-white">{formatTime(train.arrivalTime)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-white">{formatTime(train.departureTime)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(train.status, train.delayMinutes)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs text-gray-400">{train.createdByName || 'N/A'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
