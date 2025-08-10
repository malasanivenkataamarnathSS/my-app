import React, { useState } from 'react';
import { CreditCard, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  orderId?: string;
  onSuccess?: (paymentResult: any) => void;
  onError?: (error: string) => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'digital_wallet';
  name: string;
  icon: React.ReactNode;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'USD',
  orderId,
  onSuccess,
  onError
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Bank Transfer',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      id: 'digital_wallet',
      type: 'digital_wallet',
      name: 'Digital Wallet',
      icon: <DollarSign className="w-5 h-5" />
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          orderId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { paymentIntent } = await response.json();

      // Simulate payment processing (in real app, this would use Stripe Elements)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirm payment
      const confirmResponse = await fetch('/api/payments/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          paymentMethodId: 'pm_card_visa' // Placeholder
        })
      });

      if (!confirmResponse.ok) {
        throw new Error('Payment confirmation failed');
      }

      const paymentResult = await confirmResponse.json();
      
      setPaymentStatus('success');
      onSuccess?.(paymentResult);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Payment failed';
      setErrorMessage(errorMsg);
      setPaymentStatus('error');
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-600">
          Your payment of {formatAmount(amount)} has been processed successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Complete Payment</h2>
        <div className="text-2xl font-bold text-blue-600">{formatAmount(amount)}</div>
      </div>

      {paymentStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-1 gap-2">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  {method.icon}
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {method.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Card Details Form */}
        {selectedMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardDetails.cardholderName}
                onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={cardDetails.cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                  if (value.length <= 19) {
                    setCardDetails(prev => ({ ...prev, cardNumber: value }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={cardDetails.expiryMonth}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, expiryMonth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={cardDetails.expiryYear}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, expiryYear: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">YY</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <option key={year} value={year.toString().slice(-2)}>
                      {year.toString().slice(-2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setCardDetails(prev => ({ ...prev, cvv: value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || paymentStatus === 'processing'}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-top-transparent mr-2"></div>
              Processing Payment...
            </>
          ) : (
            `Pay ${formatAmount(amount)}`
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Your payment information is secure and encrypted.</p>
      </div>
    </div>
  );
};