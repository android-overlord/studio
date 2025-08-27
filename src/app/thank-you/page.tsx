'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

const ThankYouPage = () => {
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('paymentId');
    setPaymentId(id);
    // It's good practice to clear the sensitive data from storage after use
    // sessionStorage.removeItem('paymentId'); 
    // Commented out so you can refresh and see the ID
  }, []);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center text-center min-h-[calc(100vh-100px)] p-4">
      <div className="bg-neutral-800 p-8 rounded-lg shadow-2xl max-w-lg w-full">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Thank You!</h1>
        <p className="text-neutral-300 mb-6">
          Your order has been placed successfully.
        </p>

        {paymentId && (
          <div className="text-left bg-neutral-900 p-4 rounded-md">
            <p className="text-neutral-400 text-sm">Your Payment ID:</p>
            <p className="font-mono text-lg break-all">{paymentId}</p>
          </div>
        )}

        <p className="text-neutral-400 mt-6 text-sm">
          You will receive an order confirmation email shortly. If you have any questions, please contact our support.
        </p>

        <Link href="/" passHref>
          <button className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300">
            Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ThankYouPage;
