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

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [rerouteData, setRerouteData] = useState<Record<string, any>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'user') {
      router.push('/unauthorized');
      return;
    }

    fetchFavorites();
  }, [router]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch favorites');

      const data = await res.json();
      setFavorites(data.favorites);

      // Fetch reroute data for delayed/cancelled trains
      fetchRerouteData(data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
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

  const handleRemoveFavorite = async (trainId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/favorites/${trainId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to remove favorite');

      setFavorites((prev) => prev.filter((t) => t._id !== trainId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Saved Trains</h1>
          <p className="text-gray-400">Quick access to your favorite trains</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-gray-300 text-lg mb-2">No saved trains yet</p>
            <p className="text-gray-400 text-sm">
              Go to the dashboard and save trains to see them here
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((train) => (
              <TrainCard
                key={train._id}
                train={train}
                onFavoriteToggle={handleRemoveFavorite}
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
