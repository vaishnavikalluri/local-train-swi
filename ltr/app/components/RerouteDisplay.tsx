'use client';

import { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge';
import LoadingSpinner from './LoadingSpinner';

interface RerouteDisplayProps {
  trainId: string;
}

interface AlternativeTrain {
  trainId: string;
  trainNumber: string;
  trainName: string;
  platform: string;
  status: string;
  delayMinutes: number;
}

interface RerouteData {
  rerouteRequired: boolean;
  reason?: string;
  train?: {
    trainNumber: string;
    trainName: string;
    stationName: string;
    status: string;
    delayMinutes: number;
  };
  alternativeTrains?: AlternativeTrain[];
  alternativesCount?: number;
  suggestedStations?: string[];
  message: string;
}

export default function RerouteDisplay({ trainId }: RerouteDisplayProps) {
  const [rerouteData, setRerouteData] = useState<RerouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRerouteData();
  }, [trainId]);

  const fetchRerouteData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/trains/${trainId}/reroutes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch reroute data');

      const data = await res.json();
      setRerouteData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!rerouteData) return null;

  // Train is on time or minimal delay
  if (!rerouteData.rerouteRequired) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-medium text-green-800">Train is on schedule</p>
            <p className="text-sm text-green-600">{rerouteData.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Reroute required
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-4">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="font-semibold text-yellow-800">Reroute Suggested</p>
          <p className="text-sm text-yellow-700">{rerouteData.reason}</p>
        </div>
      </div>

      {/* Alternative Trains */}
      {rerouteData.alternativeTrains && rerouteData.alternativeTrains.length > 0 && (
        <div className="mt-4">
          <p className="font-medium text-gray-900 mb-3">
            Alternative Trains at {rerouteData.train?.stationName}:
          </p>
          <div className="space-y-2">
            {rerouteData.alternativeTrains.map((train) => (
              <div
                key={train.trainId}
                className="bg-white rounded-md p-3 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{train.trainName}</p>
                    <p className="text-sm text-gray-500">Train #{train.trainNumber}</p>
                  </div>
                  <StatusBadge status={train.status} delayMinutes={train.delayMinutes} />
                </div>
                <p className="text-sm text-gray-600">Platform {train.platform}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Stations or No Alternatives */}
      {(!rerouteData.alternativeTrains || rerouteData.alternativeTrains.length === 0) && (
        <>
          {rerouteData.suggestedStations && rerouteData.suggestedStations.length > 0 ? (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-1">
                No alternatives at this station
              </p>
              <p className="text-sm text-blue-700">
                Consider checking nearby stations:{' '}
                <span className="font-medium">{rerouteData.suggestedStations.join(', ')}</span>
              </p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-md">
              <p className="text-sm font-medium text-gray-800">
                Oops! No reroutes available at this time.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Please check with station staff for assistance.
              </p>
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
        ℹ️ Please verify train information at the station before boarding.
      </div>
    </div>
  );
}
