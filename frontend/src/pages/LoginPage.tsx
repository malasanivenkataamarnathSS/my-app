import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmailLogin from '../components/auth/EmailLogin';
import OTPVerification from '../components/auth/OTPVerification';
import UserRegistration from '../components/auth/UserRegistration';

type LoginStep = 'email' | 'otp' | 'registration';

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const { login, sendOTP, updateProfile, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleSendOTP = async (emailAddress: string, name?: string) => {
    try {
      clearError();
      await sendOTP(emailAddress, name);
      setEmail(emailAddress);
      setIsNewUser(!!name);
      setStep('otp');
    } catch (err: any) {
      // Error is handled by context
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      clearError();
      await login(email, otp);
      
      // If user needs to complete registration (new user), show registration form
      // For now, we'll navigate directly since the backend handles user creation
      navigate(from, { replace: true });
    } catch (err: any) {
      // Error is handled by context
    }
  };

  const handleResendOTP = async () => {
    try {
      clearError();
      await sendOTP(email, isNewUser ? 'User' : undefined);
    } catch (err: any) {
      // Error is handled by context
    }
  };

  const handleCompleteRegistration = async (userData: { username: string; phone: string }) => {
    try {
      clearError();
      await updateProfile({
        name: userData.username,
        phone: userData.phone,
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      // Error is handled by context
    }
  };

  const handleBack = () => {
    clearError();
    if (step === 'otp') {
      setStep('email');
    } else if (step === 'registration') {
      setStep('otp');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-xl shadow-lg relative">
          {step === 'email' && (
            <EmailLogin
              onSubmit={handleSendOTP}
              loading={loading}
              error={error}
            />
          )}
          
          {step === 'otp' && (
            <OTPVerification
              email={email}
              onSubmit={handleVerifyOTP}
              onResend={handleResendOTP}
              onBack={handleBack}
              loading={loading}
              error={error}
            />
          )}
          
          {step === 'registration' && (
            <UserRegistration
              email={email}
              onSubmit={handleCompleteRegistration}
              onBack={handleBack}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;