import React, { useState } from 'react';
import { User, Phone, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface UserRegistrationProps {
  email: string;
  onSubmit: (userData: { username: string; phone: string }) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error?: string | null;
}

const UserRegistration: React.FC<UserRegistrationProps> = ({ 
  email, 
  onSubmit, 
  onBack, 
  loading, 
  error 
}) => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ username?: string; phone?: string }>({});

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number pattern
    return phoneRegex.test(phone);
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { username?: string; phone?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(username)) {
      newErrors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit({ username: username.trim(), phone: phone.trim() });
      } catch (err) {
        // Error handling is done in parent component
      }
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (errors.username) setErrors({ ...errors, username: undefined });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only numbers
    if (value.length <= 10) {
      setPhone(value);
      if (errors.phone) setErrors({ ...errors, phone: undefined });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <button
          onClick={onBack}
          className="absolute left-4 top-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={loading}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="mx-auto h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600 mb-2">
          Almost there! Please provide a few more details
        </p>
        <p className="text-sm text-gray-500">for {email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
              errors.username ? 'border-red-500 bg-red-50' : ''
            }`}
            placeholder="Enter your username"
            disabled={loading}
            autoComplete="username"
            autoFocus
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-2">{errors.username}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            3-20 characters, letters, numbers, and underscores only
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 inline mr-1" />
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">+91</span>
            </div>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                errors.phone ? 'border-red-500 bg-red-50' : ''
              }`}
              placeholder="Enter 10-digit mobile number"
              disabled={loading}
              autoComplete="tel"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Enter your 10-digit Indian mobile number
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Complete Registration
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Your information is secure and will only be used to{' '}
          <br />enhance your experience with our organic products
        </p>
      </div>
    </div>
  );
};

export default UserRegistration;