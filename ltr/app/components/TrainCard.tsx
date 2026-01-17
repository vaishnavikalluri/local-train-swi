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
  arrivalTime?: string;
  departureTime?: string;
  source?: string;
  destination?: string;
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
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-5 hover:border-blue-500 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{train.trainName}</h3>
          <p className="text-sm text-gray-400">Train #{train.trainNumber}</p>
        </div>
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="group hover:scale-110 transition-transform disabled:opacity-50"
            title={isFavorite ? 'Remove from saved trains' : 'Save this train'}
          >
            {isFavorite ? (
              <svg className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.4)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Station:</span>
          <span className="font-medium text-white">{train.stationName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Platform:</span>
          <span className="font-medium text-white">{train.platform}</span>
        </div>
        
        {/* Source and Destination */}
        {train.source && (
          <div className="flex justify-between">
            <span className="text-gray-400">Source:</span>
            <span className="font-medium text-white">{train.source}</span>
          </div>
        )}
        {train.destination && (
          <div className="flex justify-between">
            <span className="text-gray-400">Destination:</span>
            <span className="font-medium text-white">{train.destination}</span>
          </div>
        )}
        
        {/* Arrival and Departure Times */}
        {train.departureTime && (
          <div className="flex justify-between">
            <span className="text-gray-400">Departure:</span>
            <span className="font-medium text-white">{new Date(train.departureTime).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
          </div>
        )}
        {train.arrivalTime && (
          <div className="flex justify-between">
            <span className="text-gray-400">Arrival:</span>
            <span className="font-medium text-white">{new Date(train.arrivalTime).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
          </div>
        )}
        
        {/* Scheduled Time (fallback if arrival/departure not available) */}
        {!train.arrivalTime && !train.departureTime && train.scheduledTime && (
          <div className="flex justify-between">
            <span className="text-gray-400">Scheduled:</span>
            <span className="font-medium text-white">
              {new Date(train.scheduledTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Status:</span>
          <StatusBadge status={train.status} delayMinutes={train.delayMinutes} />
        </div>
        
        {/* Delay Information */}
        {train.delayMinutes > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Delay:</span>
            <span className="font-semibold text-red-400">{train.delayMinutes} mins</span>
          </div>
        )}
      </div>

      {rerouteData && (
        <>
          {rerouteData.rerouteRequired ? (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
              <p className="text-sm text-yellow-400 font-medium mb-2">⚠️ Reroute Suggested</p>
              {(rerouteData.sameStationAlternatives?.length > 0 || rerouteData.nearbyStationAlternatives?.length > 0) ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-300 font-medium">
                    {rerouteData.sameStationAlternatives?.length > 0 
                      ? `Alternative trains at ${rerouteData.train?.stationName || 'this station'}:` 
                      : 'Alternative trains at nearby stations:'}
                  </p>
                  {(rerouteData.sameStationAlternatives || rerouteData.nearbyStationAlternatives || []).slice(0, 2).map((alt: any) => (
                    <div key={alt.trainId} className="bg-slate-700/50 p-2 rounded border border-slate-600">
                      <p className="text-xs font-medium text-white">{alt.trainName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">Platform {alt.platform} • {alt.stationName}</span>
                        <StatusBadge status={alt.status} delayMinutes={alt.delayMinutes} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-300">
                  Oops! No reroutes available at this time.
                </p>
              )}
            </div>
          ) : train.delayMinutes > 0 && train.delayMinutes <= 15 && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-sm text-green-400 font-medium">✓ Minimal Delay</p>
              <p className="text-xs text-gray-300 mt-1">
                Train is running with minor delay. No reroute needed.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
