'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserProfile {
  role: string;
  name: string;
  email: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [pathname]); // Re-fetch on route change

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');

      if (!token || !role) {
        console.log('Navbar: No auth data in localStorage');
        setUser(null);
        setIsLoading(false);
        return;
      }

      // First, set user from localStorage immediately for instant display
      if (userName && userEmail) {
        console.log('Navbar: Loading from localStorage:', { role, userName, userEmail });
        setUser({
          role: role,
          name: userName,
          email: userEmail,
        });
        setIsLoading(false);
      } else {
        // Fallback: Try to fetch from API
        console.log('Navbar: Fetching from API...');
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          console.log('Navbar: API data received:', data);
          setUser({
            role: data.role,
            name: data.name,
            email: data.email,
          });
          // Update localStorage for next time
          localStorage.setItem('userName', data.name);
          localStorage.setItem('userEmail', data.email);
        } else {
          console.error('Navbar: API failed, clearing auth');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          setUser(null);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Navbar: Error:', error);
      setUser(null);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setUser(null);
    setShowProfileMenu(false);
    window.location.href = '/';
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-semibold text-white">
            🚆 LTR
          </Link>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : !user ? (
              <>
                {pathname !== '/' && (
                  <Link
                    href="/"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Home
                  </Link>
                )}
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {user.role === 'user' && (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/favorites"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Saved Trains
                    </Link>
                  </>
                )}
                {user.role === 'station_manager' && (
                  <>
                    <Link
                      href="/station-manager/dashboard"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/station-manager/trains"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Manage Trains
                    </Link>
                  </>
                )}
                {user.role === 'super_admin' && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/station-managers"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Managers
                    </Link>
                    <Link
                      href="/admin/users"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Users
                    </Link>
                  </>
                )}
                
                {/* Profile Display with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {user.name}
                    </span>
                  </button>

                  {/* Dropdown Menu - Only Email */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50">
                      <div className="px-4 py-3">
                        <p className="text-xs text-gray-400 mb-1">Email Address</p>
                        <p className="text-sm text-white font-medium break-words">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700 hover:border-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  );
}
