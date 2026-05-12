import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '../api/axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setEmailError(err); return; }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch {
      // Show the same success UI even on API errors to avoid leaking information
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <Mail size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Forgot password?</h1>
          <p className="text-gray-500 mt-2">
            {submitted
              ? 'Check your inbox'
              : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Mail size={28} className="text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                If an account with <strong>{email}</strong> exists, a password reset link has been
                sent. It expires in 1 hour.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Didn&apos;t receive it? Check your spam folder, or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  try again
                </button>
                .
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:underline"
              >
                <ArrowLeft size={15} /> Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                    emailError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs text-red-500">{emailError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {isLoading ? 'Sending…' : 'Send Reset Link'}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                <ArrowLeft size={15} /> Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
