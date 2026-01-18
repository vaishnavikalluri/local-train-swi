'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const validateName = (name: string) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 100) return 'Password is too long';
    return '';
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const handleBlur = (field: 'name' | 'email' | 'password') => {
    setTouched({ ...touched, [field]: true });
    if (field === 'name') {
      setValidationErrors({ ...validationErrors, name: validateName(formData.name) });
    } else if (field === 'email') {
      setValidationErrors({ ...validationErrors, email: validateEmail(formData.email) });
    } else if (field === 'password') {
      setValidationErrors({ ...validationErrors, password: validatePassword(formData.password) });
    }
  };

  const handleChange = (field: 'name' | 'email' | 'password', value: string) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field]) {
      if (field === 'name') {
        setValidationErrors({ ...validationErrors, name: validateName(value) });
      } else if (field === 'email') {
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
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (nameError || emailError || passwordError) {
      setValidationErrors({ name: nameError, email: emailError, password: passwordError });
      setTouched({ name: true, email: true, password: true });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log('Signup response:', data);
      console.log('User name from API:', data.user?.name);

      // Store token, role, and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userName', data.user?.name || 'User');
      localStorage.setItem('userEmail', data.user?.email || '');

      console.log('Stored userName in localStorage:', data.user?.name);
      console.log('Stored userEmail in localStorage:', data.user?.email);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <i className="bi bi-train-front-fill text-4xl"></i>
            <span className="text-2xl font-bold">Local Train Re-routes</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Start Your Journey with Smart Train Tracking
          </h1>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Create your free account and never miss a train again. Get instant alerts, smart reroutes, and personalized tracking.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-50">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <i className="bi bi-check-circle-fill text-2xl"></i>
              </div>
              <span className="text-lg">100% Free forever</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-50">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <i className="bi bi-bookmark-star-fill text-2xl"></i>
              </div>
              <span className="text-lg">Save favorite trains</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-50">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <i className="bi bi-shield-check text-2xl"></i>
              </div>
              <span className="text-lg">Secure & private</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-emerald-100 text-sm">
          © 2026 Local Train Re-routes. All rights reserved.
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-900 relative">
        {/* Home Button */}
        <Link 
          href="/"
          className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-slate-800/70 backdrop-blur-sm border-2 border-slate-700/50 hover:border-emerald-500 hover:bg-emerald-500/20 transition-all group"
          title="Go to Home"
        >
          <i className="bi bi-house-fill text-xl text-gray-400 group-hover:text-emerald-400 transition-colors"></i>
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
            <Link href="/" className="lg:hidden flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8">
              <i className="bi bi-arrow-left"></i>
              Back to Home
            </Link>
            <h2 className="text-4xl font-bold text-white mb-3">Create Account</h2>
            <p className="text-gray-400 text-lg">Join thousands of commuters tracking their trains</p>
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
                <i className="bi bi-person-fill text-emerald-400 text-lg"></i>
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <i className="bi bi-person-fill text-gray-500 text-lg group-focus-within:text-emerald-400 transition-colors"></i>
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full pl-14 pr-5 py-4 text-base bg-slate-800/70 backdrop-blur-sm border-2 rounded-2xl focus:outline-none focus:ring-4 text-white placeholder-gray-500 transition-all shadow-inner hover:border-slate-600/50 ${
                    touched.name && validationErrors.name
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-slate-700/50 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                  placeholder="John Doe"
                />
                {touched.name && validationErrors.name && (
                  <motion.div
                    className="absolute -bottom-6 left-0 text-red-400 text-sm flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <i className="bi bi-exclamation-circle-fill"></i>
                    {validationErrors.name}
                  </motion.div>
                )}
              </div>
            </div>

            <div className='mt-7'>
              <label className="block text-base font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <i className="bi bi-envelope-fill text-emerald-400 text-lg"></i>
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <i className="bi bi-envelope-fill text-gray-500 text-lg group-focus-within:text-emerald-400 transition-colors"></i>
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
                      : 'border-slate-700/50 focus:border-emerald-500 focus:ring-emerald-500/10'
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
              <label className="block text-base font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <i className="bi bi-lock-fill text-emerald-400 text-lg"></i>
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <i className="bi bi-lock-fill text-gray-500 text-lg group-focus-within:text-emerald-400 transition-colors"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full pl-14 pr-14 py-4 text-base bg-slate-800/70 backdrop-blur-sm border-2 rounded-2xl focus:outline-none focus:ring-4 text-white placeholder-gray-500 transition-all shadow-inner hover:border-slate-600/50 ${
                    touched.password && validationErrors.password
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-slate-700/50 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-xl`}></i>
                </button>
              </div>
              {touched.password && validationErrors.password && (
                <motion.div
                  className="text-red-400 text-sm flex items-center gap-1 mt-2"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <i className="bi bi-exclamation-circle-fill"></i>
                  {validationErrors.password}
                </motion.div>
              )}
              {formData.password && !validationErrors.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-400">Password Strength:</span>
                    <span className={`text-sm font-semibold ${
                      getPasswordStrength(formData.password).label === 'Weak' ? 'text-red-400' :
                      getPasswordStrength(formData.password).label === 'Medium' ? 'text-yellow-400' :
                      'text-emerald-400'
                    }`}>
                      {getPasswordStrength(formData.password).label}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getPasswordStrength(formData.password).color} transition-all`}
                      initial={{ width: 0 }}
                      animate={{ width: `${getPasswordStrength(formData.password).strength}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className={`text-xs flex items-center gap-1.5 ${
                      formData.password.length >= 8 ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      <i className={`bi ${formData.password.length >= 8 ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                      At least 8 characters
                    </div>
                    <div className={`text-xs flex items-center gap-1.5 ${
                      /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      <i className={`bi ${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                      Mix of uppercase & lowercase
                    </div>
                    <div className={`text-xs flex items-center gap-1.5 ${
                      /\d/.test(formData.password) ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      <i className={`bi ${/\d/.test(formData.password) ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                      Contains numbers
                    </div>
                  </div>
                </div>
              )}
              {!formData.password && (
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                  <i className="bi bi-info-circle"></i>
                  Minimum 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 text-lg rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] mt-8"
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="bi bi-rocket-takeoff"></i>
                  Create Account
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
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
