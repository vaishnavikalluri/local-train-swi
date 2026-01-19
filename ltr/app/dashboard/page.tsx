'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import EmergencyButton from '../components/EmergencyButton';
import TrainCard from '../components/TrainCard';
import LoadingSpinner from '../components/LoadingSpinner';

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
  isFavorite: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [trains, setTrains] = useState<Train[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<Train[]>([]);
  const [stations, setStations] = useState<{ name: string; city: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [rerouteData, setRerouteData] = useState<Record<string, any>>({});
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmergencyConfirmation, setShowEmergencyConfirmation] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('userName');

    console.log('Dashboard - userName from localStorage:', name);

    if (!token || role !== 'user') {
      router.push('/unauthorized');
      return;
    }

    setUserName(name || 'User');
    fetchTrains();
    
    // Check if emergency was just submitted
    const emergencySubmitted = localStorage.getItem('emergencySubmitted');
    if (emergencySubmitted === 'true') {
      setShowEmergencyConfirmation(true);
      localStorage.removeItem('emergencySubmitted');
      // Auto-hide after 8 seconds
      setTimeout(() => setShowEmergencyConfirmation(false), 8000);
    }
  }, [router]);

  const fetchTrains = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch trains, favorites, and all stations in parallel
      const [trainsRes, favoritesRes, stationsRes] = await Promise.all([
        fetch('/api/trains', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/users/favorites', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/stations')
      ]);

      if (!trainsRes.ok) throw new Error('Failed to fetch trains');

      const trainsData = await trainsRes.json();
      const favoritesData = favoritesRes.ok ? await favoritesRes.json() : { favorites: [] };
      const stationsData = stationsRes.ok ? await stationsRes.json() : { stations: [] };

      // Create a set of favorite train IDs for quick lookup
      const favoriteIds = new Set(
        favoritesData.favorites?.map((f: any) => f._id?.toString() || f) || []
      );

      // Mark trains as favorites
      const trainsWithFavorites = trainsData.trains.map((train: Train) => ({
        ...train,
        isFavorite: favoriteIds.has(train._id.toString()),
      }));

      setTrains(trainsWithFavorites);
      setFilteredTrains(trainsWithFavorites);

      // Use stations from the stations API endpoint
      setStations(stationsData.stations || []);
      
      // Set available cities from the stations API
      setCities(stationsData.cities || []);

      // Fetch reroute data for delayed/cancelled trains
      fetchRerouteData(trainsWithFavorites);
    } catch (error) {
      console.error('Error fetching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRerouteData = async (trainList: Train[]) => {
    const token = localStorage.getItem('token');
    const delayedTrains = trainList.filter(
      (t) => t.status === 'cancelled' || t.delayMinutes > 0
    );

    const reroutePromises = delayedTrains.map(async (train) => {
      try {
        const res = await fetch(`/api/trains/${train._id}/reroutes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          return { trainId: train._id, data };
        }
      } catch (error) {
        console.error(`Error fetching reroute for ${train._id}:`, error);
      }
      return null;
    });

    const results = await Promise.all(reroutePromises);
    const rerouteMap: Record<string, any> = {};
    results.forEach((result) => {
      if (result) {
        rerouteMap[result.trainId] = result.data;
      }
    });

    setRerouteData(rerouteMap);
  };

  const handleStationFilter = (station: string) => {
    setSelectedStation(station);
    applyFilters(station, selectedCity, searchQuery);
  };

  const handleCityFilter = (city: string) => {
    setSelectedCity(city);
    // Reset station filter when city changes
    setSelectedStation('all');
    applyFilters('all', city, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(selectedStation, selectedCity, query);
  };

  const applyFilters = (station: string, city: string, search: string) => {
    let filtered = trains;

    // Apply city filter first
    if (city !== 'all') {
      filtered = filtered.filter((t) => t.city === city);
    }

    // Apply station filter
    if (station !== 'all') {
      filtered = filtered.filter((t) => t.stationName === station);
    }

    // Apply search filter
    if (search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.trainName.toLowerCase().includes(searchLower) ||
          t.trainNumber.toLowerCase().includes(searchLower) ||
          t.stationName.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTrains(filtered);
  };

  const handleFavoriteToggle = async (trainId: string, isFavorite: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const method = isFavorite ? 'POST' : 'DELETE';
      const res = await fetch(`/api/users/favorites/${trainId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Clone response to be able to read it multiple times
      const resClone = res.clone();

      if (!res.ok) {
        let errorMessage = 'Failed to update favorite';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Favorite toggle failed:', res.status, errorData);
        } catch (e) {
          // Response wasn't JSON, try text
          try {
            const text = await resClone.text();
            console.error('Favorite toggle failed (non-JSON):', res.status, text);
            errorMessage = `Error ${res.status}: ${text || 'Unknown error'}`;
          } catch (e2) {
            console.error('Favorite toggle failed (no body):', res.status);
            errorMessage = `Error ${res.status}`;
          }
        }
        throw new Error(errorMessage);
      }

      // Update local state
      setTrains((prev) =>
        prev.map((t) => (t._id === trainId ? { ...t, isFavorite } : t))
      );

      setFilteredTrains((prev) =>
        prev.map((t) => (t._id === trainId ? { ...t, isFavorite } : t))
      );
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      alert(error.message || 'Failed to update favorite');
      // Revert the UI change by refetching
      fetchTrains();
    }
  };

  const handleRefreshTrain = async (trainId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch updated train data
      const trainsRes = await fetch('/api/trains', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!trainsRes.ok) throw new Error('Failed to refresh train data');

      const trainsData = await trainsRes.json();
      const updatedTrain = trainsData.trains.find((t: Train) => t._id === trainId);

      if (updatedTrain) {
        // Preserve favorite status
        const currentTrain = trains.find(t => t._id === trainId);
        updatedTrain.isFavorite = currentTrain?.isFavorite || false;

        // Update both trains and filteredTrains
        setTrains(prev => prev.map(t => t._id === trainId ? updatedTrain : t));
        setFilteredTrains(prev => prev.map(t => t._id === trainId ? updatedTrain : t));

        // Refresh reroute data if train is delayed
        if (updatedTrain.delayMinutes > 0 || updatedTrain.status === 'cancelled') {
          const rerouteRes = await fetch(`/api/trains/${trainId}/reroutes`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (rerouteRes.ok) {
            const rerouteInfo = await rerouteRes.json();
            setRerouteData(prev => ({ ...prev, [trainId]: rerouteInfo }));
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing train:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Confirmation Banner */}
        {showEmergencyConfirmation && (
          <div className="mb-6 glass-card border border-green-500/30 text-green-400 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <i className="bi bi-check-circle-fill text-2xl"></i>
              <div>
                <p className="font-bold">Emergency Alert Sent Successfully!</p>
                <p className="text-sm text-green-300">Station staff have been notified and will assist you shortly.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <i className="bi bi-person-circle text-blue-500"></i>
              Welcome, {userName}!
            </h1>
            <p className="text-gray-400">Track your trains and get real-time updates</p>
          </div>
          <EmergencyButton variant="inline" />
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by train name, number, or station..."
                  className="w-full pl-4 pr-4 py-3.5 glass-card border border-slate-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-300 whitespace-nowrap flex items-center gap-1.5">
                <i className="bi bi-geo-alt"></i>
                City:
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityFilter(e.target.value)}
                className="px-4 py-3.5 glass-card border border-slate-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white min-w-[180px]"
              >
                <option value="all" className="bg-slate-800">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city} className="bg-slate-800">
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Station Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-300 whitespace-nowrap flex items-center gap-1.5">
                <i className="bi bi-funnel"></i>
                Station:
              </label>
              <select
                value={selectedStation}
                onChange={(e) => handleStationFilter(e.target.value)}
                className="px-4 py-3.5 glass-card border border-slate-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white min-w-[180px]"
                disabled={selectedCity !== 'all'}
              >
                <option value="all" className="bg-slate-800">All Stations</option>
                {stations
                  .filter(station => selectedCity === 'all' || station.city === selectedCity)
                  .map((station) => (
                    <option key={station.name} value={station.name} className="bg-slate-800">
                      {station.name} {station.city && `(${station.city})`}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Header with View Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <i className="bi bi-train-front text-blue-500"></i>
              Live Train Updates
            </h2>
            {(searchQuery || selectedStation !== 'all' || selectedCity !== 'all') && (
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                <i className="bi bi-check-circle text-blue-400"></i>
                Showing {filteredTrains.length} of {trains.length} trains
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            )}
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 glass-card border border-slate-600/50 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Grid View"
            >
              <i className="bi bi-grid-3x3-gap"></i>
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="List View"
            >
              <i className="bi bi-list-ul"></i>
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {filteredTrains.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <i className="bi bi-inbox text-5xl text-gray-500 mb-4 block"></i>
            <p className="text-gray-400 text-lg">
              {selectedStation !== 'all'
                ? `No trains available from ${selectedStation} station`
                : searchQuery
                ? 'No trains found matching your search'
                : 'No trains found'}
            </p>
            {(searchQuery || selectedStation !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStation('all');
                  setFilteredTrains(trains);
                }}
                className="mt-4 glass-card px-4 py-2 rounded-lg text-blue-400 hover:text-blue-300 font-semibold border border-blue-500/30 hover:border-blue-500 transition-all"
              >
                <i className="bi bi-arrow-counterclockwise mr-1.5"></i>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={`transition-all duration-300 ${viewMode === 'grid' 
            ? 'grid md:grid-cols-2 gap-6' 
            : 'flex flex-col gap-4'}`}>
            {filteredTrains.map((train) => (
              <TrainCard
                key={train._id}
                train={train}
                onFavoriteToggle={handleFavoriteToggle}
                onRefresh={handleRefreshTrain}
                showFavorite={true}
                rerouteData={rerouteData[train._id]}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
