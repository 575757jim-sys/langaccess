import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const handleReturnToOrder = () => {
    window.location.href = '/order-cards';
  };

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-4">
            <XCircle className="w-16 h-16 text-gray-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Canceled
        </h1>

        <p className="text-gray-600 mb-6">
          Your payment was canceled and no charges were made to your account.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            If you experienced any issues during checkout, please try again or contact support for assistance.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleReturnToOrder}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={handleReturnHome}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
