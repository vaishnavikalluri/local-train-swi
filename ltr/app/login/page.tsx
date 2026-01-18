'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched({ ...touched, [field]: true });
    if (field === 'email') {
      setValidationErrors({ ...validationErrors, email: validateEmail(formData.email) });
    } else if (field === 'password') {
      setValidationErrors({ ...validationErrors, password: validatePassword(formData.password) });
    }
  };

  const handleChange = (field: 'email' | 'password', value: string) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field]) {
      if (field === 'email') {
        setValidationErrors({ ...validationErrors, email: validateEmail(value) });
      } else if (field === 'password') {
        setValidationErrors({ ...validationErrors, password: validatePassword(value) });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setValidationErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('Login response:', data);
      console.log('User name from API:', data.user?.name);

      // Store token, role, and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userName', data.user?.name || 'User');
      localStorage.setItem('userEmail', data.user?.email || '');

      console.log('Stored userName in localStorage:', data.user?.name);
      console.log('Stored userEmail in localStorage:', data.user?.email);

      // Redirect based on role and force a full page refresh
      if (data.role === 'user') {
        window.location.href = '/dashboard';
      } else if (data.role === 'station_manager') {
        window.location.href = '/station-manager/dashboard';
      } else if (data.role === 'super_admin') {
        window.location.href = '/admin/dashboard';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <i className="bi bi-train-front-fill text-4xl"></i>
            <span className="text-2xl font-bold">Local Train Re-routes</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Welcome Back to Smart Train Tracking
          </h1>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Sign in to access real-time train updates, smart rerouting suggestions, and personalized notifications.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-50">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <i className="bi bi-lightning-fill text-2xl"></i>
              </div>
              <span className="text-lg">Real-time train tracking</span>
            </div>
            <div className="flex items-center gap-3 text-blue-50">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <i className="bi bi-arrow-repeat text-2xl"></i>
              </div>
              <span className="text-lg">Instant reroute suggestions</span>
            </div>
            <div className="flex items-center gap-3 text-blue-50">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <i className="bi bi-bell-fill text-2xl"></i>
              </div>
              <span className="text-lg">Smart notifications</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-blue-100 text-sm">
          © 2026 Local Train Re-routes. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-900 relative">
        {/* Home Button */}
        <Link 
          href="/"
          className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-slate-800/70 backdrop-blur-sm border-2 border-slate-700/50 hover:border-blue-500 hover:bg-blue-500/20 transition-all group"
          title="Go to Home"
        >
          <i className="bi bi-house-fill text-xl text-gray-400 group-hover:text-blue-400 transition-colors"></i>
        </Link>
        
        <motion.div 
          className="w-full max-w-xl"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/" className="lg:hidden flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8">
              <i className="bi bi-arrow-left"></i>
              Back to Home
            </Link>
            <h2 className="text-4xl font-bold text-white mb-3">Sign In</h2>
            <p className="text-gray-400 text-lg">Enter your credentials to access your account</p>
          </motion.div>

          {error && (
            <motion.div 
              className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <i className="bi bi-exclamation-triangle-fill text-xl"></i>
              <span>{error}</span>
            </motion.div>
          )}

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              <label className="block text-base font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <i className="bi bi-envelope-fill text-blue-400 text-lg"></i>
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <i className="bi bi-envelope-fill text-gray-500 text-lg group-focus-within:text-blue-400 transition-colors"></i>
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-14 pr-5 py-4 text-base bg-slate-800/70 backdrop-blur-sm border-2 rounded-2xl focus:outline-none focus:ring-4 text-white placeholder-gray-500 transition-all shadow-inner hover:border-slate-600/50 ${
                    touched.email && validationErrors.email
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-slate-700/50 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                  placeholder="your@email.com"
                />
                {touched.email && validationErrors.email && (
                  <motion.div
                    className="absolute -bottom-6 left-0 text-red-400 text-sm flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <i className="bi bi-exclamation-circle-fill"></i>
                    {validationErrors.email}
                  </motion.div>
                )}
              </div>
            </div>

            <div className='mt-7'>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                <i className="bi bi-lock text-blue-400"></i>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="bi bi-lock-fill text-gray-500"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full pl-12 pr-12 py-3.5 bg-slate-800/70 backdrop-blur-sm border-2 rounded-xl focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all shadow-inner ${
                    touched.password && validationErrors.password
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-700/50 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                  placeholder="••••••••"
                />
                {touched.password && validationErrors.password && (
                  <motion.div
                    className="absolute -bottom-6 left-0 text-red-400 text-sm flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <i className="bi bi-exclamation-circle-fill"></i>
                    {validationErrors.password}
                  </motion.div>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end mt-2">
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1.5"
              >
                Forgot Password
                <i className="bi bi-question-circle text-base"></i>
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] mt-8"
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Sign In
                </>
              )}
            </button>
          </motion.form>

          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-base text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Sign up now
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
