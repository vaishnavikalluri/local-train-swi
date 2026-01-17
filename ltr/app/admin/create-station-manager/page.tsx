'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '../../components/Navbar';

export default function CreateStationManagerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    stationName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'super_admin') {
      router.push('/unauthorized');
      return;
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/station-managers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create station manager');
      }

      setSuccessMessage('Station Manager created successfully!');
      setTimeout(() => {
        router.push('/admin/station-managers');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Create Station Manager</h1>

        {successMessage && (
          <div className="bg-white text-green-700 p-3 rounded-md mb-4 text-sm border border-green-500 relative overflow-hidden">
            {successMessage}
            <div className="absolute bottom-0 left-0 h-1 bg-green-500 animate-[shrink_2s_linear_forwards]" style={{ width: '100%' }}></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 text-red-300 p-3 rounded-md mb-4 text-sm border border-red-500">{error}</div>
        )}

        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white placeholder-gray-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white placeholder-gray-400"
                placeholder="manager@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white placeholder-gray-400"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Station Name
              </label>
              <input
                type="text"
                required
                value={formData.stationName}
                onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:outline-none focus:ring-0 text-white placeholder-gray-400"
                placeholder="Mumbai Central"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Creating...' : 'Create Manager'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/station-managers')}
                className="bg-slate-700 text-gray-300 px-6 py-2 rounded-md hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
