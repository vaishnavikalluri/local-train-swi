import Navbar from './components/Navbar';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Local Train & Re-routes System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stay updated with live local train status, delays, and get instant reroute suggestions
            when your train is delayed or cancelled. Never miss a connection again.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-700 px-8 py-3 rounded-lg text-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose LTR?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
            <p className="text-gray-600">
              Get instant notifications about train delays, cancellations, and platform changes.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Rerouting</h3>
            <p className="text-gray-600">
              Automatic alternative train suggestions when delays exceed 15 minutes.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Trains</h3>
            <p className="text-gray-600">
              Save your frequent trains for quick access and track their status easily.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your free account in seconds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Trains</h3>
              <p className="text-gray-600">View real-time status of all trains</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Alerts</h3>
              <p className="text-gray-600">Receive instant reroute suggestions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Built For Everyone
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Passengers</h3>
            <p className="text-gray-600">
              Track trains, save your regular routes, and get reroute suggestions for your daily commute.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">🧑‍✈️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Station Managers</h3>
            <p className="text-gray-600">
              Manage train schedules, update status, and keep passengers informed in real-time.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">🧑‍💼</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Administrators</h3>
            <p className="text-gray-600">
              Oversee the entire system, manage users and station managers efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2026 LTR - Local Train & Re-routes System. Making commutes easier.
          </p>
        </div>
      </footer>
    </div>
  );
}
