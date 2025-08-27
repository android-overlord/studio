
'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';

type Perfume = {
  name: string;
};

const PaymentPage = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Perfume[]>([]);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This code runs only on the client
    const price = JSON.parse(sessionStorage.getItem('totalPrice') || '0');
    const items = JSON.parse(sessionStorage.getItem('selectedItems') || '[]');
    
    setTotalPrice(price);
    setSelectedItems(items);

    if (price > 0) {
      // IMPORTANT: Replace with your actual UPI ID and name
      const upiId = '9692982344@fam';
      const upiName = 'Creski';
      const transactionNote = 'Creski Perfume Order';
      
      // Format the UPI string
      const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${price.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      
      QRCode.toDataURL(upiUri)
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, []);

  const handleVerification = () => {
    setPaymentVerified(true);
    // Clear session storage after order is "complete"
    sessionStorage.removeItem('customerDetails');
    sessionStorage.removeItem('selectedItems');
    sessionStorage.removeItem('totalPrice');
  };

  if (paymentVerified) {
    return (
        <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
            <div className="bg-neutral-800 p-8 rounded-lg shadow-xl max-w-lg">
                <h1 className="text-3xl font-bold text-green-400 mb-4">Thank You!</h1>
                <p className="text-lg mb-6">Your order has been received. We will process it as soon as we verify your payment. You will receive a confirmation email shortly.</p>
                <button 
                    onClick={() => router.push('/')}
                    className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-pink-400">Complete Your Payment</h1>
      <div className="bg-neutral-800 p-6 md:p-8 rounded-lg shadow-xl max-w-md mx-auto flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold mb-4">Scan to Pay</h2>
        <p className="mb-4 text-neutral-300">
          Use your favorite UPI app to scan the QR code below and pay
          <span className="font-bold text-white"> ${totalPrice.toFixed(2)}</span>.
        </p>
        
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="UPI QR Code" className="w-64 h-64 rounded-lg bg-white p-2" />
        ) : (
          <div className="w-64 h-64 rounded-lg bg-neutral-700 flex items-center justify-center">
            <p>Generating QR Code...</p>
          </div>
        )}

        <div className="w-full mt-6 text-left">
            <h3 className="text-xl font-semibold mb-2">Order Summary:</h3>
            <ul className="list-disc list-inside text-neutral-400">
                {selectedItems.map(item => (
                    <li key={item.name}>{item.name}</li>
                ))}
            </ul>
        </div>
        
        <p className="mt-6 text-sm text-yellow-400">
            After completing the payment, click the button below. Your order will be confirmed after manual verification.
        </p>

        <button 
          onClick={handleVerification}
          className="w-full py-3 mt-4 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300"
        >
          I Have Paid
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
