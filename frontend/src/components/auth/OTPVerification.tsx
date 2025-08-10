import React, { useState, useEffect, useRef } from 'react';
import { Shield, ArrowLeft, ArrowRight, Loader2, RotateCcw } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onSubmit: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error?: string | null;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ 
  email, 
  onSubmit, 
  onResend, 
  onBack, 
  loading, 
  error 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Timer countdown
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (otpError) setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (newOtp.every(digit => digit !== '') && !loading) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digits = pasteData.replace(/\D/g, '').slice(0, 6).split('');
    
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    setOtp(newOtp);

    // Focus appropriate input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (digits.length === 6 && !loading) {
      handleSubmit(digits.join(''));
    }
  };

  const handleSubmit = async (otpValue?: string) => {
    const otpToSubmit = otpValue || otp.join('');
    setOtpError('');

    if (otpToSubmit.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }

    try {
      await onSubmit(otpToSubmit);
    } catch (err) {
      // Error handling is done in parent component
    }
  };

  const handleResend = async () => {
    if (!canResend || loading) return;
    
    try {
      await onResend();
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      // Error handling is done in parent component
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        
        <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-10 w-10 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600 mb-2">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-semibold text-gray-900">{email}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
            Enter Verification Code
          </label>
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  otpError || error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
            ))}
          </div>
          {(otpError || error) && (
            <p className="text-red-500 text-sm mt-3 text-center">{otpError || error}</p>
          )}
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={loading || otp.some(digit => digit === '')}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Verify Code
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={loading}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Resend Code
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Resend available in {formatTimer(resendTimer)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          The verification code will expire in 10 minutes
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;