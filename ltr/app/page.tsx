'use client';

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
                className="glass-card bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2 border border-blue-500/50"
              >
                <i className="bi bi-rocket-takeoff"></i>
                Get Started Free
                <i className="bi bi-arrow-right"></i>
              </Link>
              <Link
                href="/login"
                className="glass-card text-white px-8 py-4 rounded-xl text-lg font-bold border border-slate-600 hover:border-blue-500 transition-colors"
              >
                <i className="bi bi-box-arrow-in-right mr-2"></i>
                Sign In
              </Link>
            </div>
          </div>

          {/* Right: Simple Railway Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-96 rounded-2xl glass-card overflow-hidden shadow-2xl border border-slate-700/50 p-8">
              
              {/* Station A - Top Left */}
              <div className="absolute top-12 left-12 flex flex-col items-center z-20">
                <div className="w-24 h-24 bg-emerald-600  rounded-sm shadow-xl border-2 border-emerald-400 flex items-center justify-center">
                  <i className="bi bi-building text-4xl text-white"></i>
                </div>
                <div className="mt-3 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-sm shadow-lg">
                  Station A
                </div>
              </div>
              
              {/* Station B - Bottom Right */}
              <div className="absolute bottom-12 right-12 flex flex-col items-center z-20">
                <div className="mb-3 px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-sm shadow-lg">
                  Station B
                </div>
                <div className="w-24 h-24 bg-rose-600 rounded-sm shadow-xl border-2 border-rose-400 flex items-center justify-center">
                  <i className="bi bi-building text-4xl text-white"></i>
                </div>
              </div>
              
              {/* Railway Tracks */}
              <div className="absolute inset-0">
                {/* Track 1 - Upper horizontal */}
                <div className="absolute top-28 left-35 right-0" style={{ height: '24px' }}>
                  {/* Upper Rail */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 shadow-md" />
                  {/* Lower Rail */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 shadow-md" />
                  {/* Sleepers (horizontal bars crossing both rails) */}
                  <div className="absolute -inset-1 flex justify-around">
                    {[...Array(20)].map((_, i) => (
                      <div key={`sleeper1-${i}`} className="w-2 h-8 bg-amber-800/80" />
                    ))}
                  </div>
                </div>

                {/* Track 2 - Lower horizontal */}
                <div className="absolute bottom-14 left-0 right-35" style={{ height: '24px' }}>
                  {/* Upper Rail */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-500 rounded-sm shadow-md" />
                  {/* Lower Rail */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-500 rounded-sm shadow-md" />
                  {/* Sleepers (horizontal bars crossing both rails) */}
                  <div className="absolute -inset-1 flex justify-around">
                    {[...Array(20)].map((_, i) => (
                      <div key={`sleeper2-${i}`} className="w-2 h-8 bg-amber-800/80" />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Animated Trains */}
              <div className="absolute w-20 h-10 rounded-sm shadow-lg border-2 border-yellow-200 train-animate-right" style={{ top: '105px', left: '140px' }}>
                <i className="bi bi-train-front text-2xl text-yellow-900 flex items-center justify-center h-full"></i>
              </div>
              <div className="absolute w-20 h-10 rounded-sm shadow-lg border-2 border-orange-200 train-animate-left" style={{ bottom: '50px', right: '140px' }}>
                <i className="bi bi-train-front text-2xl text-orange-900 flex items-center justify-center h-full"></i>
              </div>
              
              {/* Info Labels */}
              <div className="absolute top-4 left-4 text-xs text-gray-400 font-medium flex items-center gap-2">
                <i className="bi bi-lightning-fill text-green-400"></i>
                Live Train Tracking
              </div>
              <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium flex items-center gap-2">
                <i className="bi bi-arrow-repeat text-blue-400"></i>
                Smart Rerouting
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
          <div className="glass-card rounded-xl p-8 hover:border-blue-400/50 transition-colors">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <i className="bi bi-clock-history text-3xl text-blue-400"></i>
              Real-Time Tracking
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <i className="bi bi-check-circle-fill text-blue-400 mt-1 flex-shrink-0"></i>
                <span><strong>Live Updates:</strong> Get instant notifications about train delays, cancellations, and platform changes</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="bi bi-check-circle-fill text-blue-400 mt-1 flex-shrink-0"></i>
                <span><strong>Live Monitoring:</strong> Continuous tracking of all trains with real-time status updates</span>
              </li>
            </ul>
          </div>

          {/* Box 2 */}
          <div className="glass-card rounded-xl p-8 hover:border-blue-400/50 transition-colors">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <i className="bi bi-arrow-left-right text-3xl text-blue-400"></i>
              Smart Rerouting
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <i className="bi bi-check-circle-fill text-blue-400 mt-1 flex-shrink-0"></i>
                <span><strong>Automatic Suggestions:</strong> Alternative train routes when delays exceed 15 minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="bi bi-check-circle-fill text-blue-400 mt-1 flex-shrink-0"></i>
                <span><strong>Intelligent Algorithm:</strong> Reroute calculation based on station connectivity and train availability</span>
              </li>
            </ul>
          </div>

          {/* Box 3 */}
          <div className="glass-card rounded-xl p-8 hover:border-blue-400/50 transition-colors">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <i className="bi bi-bookmark-star-fill text-3xl text-blue-400"></i>
              Personalization & Alerts
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <i className="bi bi-check-circle-fill text-blue-400 mt-1 flex-shrink-0"></i>
                <span><strong>Favorite Trains:</strong> Save frequent trains for quick access and priority notifications</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="bi bi-check-circle-fill text-blue-400 mt-1 flex-shrink-0"></i>
                <span><strong>Emergency Response:</strong> One-tap to open form, fill in emergency details, and station managers are instantly notified with action taken ASAP</span>
              </li>
            </ul>
          </div>

          {/* Box 4 */}
          <div className="glass-card rounded-xl p-8 hover:border-blue-400/50 transition-colors">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <i className="bi bi-gear-fill text-3xl text-blue-400"></i>
              Management System
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <i className="bi bi-check-circle-fill text-blue-400 mt-1 flex-shrink-0"></i>
                <span><strong>Dashboard:</strong> Station managers can update multiple trains and handle alerts efficiently</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="bi bi-check-circle-fill text-blue-400 mt-1 flex-shrink-0"></i>
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
            <div className="glass-card p-8 rounded-xl hover:border-blue-500 transition-colors h-full">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                1
              </div>
              <i className="bi bi-person-plus-fill text-5xl mb-4 mt-2 text-blue-400 block"></i>
              <h3 className="text-xl font-bold text-white mb-3">Sign Up</h3>
              <p className="text-gray-400 leading-relaxed">
                Create your free account in seconds. No credit card required, just your email and you're ready to go.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="glass-card p-8 rounded-xl hover:border-blue-500 transition-colors h-full">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                2
              </div>
              <i className="bi bi-clock-history text-5xl mb-4 mt-2 text-blue-400 block"></i>
              <h3 className="text-xl font-bold text-white mb-3">Track Trains</h3>
              <p className="text-gray-400 leading-relaxed">
                View real-time status of all trains. Get instant updates on delays, cancellations, and platform changes.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="glass-card p-8 rounded-xl hover:border-blue-500 transition-colors h-full">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                3
              </div>
              <i className="bi bi-arrow-left-right text-5xl mb-4 mt-2 text-blue-400 block"></i>
              <h3 className="text-xl font-bold text-white mb-3">Get Reroutes</h3>
              <p className="text-gray-400 leading-relaxed">
                When delays exceed 15 minutes, receive smart alternative train suggestions automatically.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative">
            <div className="glass-card p-8 rounded-xl hover:border-blue-500 transition-colors h-full">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                4
              </div>
              <i className="bi bi-bell text-5xl mb-4 mt-2 text-blue-400 block"></i>
              <h3 className="text-xl font-bold text-white mb-3">Stay Updated</h3>
              <p className="text-gray-400 leading-relaxed">
                Get instant notifications for your favorite trains and never miss important updates.
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
          {/* Passengers */}
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <i className="bi bi-person-fill text-6xl text-blue-400"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Passengers</h3>
            <p className="text-gray-400 leading-relaxed">
              Track trains, save your regular routes, and get reroute suggestions for your daily commute.
            </p>
          </div>
          {/* Station Managers */}
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-green-500 transition-colors text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <i className="bi bi-people-fill text-6xl text-green-400"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Station Managers</h3>
            <p className="text-gray-400 leading-relaxed">
              Manage train schedules, update status, and keep passengers informed in real-time.
            </p>
          </div>
          {/* Administrators */}
          <div className="bg-slate-800/50 backdrop-blur p-8 rounded-xl border border-slate-700 hover:border-purple-500 transition-colors text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <i className="bi bi-shield-fill-check text-6xl text-purple-400"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Administrators</h3>
            <p className="text-gray-400 leading-relaxed">
              Oversee the entire system, manage users and station managers efficiently.
            </p>
          </div>
        </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950/80 backdrop-blur border-t border-slate-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <i className="bi bi-train-front-fill text-4xl text-blue-500"></i>
                <h3 className="text-2xl font-bold text-white">Local Train Re-routes</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Your trusted companion for local train tracking and smart rerouting solutions.
                Never miss a connection with real-time updates and intelligent route suggestions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg -ml-10 font-bold text-white mb-4 flex items-center gap-2">
                <i className="bi bi-link-45deg"></i>
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Contact */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <i className="bi bi-headset"></i>
                Support
              </h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <i className="bi bi-envelope-fill text-blue-400"></i>
                  <a href="mailto:support@ltr.com" className="hover:text-blue-400 transition-colors">
                    support@ltr.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="bi bi-telephone-fill text-green-400"></i>
                  <span>+91 1800-XXX-XXXX</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="bi bi-clock-fill text-yellow-400"></i>
                  <span>Available 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-red-400"></i>
                  <span>Chittoor, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Local Train Re-routes System. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
