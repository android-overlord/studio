'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import perfumeImages from '@/images.json';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/actions';

type Perfume = {
  name: string;
  price: number;
};

type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

const getPerfumeImage = (perfumeName: string) => {
  const images = perfumeImages as Record<string, string>;
  const imageName = Object.keys(images).find(key => images[key] === perfumeName);
  return imageName ? `/images/${imageName}` : `https://picsum.photos/seed/${perfumeName}/100/100`;
};

const CheckoutPage = () => {
  const router = useRouter();
  const [recommendedItems, setRecommendedItems] = useState<Perfume[]>([]);
  const [selectedItems, setSelectedItems] = useState<Perfume[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '', email: '', phone: '', address: '', city: '', state: '', zip: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const primary = JSON.parse(sessionStorage.getItem('primaryRecommendation') || 'null');
      const alternatives = JSON.parse(sessionStorage.getItem('alternativeRecommendations') || '[]');
      const allItems = [primary, ...alternatives].filter(Boolean);
      setRecommendedItems(allItems);
      setSelectedItems(allItems); // Pre-select all recommended items
    } catch (e) {
      console.error("Failed to parse recommendations from session storage", e);
      setError("Could not load your recommended perfumes. Please try the quiz again.");
    }
  }, []);

  useEffect(() => {
    const newTotalPrice = selectedItems.reduce((acc, item) => acc + (item.price || 0), 0);
    setTotalPrice(newTotalPrice);
  }, [selectedItems]);

  const handleSelectionChange = (item: Perfume, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(prev => [...prev, item]);
    } else {
      setSelectedItems(prev => prev.filter(p => p.name !== item.name));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const isFormValid = Object.values(customerDetails).every(val => val.trim() !== '');
    if (!isFormValid || selectedItems.length === 0) {
      setError('Please fill out all fields and select at least one item.');
      setIsLoading(false);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
        setError("Could not load payment gateway. Please check your connection.");
        setIsLoading(false);
        return;
    }

    const orderData = await createRazorpayOrder(totalPrice);
    if (orderData.error || !orderData.id) {
        setError(orderData.error || "Failed to create payment order.");
        setIsLoading(false);
        return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'CRESKI',
      description: 'Perfume Order',
      order_id: orderData.id,
      handler: async function (response: any) {
        const verificationResult = await verifyRazorpayPayment(response);
        if (verificationResult.success) {
            sessionStorage.setItem('paymentId', verificationResult.paymentId!);
            router.push('/thank-you');
        } else {
            setError(verificationResult.error || 'Payment verification failed.');
            setIsLoading(false);
        }
      },
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone,
      },
      notes: {
        address: `${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.zip}`
      },
      theme: {
        color: '#3B82F6'
      }
    };
    
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
        setError(`Payment failed. Code: ${response.error.code}, Description: ${response.error.description}`);
        setIsLoading(false);
    });
    rzp.open();
  };

  if (error && !isLoading) {
    return (
        <div className="container mx-auto p-4 flex flex-col items-center justify-center text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => setError(null)} className="px-6 py-2 bg-blue-600 rounded-full">Try Again</button>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Your Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Items Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Recommended Items</h2>
          <div className="space-y-4">
            {recommendedItems.map(item => (
              <div key={item.name} className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image src={getPerfumeImage(item.name)} alt={item.name} width={60} height={60} className="rounded-md"/>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-neutral-400">₹{item.price?.toFixed(2)}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedItems.some(p => p.name === item.name)}
                  onChange={(e) => handleSelectionChange(item, e.target.checked)}
                  className="w-5 h-5 accent-pink-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <p className="text-2xl font-bold">Total: ₹{totalPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Customer Details Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Shipping Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" placeholder="Full Name" value={customerDetails.name} onChange={handleInputChange} required className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-pink-500" />
            <input type="email" name="email" placeholder="Email Address" value={customerDetails.email} onChange={handleInputChange} required className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-pink-500" />
            <input type="tel" name="phone" placeholder="Phone Number" value={customerDetails.phone} onChange={handleInputChange} required className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-pink-500" />
            <input type="text" name="address" placeholder="Address" value={customerDetails.address} onChange={handleInputChange} required className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-pink-500" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" name="city" placeholder="City" value={customerDetails.city} onChange={handleInputChange} required className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                <input type="text" name="state" placeholder="State" value={customerDetails.state} onChange={handleInputChange} required className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                <input type="text" name="zip" placeholder="ZIP Code" value={customerDetails.zip} onChange={handleInputChange} required className="w-full p-3 bg-neutral-800 rounded-md border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-pink-600 text-white font-semibold rounded-full shadow-lg hover:bg-pink-700 transition-colors duration-300 disabled:bg-neutral-600"
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
