import React, { useState } from 'react';
import { PaymentForm } from '../components/payment/PaymentForm';
import { CreditCard, History, Receipt } from 'lucide-react';

export const Payments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [paymentHistory] = useState([
    {
      id: '1',
      amount: 29.99,
      currency: 'USD',
      status: 'succeeded',
      date: '2024-01-15',
      description: 'Subscription payment'
    },
    {
      id: '2',
      amount: 15.50,
      currency: 'USD',
      status: 'succeeded',
      date: '2024-01-10',
      description: 'Order #1234'
    }
  ]);

  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('Payment successful:', paymentResult);
    // Add to payment history or refresh the page
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Show error message to user
  };

  const tabs = [
    { id: 'new', label: 'Make Payment', icon: CreditCard },
    { id: 'history', label: 'Payment History', icon: History }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'new' | 'history')}
                      className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'new' ? (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Make a Payment</h2>
                    <p className="text-gray-600 mt-1">
                      Secure payment processing with multiple payment methods
                    </p>
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <PaymentForm
                      amount={29.99}
                      currency="USD"
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                    <p className="text-gray-600 mt-1">
                      View all your past transactions and receipts
                    </p>
                  </div>

                  {paymentHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No payment history found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentHistory.map((payment) => (
                        <div key={payment.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {payment.description}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(payment.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ${payment.amount}
                              </p>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  payment.status === 'succeeded'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};