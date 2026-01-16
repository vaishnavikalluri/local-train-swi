'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { jwtDecode } from 'jwt-decode';

interface Train {
  _id: string;
  trainNumber: string;
  trainName: string;
  stationName: string;
  platform: string;
  status: string;
  delayMinutes: number;
  arrivalTime: string;
  departureTime: string;
  source: string;
  destination: string;
  createdByName?: string;
}

export default function StationManagerTrainsPage() {
  const router = useRouter();
  const [stationName, setStationName] = useState('');
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState<Train | null>(null);
  const [formData, setFormData] = useState({
    trainNumber: '',
    trainName: '',
    platform: '',
    status: 'on_time',
    delayMinutes: 0,
    arrivalTime: '',
    departureTime: '',
    source: '',
    destination: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'station_manager') {
      router.push('/unauthorized');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      setStationName(decoded.stationName || 'Unknown Station');
      fetchTrains(decoded.stationName);
    } catch (error) {
      console.error('Error decoding token:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchTrains = async (station: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/trains?stationName=${encodeURIComponent(station)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch trains');

      const data = await res.json();
      setTrains(data.trains);
    } catch (error) {
      console.error('Error fetching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/trains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, stationName }),
      });

      if (!res.ok) throw new Error('Failed to add train');

      await fetchTrains(stationName);
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Error adding train:', error);
      alert('Failed to add train');
    }
  };

  const handleUpdateTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrain) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/trains/${editingTrain._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update train');

      await fetchTrains(stationName);
      setEditingTrain(null);
      resetForm();
    } catch (error) {
      console.error('Error updating train:', error);
      alert('Failed to update train');
    }
  };

  const handleDeleteTrain = async (trainId: string) => {
    if (!confirm('Are you sure you want to delete this train?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/trains/${trainId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete train');

      await fetchTrains(stationName);
    } catch (error) {
      console.error('Error deleting train:', error);
      alert('Failed to delete train');
    }
  };

  const startEdit = (train: Train) => {
    setEditingTrain(train);
    setFormData({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      platform: train.platform,
      status: train.status,
      delayMinutes: train.delayMinutes,
      arrivalTime: new Date(train.arrivalTime).toISOString().slice(0, 16),
      departureTime: new Date(train.departureTime).toISOString().slice(0, 16),
      source: train.source,
      destination: train.destination,
    });
  };

  const resetForm = () => {
    setFormData({
      trainNumber: '',
      trainName: '',
      platform: '',
      status: 'on_time',
      delayMinutes: 0,
      arrivalTime: '',
      departureTime: '',
      source: '',
      destination: '',
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Trains</h1>
            <p className="text-gray-600">Station: {stationName}</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            {showAddForm ? 'Cancel' : '+ Add Train'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingTrain) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingTrain ? 'Edit Train' : 'Add New Train'}
            </h2>
            <form onSubmit={editingTrain ? handleUpdateTrain : handleAddTrain} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Train Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.trainNumber}
                    onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Train Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.trainName}
                    onChange={(e) => setFormData({ ...formData, trainName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Station
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination Station
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="on_time">On Time</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delay Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.delayMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingTrain ? 'Update Train' : 'Add Train'}
                </button>
                {editingTrain && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTrain(null);
                      resetForm();
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Trains List */}
        {trains.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No trains found for this station</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Train
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrival
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trains.map((train) => (
                  <tr key={train._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{train.trainName}</div>
                      <div className="text-sm text-gray-500">#{train.trainNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{train.source}</div>
                      <div className="text-sm text-gray-500">→ {train.destination}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {train.platform}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(train.arrivalTime).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(train.departureTime).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={train.status} delayMinutes={train.delayMinutes} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => startEdit(train)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTrain(train._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
