'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }

      setSuccess('Email verified! Please enter your new password.');
      setStep('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <motion.div
          className="glass-card rounded-3xl p-8 shadow-2xl border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <i className="bi bi-key-fill text-4xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
            </h1>
            <p className="text-gray-400">
              {step === 'email' 
                ? 'Enter your email to reset your password'
                : 'Enter your new password'
              }
            </p>
          </motion.div>

          {error && (
            <motion.div
              className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <i className="bi bi-check-circle-fill"></i>
              {success}
            </motion.div>
          )}

          {step === 'email' ? (
            <motion.form
              onSubmit={handleEmailSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                  <i className="bi bi-envelope text-blue-400"></i>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="bi bi-envelope-fill text-gray-500"></i>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/70 backdrop-blur-sm border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder-gray-500 transition-all shadow-inner"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] mt-8"
              >
                {loading ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin"></i>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-right-circle"></i>
                    Continue
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              onSubmit={handlePasswordReset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                    <i className="bi bi-lock text-blue-400"></i>
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="bi bi-lock-fill text-gray-500"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-800/70 backdrop-blur-sm border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder-gray-500 transition-all shadow-inner"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                    <i className="bi bi-shield-check text-blue-400"></i>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="bi bi-shield-fill-check text-gray-500"></i>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-800/70 backdrop-blur-sm border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder-gray-500 transition-all shadow-inner"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] mt-8"
              >
                {loading ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin"></i>
                    Resetting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Reset Password
                  </>
                )}
              </button>
            </motion.form>
          )}

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center justify-center gap-2">
              <i className="bi bi-arrow-left"></i>
              Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
