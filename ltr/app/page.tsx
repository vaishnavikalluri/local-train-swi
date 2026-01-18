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
      <section className="bg-slate-800/20 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-bold text-center text-white mb-16">
          Why Choose LTR?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Box 1 */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span>⏱️</span> Real-Time Tracking
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span><strong>Live Updates:</strong> Get instant notifications about train delays, cancellations, and platform changes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span><strong>Live Monitoring:</strong> Continuous tracking of all trains with real-time status updates</span>
              </li>
            </ul>
          </div>

          {/* Box 2 */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span>🔄</span> Smart Rerouting
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span><strong>Automatic Suggestions:</strong> Alternative train routes when delays exceed 15 minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span><strong>Intelligent Algorithm:</strong> Reroute calculation based on station connectivity and train availability</span>
              </li>
            </ul>
          </div>

          {/* Box 3 */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span>⭐</span> Personalization & Alerts
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span><strong>Favorite Trains:</strong> Save frequent trains for quick access and priority notifications</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span><strong>Emergency Response:</strong> One-tap to open form, fill in emergency details, and station managers are instantly notified with action taken ASAP</span>
              </li>
            </ul>
          </div>

          {/* Box 4 */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span>📊</span> Management System
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span><strong>Dashboard:</strong> Station managers can update multiple trains and handle alerts efficiently</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">→</span>
                <span><strong>Delay Detection:</strong> Re-routes are suggested to passengers when trains are delayed 15+ minutes</span>
              </li>
            </ul>
          </div>
        </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-bold text-center text-white mb-16">
          How It Works
        </h2>
      
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="relative">
            <div className="bg-slate-800/70 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all h-full">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                1
              </div>
              <div className="text-5xl mb-4 mt-2">📡</div>
              <h3 className="text-xl font-bold text-white mb-3">Live Tracking</h3>
              <p className="text-gray-400 leading-relaxed">
                Station managers update train status in real-time. Our system monitors delays, cancellations, and schedule changes instantly.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="bg-slate-800/70 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all h-full">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                2
              </div>
              <div className="text-5xl mb-4 mt-2">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-3">Delay Detection</h3>
              <p className="text-gray-400 leading-relaxed">
                When a train is delayed by 15+ minutes, our system automatically identifies affected passengers and their destinations.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="bg-slate-800/70 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all h-full">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                3
              </div>
              <div className="text-5xl mb-4 mt-2">🔄</div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Rerouting</h3>
              <p className="text-gray-400 leading-relaxed">
                Our algorithm calculates alternative routes considering station connectivity and provides the best reroute options instantly.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative">
            <div className="bg-slate-800/70 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-all h-full">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                4
              </div>
              <div className="text-5xl mb-4 mt-2">📲</div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Notifications</h3>
              <p className="text-gray-400 leading-relaxed">
                Passengers receive real-time alerts with alternative train suggestions, schedules, and platform information automatically.
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className="bg-slate-800/20 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
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
