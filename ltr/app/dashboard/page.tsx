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
  const [stations, setStations] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [rerouteData, setRerouteData] = useState<Record<string, any>>({});
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmergencyConfirmation, setShowEmergencyConfirmation] = useState(false);

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
    applyFilters(station, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(selectedStation, query);
  };

  const applyFilters = (station: string, search: string) => {
    let filtered = trains;

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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Confirmation Banner */}
        {showEmergencyConfirmation && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">Emergency Alert Sent Successfully!</p>
                <p className="text-sm text-green-300">Station staff have been notified and will assist you shortly.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, {userName}!
            </h1>
            <p className="text-gray-400">Track your trains and get real-time updates</p>
          </div>
          <EmergencyButton variant="inline" />
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by train name, number, or station..."
                className="w-full pl-4 pr-12 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-0 text-white placeholder-gray-400"
              />
              <svg
                className="absolute right-6 top-3 h-5 w-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </div>

          {/* Station Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
              Filter by Station:
            </label>
            <select
              value={selectedStation}
              onChange={(e) => handleStationFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-0 text-white"
            >
              <option value="all">All Stations</option>
              {stations.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        {(searchQuery || selectedStation !== 'all') && (
          <div className="mb-6 text-sm text-gray-400">
            Showing {filteredTrains.length} of {trains.length} trains
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}

        <h2 className="text-2xl font-semibold text-white mb-6">Here are the train details</h2>

        {filteredTrains.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700">
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
                className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrains.map((train) => (
              <TrainCard
                key={train._id}
                train={train}
                onFavoriteToggle={handleFavoriteToggle}
                showFavorite={true}
                rerouteData={rerouteData[train._id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
