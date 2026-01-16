'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
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
  }, [router]);

  const fetchTrains = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch trains and favorites in parallel
      const [trainsRes, favoritesRes] = await Promise.all([
        fetch('/api/trains', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/users/favorites', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!trainsRes.ok) throw new Error('Failed to fetch trains');

      const trainsData = await trainsRes.json();
      const favoritesData = favoritesRes.ok ? await favoritesRes.json() : { favorites: [] };

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

      // Extract unique stations
      const uniqueStations = Array.from(
        new Set(trainsWithFavorites.map((t: Train) => t.stationName))
      );
      setStations(uniqueStations as string[]);

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
      (t) => t.status === 'cancelled' || t.delayMinutes > 15
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

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by train name, number, or station..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Station Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter by Station:
              </label>
              <select
                value={selectedStation}
                onChange={(e) => handleStationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredTrains.length} of {trains.length} trains
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {userName}!
          </h1>
          <p className="text-gray-600">Track your trains and get real-time updates</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by train name, number, or station..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Station Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter by Station:
              </label>
              <select
                value={selectedStation}
                onChange={(e) => handleStationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredTrains.length} of {trains.length} trains
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Train Dashboard</h2>

        {filteredTrains.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">
              {searchQuery || selectedStation !== 'all'
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
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
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
