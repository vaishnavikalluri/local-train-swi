'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

interface Train {
  _id: string;
  trainNumber: string;
  trainName: string;
  status: string;
  delayMinutes: number;
  source: string;
  destination: string;
  arrivalTime: string;
  departureTime: string;
  platform: string;
}

export default function StationManagerDashboard() {
  const router = useRouter();
  const [stationName, setStationName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [trains, setTrains] = useState<Train[]>([]);
  const [stats, setStats] = useState({
    totalTrains: 0,
    delayedTrains: 0,
    onTimeTrains: 0,
  });
  const [pendingEmergencies, setPendingEmergencies] = useState(0);
  const [emergencyStats, setEmergencyStats] = useState({
    pending: 0,
    acknowledged: 0,
    resolved: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'station_manager') {
      router.push('/unauthorized');
      return;
    }

    // Decode JWT to get station name
    try {
      const decoded: any = jwtDecode(token);
      setStationName(decoded.stationName || 'Unknown Station');
      fetchStats(decoded.stationName);
      fetchEmergencyAlerts();
      fetchManagerName();
    } catch (error) {
      console.error('Error decoding token:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchEmergencyAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/station-manager/emergency-alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPendingEmergencies(data.counts?.pending || 0);
        setEmergencyStats({
          pending: data.counts?.pending || 0,
          acknowledged: data.counts?.acknowledged || 0,
          resolved: data.counts?.resolved || 0,
          total: data.counts?.total || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching emergency alerts:', error);
    }
  };

  const fetchManagerName = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setManagerName(data.name || 'Manager');
      }
    } catch (error) {
      console.error('Error fetching manager name:', error);
    }
  };

  const fetchStats = async (station: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/trains?stationName=${encodeURIComponent(station)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch trains');

      const data = await res.json();
      const trains: Train[] = data.trains;

      // Store all trains
      setTrains(trains);

      const delayedCount = trains.filter(
        (t) => t.status === 'delayed' || t.status === 'cancelled'
      ).length;
      const onTimeCount = trains.filter((t) => t.status === 'on_time').length;

      setStats({
        totalTrains: trains.length,
        delayedTrains: delayedCount,
        onTimeTrains: onTimeCount,
      });
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

  const getUpcomingTrains = () => {
    const now = new Date();
    return trains
      .filter(train => new Date(train.arrivalTime) > now)
      .sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())
      .slice(0, 5);
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Manager {managerName}!</h1>
        <p className="text-gray-300 mb-8">Station: {stationName}</p>

        {/* Emergency Alert Banner */}
        {pendingEmergencies > 0 && (
          <div className="mb-6 bg-red-900/30 border-2 border-red-500 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🚨</span>
                <div>
                  <p className="text-lg font-bold text-red-200">
                    {pendingEmergencies} Pending Emergency {pendingEmergencies === 1 ? 'Request' : 'Requests'}!
                  </p>
                  <p className="text-sm text-red-300">
                    Passengers need immediate assistance. Please check the emergency alerts page.
                  </p>
                </div>
              </div>
              <Link
                href="/station-manager/emergency-alerts"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors shadow-lg"
              >
                Check Now →
              </Link>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalTrains}</div>
            <div className="text-base font-bold text-gray-400">Total Trains</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.onTimeTrains}</div>
            <div className="text-base font-bold text-gray-400">On Time</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.delayedTrains}</div>
            <div className="text-base font-bold text-gray-400">Delayed/Cancelled</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚨</span>
              <div className="text-3xl font-bold text-red-400">{emergencyStats.pending}</div>
            </div>
            <div className="text-base font-bold text-gray-400">Pending Emergencies</div>
            <div className="text-xs text-gray-400 mt-1">{emergencyStats.total} total alerts</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/station-manager/trains"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Manage Trains
            </Link>
            <Link
              href="/station-manager/emergency-alerts"
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
            >
              <span className="text-xl">🚨</span>
              Emergency Alerts
            </Link>
          </div>
        </div>

        {/* Upcoming Trains Section */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Upcoming Trains</h2>
            <Link
              href="/station-manager/trains"
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              View All →
            </Link>
          </div>
          
          {getUpcomingTrains().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No upcoming trains scheduled</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Train</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Route</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Arrival</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Departure</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {getUpcomingTrains().map((train) => (
                    <tr key={train._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{train.trainName}</div>
                        <div className="text-xs text-gray-400">#{train.trainNumber}</div>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}