import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, Loader, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { user, login, sendOTP, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otpSent, setOtpSent] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await sendOTP(email, name);
      setOtpSent(true);
      setStep('otp');
    } catch (error) {
      // Error handling is done in context
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    try {
      await login(email, otp);
    } catch (error) {
      // Error handling is done in context
    }
  };

  const resetForm = () => {
    setStep('email');
    setOtp('');
    setOtpSent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="bg-primary-500 text-white p-3 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MyApp</h1>
          <p className="text-gray-600">Your trusted organic food delivery service</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 'email' ? (
          // Email Step
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <span>Send OTP</span>
              )}
            </button>
          </form>
        ) : (
          // OTP Step
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Enter OTP</h2>
              <p className="text-sm text-gray-600">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-xl tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Login</span>
                )}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={resetForm}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Use different email
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms & Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};