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
}

export default function StationManagerDashboard() {
  const router = useRouter();
  const [stationName, setStationName] = useState('');
  const [stats, setStats] = useState({
    totalTrains: 0,
    delayedTrains: 0,
    onTimeTrains: 0,
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
    } catch (error) {
      console.error('Error decoding token:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchStats = async (station: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/trains?stationName=${encodeURIComponent(station)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch trains');

      const data = await res.json();
      const trains: Train[] = data.trains;

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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Station Manager Dashboard</h1>
        <p className="text-gray-600 mb-8">Station: {stationName}</p>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalTrains}</div>
            <div className="text-sm text-gray-600">Total Trains</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.onTimeTrains}</div>
            <div className="text-sm text-gray-600">On Time</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.delayedTrains}</div>
            <div className="text-sm text-gray-600">Delayed/Cancelled</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link
              href="/station-manager/trains"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Manage Trains
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}