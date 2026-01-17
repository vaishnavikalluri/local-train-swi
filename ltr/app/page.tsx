import Navbar from './components/Navbar';
import EmergencyButton from './components/EmergencyButton';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <EmergencyButton />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <div>
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Local Train & <br />Re-routes System
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Stay updated with live local train status, delays, and get instant reroute suggestions
              when your train is delayed or cancelled. Never miss a connection again.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 inline-flex items-center gap-2"
              >
                Get Started Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="bg-slate-800 text-white px-8 py-4 rounded-lg text-lg font-semibold border border-slate-700 hover:bg-slate-700 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right: Train Animation */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-96 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden shadow-2xl border border-slate-700">
              
              {/* Starting Station */}
              <div className="absolute top-8 left-4 flex flex-col items-center z-20">
                <div className="relative text-4xl">📍</div>
                <div className="mt-2 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  Boarding Point
                </div>
              </div>
              
              {/* Ending Station */}
              <div className="absolute bottom-4 right-8 flex flex-col items-center z-20">
                <div className="relative text-4xl">📍</div>
                <div className="mt-2 px-3 py-1 bg-rose-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  Destination
                </div>
              </div>
              
              {/* Animated Route Path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M 15 15 Q 40 30, 50 50 Q 60 70, 85 85"
                  stroke="url(#gradient)"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="4,4"
                  opacity="0.6"
                  strokeLinecap="round"
                  className="animate-dash"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Animated Train */}
              <div className="absolute w-full h-full">
                <div className="train-route-journey">
                  <div className="text-5xl">🚂</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-5xl font-bold text-center text-white mb-16">
          Why Choose LTR?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="text-5xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold text-white mb-3">Real-Time Updates</h3>
            <p className="text-gray-400 leading-relaxed">
              Get instant notifications about train delays, cancellations, and platform changes.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="text-5xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Rerouting</h3>
            <p className="text-gray-400 leading-relaxed">
              Automatic alternative train suggestions when delays exceed 15 minutes.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-white mb-3">Favorite Trains</h3>
            <p className="text-gray-400 leading-relaxed">
              Save your frequent trains for quick access and track their status easily.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="text-5xl mb-4">🚨</div>
            <h3 className="text-xl font-bold text-white mb-3">Emergency Alerts</h3>
            <p className="text-gray-400 leading-relaxed">
              Report emergencies instantly with detailed location and train information.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">Management Dashboard</h3>
            <p className="text-gray-400 leading-relaxed">
              Station managers can update train status and manage schedules efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-5xl font-bold text-center text-white mb-16">
          Built For Everyone
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-xl font-bold text-white mb-3">Passengers</h3>
            <p className="text-gray-400 leading-relaxed">
              Track trains, save your regular routes, and get reroute suggestions for your daily commute.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="text-5xl mb-4">🧑‍✈️</div>
            <h3 className="text-xl font-bold text-white mb-3">Station Managers</h3>
            <p className="text-gray-400 leading-relaxed">
              Manage train schedules, update status, and keep passengers informed in real-time.
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="text-5xl mb-4">🧑‍💼</div>
            <h3 className="text-xl font-bold text-white mb-3">Administrators</h3>
            <p className="text-gray-400 leading-relaxed">
              Oversee the entire system, manage users and station managers efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-16 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">🚆 LTR</h3>
              <p className="text-gray-400 leading-relaxed">
                Your trusted companion for local train tracking and smart rerouting solutions.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-gray-400 hover:text-blue-400 transition">Login</Link></li>
                <li><Link href="/signup" className="text-gray-400 hover:text-blue-400 transition">Sign Up</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-blue-400 transition">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@ltr.com</li>
                <li>+91 1800-XXX-XXXX</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2026 LTR - Local Train & Re-routes System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
