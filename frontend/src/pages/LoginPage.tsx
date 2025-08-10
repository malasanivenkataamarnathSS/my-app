import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We'll send you an OTP to verify your identity
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-center text-gray-500">
            Login functionality will be implemented soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;