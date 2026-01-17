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
    arrivalDate: '',
    arrivalTimeOnly: '',
    arrivalPeriod: 'AM',
    departureDate: '',
    departureTimeOnly: '',
    departurePeriod: 'AM',
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
  const convertTo24Hour = (time: string, period: string) => {
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const convertTo12Hour = (datetime: string) => {
    const date = new Date(datetime);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return {
      date: datetime.split('T')[0],
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      period
    };
  };
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
      
      // Convert 12-hour format to 24-hour datetime-local format
      const arrivalTime24 = convertTo24Hour(formData.arrivalTimeOnly, formData.arrivalPeriod);
      const departureTime24 = convertTo24Hour(formData.departureTimeOnly, formData.departurePeriod);
      const arrivalDateTime = `${formData.arrivalDate}T${arrivalTime24}`;
      const departureDateTime = `${formData.departureDate}T${departureTime24}`;
      
      const res = await fetch('/api/trains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          ...formData, 
          stationName,
          arrivalTime: arrivalDateTime,
          departureTime: departureDateTime
        }),
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
      
      // Convert 12-hour format to 24-hour datetime-local format
      const arrivalTime24 = convertTo24Hour(formData.arrivalTimeOnly, formData.arrivalPeriod);
      const departureTime24 = convertTo24Hour(formData.departureTimeOnly, formData.departurePeriod);
      const arrivalDateTime = `${formData.arrivalDate}T${arrivalTime24}`;
      const departureDateTime = `${formData.departureDate}T${departureTime24}`;
      
      const res = await fetch(`/api/trains/${editingTrain._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          arrivalTime: arrivalDateTime,
          departureTime: departureDateTime
        }),
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
    const arrival = convertTo12Hour(train.arrivalTime);
    const departure = convertTo12Hour(train.departureTime);
    setFormData({
      trainNumber: train.trainNumber || '',
      trainName: train.trainName || '',
      platform: train.platform || '',
      status: train.status || 'on_time',
      delayMinutes: train.delayMinutes || 0,
      arrivalTime: train.arrivalTime || '',
      departureTime: train.departureTime || '',
      arrivalDate: arrival.date || '',
      arrivalTimeOnly: arrival.time || '',
      arrivalPeriod: arrival.period || 'AM',
      departureDate: departure.date || '',
      departureTimeOnly: departure.time || '',
      departurePeriod: departure.period || 'AM',
      source: train.source || '',
      destination: train.destination || '',
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
      arrivalDate: '',
      arrivalTimeOnly: '',
      arrivalPeriod: 'AM',
      departureDate: '',
      departureTimeOnly: '',
      departurePeriod: 'AM',
      source: '',
      destination: '',
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Trains</h1>
            <p className="text-gray-300">Station: {stationName}</p>
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
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingTrain ? 'Edit Train' : 'Add New Train'}
            </h2>
            
            {/* Station Info Section */}
            <div className="mb-6 p-4 bg-blue-900/30 border-2 border-blue-500 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚉</span>
                <div>
                  <p className="text-sm font-semibold text-blue-300">Train Arriving At</p>
                  <p className="text-lg font-bold text-blue-200">{stationName}</p>
                  <p className="text-xs text-blue-300 mt-1">
                    This train record is for your station. The train is arriving at or passing through your station.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={editingTrain ? handleUpdateTrain : handleAddTrain} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Train Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.trainNumber}
                    onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Train Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.trainName}
                    onChange={(e) => setFormData({ ...formData, trainName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Platform
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Source Station
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Destination Station
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Arrival Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="date"
                      required
                      value={formData.arrivalDate}
                      onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                    />
                    <input
                      type="time"
                      required
                      value={formData.arrivalTimeOnly}
                      onChange={(e) => setFormData({ ...formData, arrivalTimeOnly: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                    />
                    <select
                      value={formData.arrivalPeriod}
                      onChange={(e) => setFormData({ ...formData, arrivalPeriod: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Departure Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="date"
                      required
                      value={formData.departureDate}
                      onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                    />
                    <input
                      type="time"
                      required
                      value={formData.departureTimeOnly}
                      onChange={(e) => setFormData({ ...formData, departureTimeOnly: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                    />
                    <select
                      value={formData.departurePeriod}
                      onChange={(e) => setFormData({ ...formData, departurePeriod: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
                  >
                    <option value="on_time">On Time</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Delay Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.delayMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white"
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
                    className="bg-slate-700 text-gray-300 px-6 py-2 rounded-md hover:bg-slate-600 transition-colors font-medium"
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
          <div className="text-center py-12 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700">
            <p className="text-gray-400 text-lg">No trains found for this station</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Train
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Arrival
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Departure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                {trains.map((train) => (
                  <tr key={train._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{train.trainName}</div>
                      <div className="text-sm text-gray-400">#{train.trainNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{train.source}</div>
                      <div className="text-sm text-gray-400">→ {train.destination}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {train.platform}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(train.arrivalTime).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
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
