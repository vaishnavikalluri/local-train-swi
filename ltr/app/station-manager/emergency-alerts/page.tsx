'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface EmergencyAlert {
  _id: string;
  boardingStationName: string;
  platformNumber: string;
  trainNumber: string;
  trainName: string;
  coach: string;
  seatNumber: string;
  destinationStationName: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  acknowledgedBy?: {
    name: string;
    email: string;
  };
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AlertCounts {
  pending: number;
  acknowledged: number;
  resolved: number;
  total: number;
}

export default function EmergencyAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [counts, setCounts] = useState<AlertCounts>({
    pending: 0,
    acknowledged: 0,
    resolved: 0,
    total: 0,
  });
  const [stationName, setStationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'acknowledged' | 'resolved'>('all');
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'station_manager') {
      router.push('/unauthorized');
      return;
    }

    fetchAlerts();
  }, [router, statusFilter]);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = statusFilter === 'all' 
        ? '/api/station-manager/emergency-alerts'
        : `/api/station-manager/emergency-alerts?status=${statusFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch alerts');

      const data = await res.json();
      setAlerts(data.alerts);
      setCounts(data.counts);
      setStationName(data.stationName);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (alertId: string, newStatus: 'acknowledged' | 'resolved') => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/station-manager/emergency-alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: updateNotes || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to update alert');

      await fetchAlerts();
      setSelectedAlert(null);
      setUpdateNotes('');
      alert('Alert updated successfully!');
    } catch (error) {
      console.error('Error updating alert:', error);
      alert('Failed to update alert');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-red-100 text-red-800 border-red-300',
      acknowledged: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
    };

    const labels = {
      pending: '🚨 PENDING',
      acknowledged: '👁️ ACKNOWLEDGED',
      resolved: '✅ RESOLVED',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getStationRole = (alert: EmergencyAlert) => {
    if (alert.boardingStationName === stationName && alert.destinationStationName === stationName) {
      return '🔄 Boarding & Destination';
    } else if (alert.boardingStationName === stationName) {
      return '🚉 Boarding Station';
    } else if (alert.destinationStationName === stationName) {
      return '🎯 Destination Station';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-3xl">🚨</span>
            Emergency Alerts
          </h1>
          <p className="text-gray-300">
            Station: <span className="font-semibold">{stationName}</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Showing alerts where your station is boarding or destination point
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border-2 border-slate-700 p-4">
            <div className="text-sm text-gray-400 mb-1">Total Alerts</div>
            <div className="text-3xl font-bold text-white">{counts.total}</div>
          </div>
          <div className="bg-red-900/30 backdrop-blur rounded-lg border-2 border-red-500 p-4">
            <div className="text-sm text-red-300 mb-1 font-medium">🚨 Pending</div>
            <div className="text-3xl font-bold text-red-400">{counts.pending}</div>
          </div>
          <div className="bg-yellow-900/30 backdrop-blur rounded-lg border-2 border-yellow-500 p-4">
            <div className="text-sm text-yellow-300 mb-1 font-medium">👁️ Acknowledged</div>
            <div className="text-3xl font-bold text-yellow-400">{counts.acknowledged}</div>
          </div>
          <div className="bg-green-900/30 backdrop-blur rounded-lg border-2 border-green-500 p-4">
            <div className="text-sm text-green-300 mb-1 font-medium">✅ Resolved</div>
            <div className="text-3xl font-bold text-green-400">{counts.resolved}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              All ({counts.total})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setStatusFilter('acknowledged')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'acknowledged'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Acknowledged ({counts.acknowledged})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'resolved'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Resolved ({counts.resolved})
            </button>
          </div>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-8 text-center">
            <p className="text-gray-400">No emergency alerts found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`bg-slate-800/50 backdrop-blur rounded-lg border-2 p-6 shadow-sm ${
                  alert.status === 'pending'
                    ? 'border-red-500 bg-red-900/20'
                    : alert.status === 'acknowledged'
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-green-500 bg-green-900/20'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">
                      {alert.status === 'pending' ? '🚨' : alert.status === 'acknowledged' ? '👁️' : '✅'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getStatusBadge(alert.status)}
                        <span className="text-xs px-2 py-1 bg-blue-600/50 text-blue-200 rounded-full font-medium">
                          {getStationRole(alert)}
                        </span>
                        <span className="text-xs text-gray-400">{getTimeAgo(alert.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Reported: {formatDateTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Journey Information */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Boarding Info */}
                    <div className="bg-blue-900/30 p-3 rounded border border-blue-500">
                      <p className="text-xs font-semibold text-blue-300 mb-2">🚉 Boarding Station</p>
                      <p className="font-bold text-blue-200 text-lg">{alert.boardingStationName}</p>
                      <p className="text-sm text-blue-300">Platform {alert.platformNumber}</p>
                    </div>

                    {/* Destination Info */}
                    <div className="bg-green-900/30 p-3 rounded border border-green-500">
                      <p className="text-xs font-semibold text-green-300 mb-2">🎯 Destination Station</p>
                      <p className="font-bold text-green-200 text-lg">{alert.destinationStationName}</p>
                    </div>
                  </div>

                  {/* Train & Location Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Train Number</p>
                      <p className="font-semibold text-white">{alert.trainNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Train Name</p>
                      <p className="font-semibold text-white">{alert.trainName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Coach</p>
                      <p className="font-semibold text-white">{alert.coach}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Seat</p>
                      <p className="font-semibold text-white">{alert.seatNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {alert.notes && (
                  <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500 rounded">
                    <p className="text-xs text-blue-300 mb-1 font-semibold">Notes:</p>
                    <p className="text-sm text-blue-200">{alert.notes}</p>
                  </div>
                )}

                {/* Acknowledgement Info */}
                {alert.acknowledgedBy && (
                  <div className="mb-4 p-3 bg-slate-700/50 rounded text-xs text-gray-300">
                    <p>
                      Acknowledged by <span className="font-semibold">{alert.acknowledgedBy.name}</span> on{' '}
                      {alert.acknowledgedAt && formatDateTime(alert.acknowledgedAt)}
                    </p>
                  </div>
                )}

                {/* Resolution Info */}
                {alert.resolvedAt && (
                  <div className="mb-4 p-3 bg-green-900/30 rounded text-xs text-green-300">
                    <p>Resolved on {formatDateTime(alert.resolvedAt)}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {alert.status === 'pending' && (
                    <>
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        👁️ Acknowledge
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setUpdateNotes('');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        ✅ Mark Resolved
                      </button>
                    </>
                  )}
                  {alert.status === 'acknowledged' && (
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setUpdateNotes('');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✅ Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-lg shadow-2xl max-w-md w-full border border-slate-700">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-bold">Update Alert Status</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-2">
                  {selectedAlert.trainName} ({selectedAlert.trainNumber})
                </p>
                <p className="text-sm text-gray-300">
                  {selectedAlert.boardingStationName} → {selectedAlert.destinationStationName}
                </p>
                <p className="text-sm text-gray-300">
                  Platform {selectedAlert.platformNumber} • Coach {selectedAlert.coach} • Seat {selectedAlert.seatNumber}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Add Notes (Optional)
                </label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="e.g., Team dispatched, passenger assisted..."
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-0 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {selectedAlert.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedAlert._id, 'acknowledged')}
                    disabled={isUpdating}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    {isUpdating ? 'Updating...' : '👁️ Acknowledge'}
                  </button>
                )}
                <button
                  onClick={() => handleUpdateStatus(selectedAlert._id, 'resolved')}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {isUpdating ? 'Updating...' : '✅ Resolve'}
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedAlert(null);
                  setUpdateNotes('');
                }}
                className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
