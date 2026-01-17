'use client';

import { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge';
import LoadingSpinner from './LoadingSpinner';

interface RerouteDisplayProps {
  trainId: string;
}

interface RerouteExplanation {
  mainMessage: string;
  reasons: string[];
  urgencyMessage?: string;
  actionAdvice?: string;
}

interface AlternativeTrain {
  trainId: string;
  trainNumber: string;
  trainName: string;
  platform: string;
  status: string;
  delayMinutes: number;
  departureTime: string;
  stationName: string;
  explanation: RerouteExplanation;
}

interface RerouteData {
  rerouteRequired: boolean;
  reason?: string;
  explanation?: RerouteExplanation;
  train?: {
    trainNumber: string;
    trainName: string;
    stationName: string;
    status: string;
    delayMinutes: number;
  };
  sameStationAlternatives?: AlternativeTrain[];
  nearbyStationAlternatives?: AlternativeTrain[];
  sameStationCount?: number;
  nearbyStationCount?: number;
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
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">✅</span>
          <div className="flex-1">
            <p className="font-medium text-green-800">
              {rerouteData.explanation?.mainMessage || 'Train is on schedule'}
            </p>
          </div>
        </div>
        
        {rerouteData.explanation && (
          <div className="ml-8 space-y-1">
            {rerouteData.explanation.reasons.map((reason, idx) => (
              <p key={idx} className="text-sm text-green-700">• {reason}</p>
            ))}
            {rerouteData.explanation.actionAdvice && (
              <p className="text-sm text-green-600 mt-2 italic">
                💡 {rerouteData.explanation.actionAdvice}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Reroute required
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-4">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="font-semibold text-yellow-800">
            {rerouteData.explanation?.mainMessage || 'Reroute Suggested'}
          </p>
          {rerouteData.explanation && (
            <div className="mt-2 space-y-1">
              {rerouteData.explanation.reasons.map((reason, idx) => (
                <p key={idx} className="text-sm text-yellow-700">• {reason}</p>
              ))}
              {rerouteData.explanation.actionAdvice && (
                <p className="text-sm text-yellow-600 mt-2 font-medium">
                  💡 {rerouteData.explanation.actionAdvice}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Same Station Alternatives */}
      {rerouteData.sameStationAlternatives && rerouteData.sameStationAlternatives.length > 0 && (
        <div className="mt-4">
          <p className="font-medium text-gray-900 mb-3">
            Alternative Trains at {rerouteData.train?.stationName}:
          </p>
          <div className="space-y-3">
            {rerouteData.sameStationAlternatives.map((train) => (
              <div
                key={train.trainId}
                className="bg-white rounded-md p-4 border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{train.trainName}</p>
                    <p className="text-sm text-gray-500">Train #{train.trainNumber}</p>
                  </div>
                  <StatusBadge status={train.status} delayMinutes={train.delayMinutes} />
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Platform {train.platform} • Departs at {train.departureTime}
                </p>
                
                {/* Explanation for this alternative */}
                {train.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      {train.explanation.mainMessage}
                    </p>
                    <div className="space-y-0.5">
                      {train.explanation.reasons.map((reason, idx) => (
                        <p key={idx} className="text-xs text-blue-700">• {reason}</p>
                      ))}
                    </div>
                    {train.explanation.urgencyMessage && (
                      <p className="text-xs text-orange-600 font-semibold mt-2">
                        {train.explanation.urgencyMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Station Alternatives */}
      {rerouteData.nearbyStationAlternatives && rerouteData.nearbyStationAlternatives.length > 0 && (
        <div className="mt-4">
          <p className="font-medium text-gray-900 mb-3">
            Alternative Trains at Nearby Stations:
          </p>
          <div className="space-y-3">
            {rerouteData.nearbyStationAlternatives.map((train) => (
              <div
                key={train.trainId}
                className="bg-white rounded-md p-4 border border-purple-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{train.trainName}</p>
                    <p className="text-sm text-gray-500">Train #{train.trainNumber}</p>
                    <p className="text-sm text-purple-700 font-medium">📍 {train.stationName}</p>
                  </div>
                  <StatusBadge status={train.status} delayMinutes={train.delayMinutes} />
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Platform {train.platform} • Departs at {train.departureTime}
                </p>
                
                {/* Explanation for this alternative */}
                {train.explanation && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-3 mt-2">
                    <p className="text-xs font-semibold text-purple-900 mb-1">
                      {train.explanation.mainMessage}
                    </p>
                    <div className="space-y-0.5">
                      {train.explanation.reasons.map((reason, idx) => (
                        <p key={idx} className="text-xs text-purple-700">• {reason}</p>
                      ))}
                    </div>
                    {train.explanation.actionAdvice && (
                      <p className="text-xs text-purple-600 font-medium mt-2">
                        💡 {train.explanation.actionAdvice}
                      </p>
                    )}
                    {train.explanation.urgencyMessage && (
                      <p className="text-xs text-orange-600 font-semibold mt-2">
                        {train.explanation.urgencyMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No alternatives anywhere */}
      {(!rerouteData.sameStationAlternatives || rerouteData.sameStationAlternatives.length === 0) &&
       (!rerouteData.nearbyStationAlternatives || rerouteData.nearbyStationAlternatives.length === 0) && (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-md">
          <p className="text-sm font-medium text-gray-800">
            {rerouteData.explanation?.mainMessage || 'No alternatives available'}
          </p>
          {rerouteData.explanation?.reasons && (
            <div className="mt-2 space-y-1">
              {rerouteData.explanation.reasons.map((reason, idx) => (
                <p key={idx} className="text-xs text-gray-600">• {reason}</p>
              ))}
            </div>
          )}
          {rerouteData.explanation?.actionAdvice && (
            <p className="text-xs text-gray-600 mt-2 italic">
              💡 {rerouteData.explanation.actionAdvice}
            </p>
          )}
        </div>
      )}

      {/* Suggested Nearby Stations (when no same-station alternatives) */}
      {rerouteData.sameStationCount === 0 && 
       rerouteData.nearbyStationCount === 0 &&
       rerouteData.suggestedStations && 
       rerouteData.suggestedStations.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-900 mb-1">
            Suggested nearby stations:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {rerouteData.suggestedStations.map((station, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                📍 {station}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
        ℹ️ Please verify train information at the station before boarding.
      </div>
    </div>
  );
}
