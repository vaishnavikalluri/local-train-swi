'use client';

import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';

interface Train {
  _id: string;
  trainNumber: string;
  trainName: string;
  stationName: string;
  platform: string;
  status: string;
  delayMinutes: number;
  scheduledTime: string;
  isFavorite?: boolean;
}

interface TrainCardProps {
  train: Train;
  onFavoriteToggle?: (trainId: string, isFavorite: boolean) => void;
  showFavorite?: boolean;
  rerouteData?: any;
}

export default function TrainCard({
  train,
  onFavoriteToggle,
  showFavorite = false,
  rerouteData,
}: TrainCardProps) {
  const [isFavorite, setIsFavorite] = useState(train.isFavorite || false);
  const [loading, setLoading] = useState(false);

  // Sync state with prop changes
  useEffect(() => {
    setIsFavorite(train.isFavorite || false);
  }, [train.isFavorite]);

  const handleFavoriteClick = async () => {
    if (!onFavoriteToggle) return;
    setLoading(true);
    try {
      await onFavoriteToggle(train._id, !isFavorite);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error in favorite toggle:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{train.trainName}</h3>
          <p className="text-sm text-gray-500">Train #{train.trainNumber}</p>
        </div>
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="text-3xl hover:scale-110 transition-transform disabled:opacity-50"
            title={isFavorite ? 'Remove from saved trains' : 'Save this train'}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Station:</span>
          <span className="font-medium text-gray-900">{train.stationName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Platform:</span>
          <span className="font-medium text-gray-900">{train.platform}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Scheduled:</span>
          <span className="font-medium text-gray-900">
            {new Date(train.scheduledTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <StatusBadge status={train.status} delayMinutes={train.delayMinutes} />
        </div>
      </div>

      {rerouteData && rerouteData.rerouteRequired && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ Reroute Suggested</p>
          {rerouteData.alternativeTrains?.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-700 font-medium">
                Alternative trains at {rerouteData.train?.stationName || 'this station'}:
              </p>
              {rerouteData.alternativeTrains.slice(0, 2).map((alt: any) => (
                <div key={alt.trainId} className="bg-white p-2 rounded border border-gray-200">
                  <p className="text-xs font-medium text-gray-900">{alt.trainName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">Platform {alt.platform}</span>
                    <StatusBadge status={alt.status} delayMinutes={alt.delayMinutes} />
                  </div>
                </div>
              ))}
            </div>
          ) : rerouteData.suggestedStations?.length > 0 ? (
            <div className="text-xs text-gray-700">
              <p className="font-medium mb-1">Check nearby stations:</p>
              <p>{rerouteData.suggestedStations.join(', ')}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-700">
              Oops! No reroutes available at this time.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
