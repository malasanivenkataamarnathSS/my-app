import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

interface EmailLoginProps {
  onSubmit: (email: string, name?: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
}

const EmailLogin: React.FC<EmailLoginProps> = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (isNewUser && !name.trim()) {
      setEmailError('Name is required for new users');
      return;
    }

    try {
      await onSubmit(email.toLowerCase().trim(), isNewUser ? name.trim() : undefined);
    } catch (err) {
      // Error handling is done in parent component
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (emailError) setEmailError('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
        <p className="text-gray-600">
          Enter your email address and we'll send you a verification code
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
              emailError || error ? 'border-red-500 bg-red-50' : ''
            }`}
            placeholder="Enter your email address"
            disabled={loading}
            autoComplete="email"
            autoFocus
          />
          {(emailError || error) && (
            <p className="text-red-500 text-sm mt-2">{emailError || error}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="newUser"
            type="checkbox"
            checked={isNewUser}
            onChange={(e) => setIsNewUser(e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="newUser" className="ml-2 text-sm text-gray-700">
            I'm a new user
          </label>
        </div>

        {isNewUser && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="Enter your full name"
              disabled={loading}
              autoComplete="name"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Send Verification Code
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          By continuing, you agree to our{' '}
          <button className="text-green-600 hover:text-green-500 underline bg-transparent border-none cursor-pointer">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-green-600 hover:text-green-500 underline bg-transparent border-none cursor-pointer">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailLogin;