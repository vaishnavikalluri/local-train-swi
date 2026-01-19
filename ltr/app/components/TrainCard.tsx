'use client';

import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';

interface Train {
  _id: string;
  trainNumber: string;
  trainName: string;
  stationName: string;
  city?: string;
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
  onRefresh?: (trainId: string) => void;
  showFavorite?: boolean;
  rerouteData?: any;
  viewMode?: 'grid' | 'list';
}

export default function TrainCard({
  train,
  onFavoriteToggle,
  onRefresh,
  showFavorite = false,
  rerouteData,
  viewMode = 'grid',
}: TrainCardProps) {
  const [isFavorite, setIsFavorite] = useState(train.isFavorite || false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Helper function to format time with AM/PM
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '--:--';
    
    // If it's already in HH:MM format (e.g., "19:52")
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    // If it's an ISO date string, extract time
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
      }
    } catch (e) {
      // If parsing fails, return as is
    }
    
    return timeString;
  };

  // Helper function to format date and time
  const formatDateTime = (timeString: string | undefined) => {
    if (!timeString) return { date: '', time: '--:--' };
    
    // If it's already in HH:MM format (e.g., "19:52")
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
      
      return { date: dateStr, time: timeStr };
    }
    
    // If it's an ISO date string
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        return { date: dateStr, time: timeStr };
      }
    } catch (e) {
      // If parsing fails
    }
    
    return { date: '', time: timeString };
  };

  // Sync state with prop changes
  useEffect(() => {
    setIsFavorite(train.isFavorite || false);
  }, [train.isFavorite]);

  // Calculate real-time progress based on departure and arrival times
  useEffect(() => {
    const calculateProgress = () => {
      if (!train.departureTime || !train.arrivalTime) {
        // If no times available, show 50% as mid-journey
        setProgress(50);
        return;
      }

      const now = new Date().getTime();
      const departure = new Date(train.departureTime).getTime();
      const arrival = new Date(train.arrivalTime).getTime();

      // Calculate progress percentage
      if (now < departure) {
        // Train hasn't departed yet
        setProgress(0);
      } else if (now > arrival) {
        // Train has arrived
        setProgress(100);
      } else {
        // Train is in transit
        const totalDuration = arrival - departure;
        const elapsed = now - departure;
        const progressPercent = (elapsed / totalDuration) * 100;
        setProgress(Math.min(Math.max(progressPercent, 0), 100));
      }
    };

    // Calculate immediately
    calculateProgress();

    // Update every 30 seconds for real-time updates
    const interval = setInterval(calculateProgress, 30000);

    return () => clearInterval(interval);
  }, [train.departureTime, train.arrivalTime]);

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

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh(train._id);
    } catch (error) {
      console.error('Error refreshing train data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // List View Layout
  if (viewMode === 'list') {
    return (
      <div key={`${train._id}-list`} className="glass-card rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-700/50 hover:border-emerald-500/30 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Left Section: Train Info */}
          <div className="flex-1 flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <i className="bi bi-train-front text-white text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1 truncate">{train.trainName}</h3>
              <p className="text-sm text-gray-400 flex items-center gap-2 flex-wrap">
                <span className="font-mono font-semibold">#{train.trainNumber}</span>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1">
                  <i className="bi bi-geo-alt text-xs"></i>
                  {train.stationName}
                </span>
                {train.city && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1">
                      <i className="bi bi-building text-xs"></i>
                      {train.city}
                    </span>
                  </>
                )}
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1">
                  <i className="bi bi-signpost text-xs"></i>
                  Platform {train.platform}
                </span>
              </p>
            </div>
          </div>

          {/* Middle Section: Route Info */}
          {(train.source || train.destination) && (
            <div className="flex items-center gap-3 text-sm px-4 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              {train.source && (
                <div className="flex items-center gap-1.5">
                  <i className="bi bi-arrow-up-circle text-emerald-400"></i>
                  <span className="text-gray-200 font-medium">{train.source}</span>
                </div>
              )}
              {train.source && train.destination && (
                <i className="bi bi-arrow-right text-gray-600"></i>
              )}
              {train.destination && (
                <div className="flex items-center gap-1.5">
                  <i className="bi bi-arrow-down-circle text-emerald-400"></i>
                  <span className="text-gray-200 font-medium">{train.destination}</span>
                </div>
              )}
            </div>
          )}

          {/* Right Section: Time & Status */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm text-center px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <p className="text-gray-400 text-xs mb-1 flex items-center gap-1 justify-center">
                <i className="bi bi-clock"></i>
                Departure
              </p>
              <p className="font-bold text-white">
                {formatTime(train.departureTime || train.scheduledTime)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {train.delayMinutes > 0 ? (
                <>
                  <span className="text-orange-400 font-semibold text-sm">Delayed</span>
                  <div className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <span className="text-xs font-bold text-orange-400">+{train.delayMinutes}m</span>
                  </div>
                </>
              ) : (
                <span className="text-emerald-400 font-semibold text-sm">On Time</span>
              )}
            </div>

            {showFavorite && (
              <button
                onClick={handleFavoriteClick}
                disabled={loading}
                className="group hover:scale-110 transition-transform disabled:opacity-50"
                title={isFavorite ? 'Remove from saved trains' : 'Save this train'}
              >
                <i className={`bi ${isFavorite ? 'bi-bookmark-star-fill text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bi-bookmark text-gray-400 group-hover:text-yellow-400'} text-xl`}></i>
              </button>
            )}
          </div>
        </div>

        {/* Reroute Info for List View */}
        {rerouteData && rerouteData.rerouteRequired && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-start gap-3">
              <i className="bi bi-exclamation-triangle-fill text-orange-400 text-lg mt-0.5"></i>
              <div className="flex-1">
                <p className="text-sm text-orange-400 font-semibold mb-2">Alternative trains available</p>
                {(rerouteData.sameStationAlternatives?.length > 0 || rerouteData.nearbyStationAlternatives?.length > 0) && (
                  <div className="flex gap-2 flex-wrap">
                    {(rerouteData.sameStationAlternatives || rerouteData.nearbyStationAlternatives || []).slice(0, 2).map((alt: any) => (
                      <div key={alt.trainId} className="inline-flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs">
                        <span className="font-medium text-white">{alt.trainName}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400">Platform {alt.platform}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid View Layout (Ticket-Style Dark Design)
  return (
    <div className="relative glass-card rounded-2xl p-6 transition-all duration-300 group overflow-hidden">
      {/* Ticket Cuts/Perforations */}
      <div className="absolute left-0 top-2/3 -translate-y-1/2 w-8 h-8 bg-[#0f172a] rounded-full -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute right-0 top-2/3 -translate-y-1/2 w-8 h-8 bg-[#0f172a] rounded-full translate-x-1/2 pointer-events-none"></div>
      
      {/* Route Visualization */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {/* Source Station */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="text-emerald-500">
              <i className="bi bi-train-front text-3xl"></i>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">{train.source || train.stationName}</h3>
              <div className="text-sm">
                <p className="text-xs text-emerald-400 font-semibold mb-0.5">Departure</p>
                <p className="text-xs text-gray-500">{formatDateTime(train.departureTime || train.scheduledTime).date}</p>
                <p className="text-gray-400 font-medium">{formatDateTime(train.departureTime || train.scheduledTime).time}</p>
              </div>
            </div>
          </div>

          {/* Route Progress Line */}
          <div className="flex-1 mx-6 relative flex items-center">
            <div className="w-full h-0.5 bg-slate-600 relative">
              {/* Animated progress bar */}
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {/* Moving train dot - outside to prevent clipping */}
            <div 
              className="absolute w-6 h-6 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 border-4 border-slate-800 transition-all duration-1000 ease-linear z-10"
              style={{ left: `${progress}%`, transform: `translateX(-50%)` }}
            >
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
            </div>
          </div>

          {/* Destination Station */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="text-emerald-500">
              <i className="bi bi-train-front text-3xl"></i>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">{train.destination || 'Final Stop'}</h3>
              <div className="text-sm">
                <p className="text-xs text-blue-400 font-semibold mb-0.5">Arrival</p>
                {train.arrivalTime ? (
                  <>
                    <p className="text-xs text-gray-500">{formatDateTime(train.arrivalTime).date}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-gray-400 font-medium">
                        {formatDateTime(train.arrivalTime).time}
                      </span>
                      {train.delayMinutes > 0 && (
                        <span className="text-orange-400 font-semibold text-xs">
                          +{train.delayMinutes}m
                        </span>
                      )}
                    </div>
                  </>
                ) : train.delayMinutes > 0 ? (
                  <span className="text-orange-400 font-semibold">+{train.delayMinutes}m delay</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">On Time</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider with dashed line */}
      <div className="relative my-4">
        <div className="border-t border-dashed border-slate-700/50"></div>
      </div>

      {/* Next Station Info */}
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Next Station</p>
            <p className="text-2xl font-bold text-white mb-2">
              {train.destination || train.stationName}
            </p>
            <div className="flex items-center gap-3">
              {train.delayMinutes > 0 ? (
                <span className="text-orange-400 font-semibold">Delayed by {train.delayMinutes}mins</span>
              ) : (
                <span className="text-emerald-400 font-semibold">On Time</span>
              )}
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">Platform {train.platform}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Updated</p>
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="text-sm font-medium">Just now</span>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className={`text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50 ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh train data"
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Train Name & Number with Favorite */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div>
          <h4 className="text-lg font-bold text-white">{train.trainName}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Train #{train.trainNumber}</span>
            {train.city && (
              <>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1">
                  <i className="bi bi-building text-xs"></i>
                  {train.city}
                </span>
              </>
            )}
          </div>
        </div>
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="group/fav hover:scale-110 transition-transform disabled:opacity-50"
            title={isFavorite ? 'Remove from saved trains' : 'Save this train'}
          >
            <i className={`bi ${isFavorite ? 'bi-bookmark-star-fill text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bi-bookmark text-gray-400 group-hover/fav:text-yellow-400'} text-2xl`}></i>
          </button>
        )}
      </div>

      {/* Reroute Information */}
      {rerouteData && rerouteData.rerouteRequired && (
        <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <p className="text-sm text-orange-400 font-semibold mb-3 flex items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            Alternative trains available
          </p>
          {(rerouteData.sameStationAlternatives?.length > 0 || rerouteData.nearbyStationAlternatives?.length > 0) ? (
            <div className="space-y-2">
              {[...(rerouteData.sameStationAlternatives || []), ...(rerouteData.nearbyStationAlternatives || [])].slice(0, 3).map((alt: any) => (
                <div key={alt.trainId} className="bg-slate-800/70 p-3 rounded-lg border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{alt.trainName}</p>
                      <p className="text-xs text-gray-400">Train #{alt.trainNumber}</p>
                    </div>
                    <StatusBadge status={alt.status} delayMinutes={alt.delayMinutes} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span className="flex items-center gap-1">
                      <i className="bi bi-geo-alt-fill text-emerald-400"></i>
                      {alt.stationName}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1">
                      <i className="bi bi-signpost text-emerald-400"></i>
                      Platform {alt.platform}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1">
                      <i className="bi bi-clock text-emerald-400"></i>
                      {formatTime(alt.departureTime)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No suitable alternatives found. Check nearby stations.</p>
          )}
        </div>
      )}
    </div>
  );
}
