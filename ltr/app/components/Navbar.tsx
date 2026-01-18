"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");

      if (!token || !role) {
        console.log("Navbar: No auth data in localStorage");
        setUser(null);
        setIsLoading(false);
        return;
      }

      // First, set user from localStorage immediately for instant display
      if (userName && userEmail) {
        console.log("Navbar: Loading from localStorage:", {
          role,
          userName,
          userEmail,
        });
        setUser({
          role: role,
          name: userName,
          email: userEmail,
        });
        setIsLoading(false);
      } else {
        // Fallback: Try to fetch from API
        console.log("Navbar: Fetching from API...");
        const res = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Navbar: API data received:", data);
          setUser({
            role: data.role,
            name: data.name,
            email: data.email,
          });
          // Update localStorage for next time
          localStorage.setItem("userName", data.name);
          localStorage.setItem("userEmail", data.email);
        } else {
          console.error("Navbar: API failed, clearing auth");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userName");
          localStorage.removeItem("userEmail");
          setUser(null);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Navbar: Error:", error);
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [pathname]); // Re-fetch on route change

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUser(null);
    setShowProfileMenu(false);
    window.location.href = "/";
  };

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-slate-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold text-white hover:text-blue-400 transition-colors">
            <i className="bi bi-train-front-fill text-3xl text-indigo-500"></i>
            <span>Local Trains & Re-routes</span>
          </Link>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <i className="bi bi-arrow-repeat animate-spin text-blue-500 text-xl"></i>
              </div>
            ) : !user ? (
              <>
                {pathname !== "/" && (
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800/50 transition-all"
                  >
                    <i className="bi bi-house-door"></i>
                    Home
                  </Link>
                )}
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800/50 transition-colors"
                >
                  <i className="bi bi-box-arrow-in-right"></i>
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold transition-colors"
                >
                  <i className="bi bi-person-plus"></i>
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {user.role === "user" && (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800/50 transition-colors"
                    >
                      <i className="bi bi-speedometer2"></i>
                      Dashboard
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800/50 transition-colors"
                    >
                      <i className="bi bi-bookmark-star-fill"></i>
                      Favorites
                    </Link>
                  </>
                )}
                {user.role === "station_manager" && (
                  <>
                    <Link
                      href="/station-manager/dashboard"
                      className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800/50 transition-colors"
                    >
                      <i className="bi bi-speedometer2"></i>
                      Dashboard
                    </Link>
                    <Link
                      href="/station-manager/trains"
                      className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800/50 transition-colors"
                    >
                      <i className="bi bi-train-front-fill"></i>
                      Trains
                    </Link>
                    <Link
                      href="/station-manager/emergency-alerts"
                      className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800/50 transition-colors"
                    >
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      Alerts
                    </Link>
                  </>
                )}
                {user.role === "super_admin" && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800/50 transition-colors"
                    >
                      <i className="bi bi-speedometer2"></i>
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/station-managers"
                      className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800/50 transition-colors"
                    >
                      <i className="bi bi-people-fill"></i>
                      Managers
                    </Link>
                    <Link
                      href="/admin/users"
                      className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800/50 transition-colors"
                    >
                      <i className="bi bi-person-lines-fill"></i>
                      Users
                    </Link>
                  </>
                )}

                {/* Profile Display with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-white">
                      {user.name}
                    </span>
                    <i className="bi bi-chevron-down text-gray-400"></i>
                  </button>

                  {/* Dropdown Menu - Role and Email */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-80 glass-card rounded-lg shadow-2xl border border-slate-700/50 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <i className="bi bi-shield-check"></i>
                          Role
                        </p>
                        <p className="text-sm text-white font-semibold capitalize">
                          {user.role === "super_admin"
                            ? "Super Admin"
                            : user.role.replace("_", " ")}
                        </p>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <i className="bi bi-envelope"></i>
                          Email Address
                        </p>
                        <p className="text-sm text-white font-medium break-words">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 font-medium text-red-400 hover:text-white hover:bg-red-600/90 rounded-lg transition-colors border border-red-500/50 hover:border-red-500"
                >
                  <i className="bi bi-box-arrow-right"></i>
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
