'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import perfumeImages from '@/images.json';
import { useCart } from '@/hooks/use-cart';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const { cart, clearCart } = useCart();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<Perfume[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '', email: '', phone: '', address: '', city: '', state: '', zip: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [allAvailableItems, setAllAvailableItems] = useState<Perfume[]>([]);

  useEffect(() => {
    let quizItems: Perfume[] = [];
    try {
      const primary = JSON.parse(sessionStorage.getItem('primaryRecommendation') || 'null');
      const alternatives = JSON.parse(sessionStorage.getItem('alternativeRecommendations') || '[]');
      quizItems = [primary, ...alternatives].filter(Boolean);
    } catch (e) {
      console.error("Failed to parse recommendations from session storage", e);
    }
    
    const combined = [...quizItems, ...cart];
    const unique = Array.from(new Map(combined.map(item => [item.name, item])).values());
    
    setAllAvailableItems(unique);
    setSelectedItems(unique);
  }, [cart]);

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
    setIsLoading(true);

    const isFormValid = Object.values(customerDetails).every(val => val.trim() !== '');
    if (!isFormValid || selectedItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill out all fields and select at least one item.',
      });
      setIsLoading(false);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
        toast({
          variant: 'destructive',
          title: 'Payment Error',
          description: "Could not load payment gateway. Please check your connection.",
        });
        setIsLoading(false);
        return;
    }

    const fullCustomerDetails = {
      ...customerDetails,
      address: `${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.zip}`
    };

    // Call the Netlify serverless function to create the order
    const orderResponse = await fetch('/.netlify/functions/create-razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: totalPrice,
        customerDetails: fullCustomerDetails,
        items: selectedItems,
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok || orderData.error || !orderData.id) {
        toast({
          variant: 'destructive',
          title: 'Order Error',
          description: orderData.error || "Failed to create payment order on the server.",
        });
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
        setIsLoading(true);

        // Call the Netlify serverless function to verify the payment
        const verificationResponse = await fetch('/.netlify/functions/verify-razorpay-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        });
        
        const verificationResult = await verificationResponse.json();
        
        if (verificationResult.success && verificationResult.paymentId) {
            sessionStorage.setItem('paymentId', verificationResult.paymentId);
            
            // Fire-and-forget the email sending by calling the Netlify function
            fetch('/.netlify/functions/send-order-confirmation-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerDetails: fullCustomerDetails,
                items: selectedItems,
                paymentId: verificationResult.paymentId
              })
            });

            // Immediately clear local state and redirect for a fast user experience.
            clearCart();
            sessionStorage.removeItem('primaryRecommendation');
            sessionStorage.removeItem('alternativeRecommendations');
            router.push('/thank-you');
            
        } else {
            toast({
              variant: 'destructive',
              title: 'Payment Failed',
              description: verificationResult.error || 'Payment verification failed.',
            });
            setIsLoading(false);
        }
      },
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone,
      },
      theme: {
        color: '#E11D48' // A pink/rose color to match the theme
      },
      notes: orderData.notes
    };
    
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response: any) {
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: `Code: ${response.error.code}, Description: ${response.error.description}`,
        });
        setIsLoading(false);
    });

    rzp.open();
    setIsLoading(false);
  };
  
  const handleClearCart = () => {
    clearCart();
    sessionStorage.removeItem('primaryRecommendation');
    sessionStorage.removeItem('alternativeRecommendations');
    setSelectedItems([]);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Your Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Items</h2>
            <button onClick={handleClearCart} className="flex items-center text-sm text-neutral-400 hover:text-white transition-colors">
              <Trash2 className="h-4 w-4 mr-1"/> Clear All
            </button>
          </div>
          {allAvailableItems.length > 0 ? (
            <div className="space-y-4">
              {allAvailableItems.map(item => (
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
          ) : (
            <p className="text-neutral-400 text-center bg-neutral-800 p-8 rounded-lg">Your cart is empty.</p>
          )}
          <div className="mt-6 text-right">
            <p className="text-2xl font-bold">Total: ₹{totalPrice.toFixed(2)}</p>
          </div>
        </div>

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
              disabled={isLoading || selectedItems.length === 0}
              className="w-full py-3 mt-4 bg-pink-600 text-white font-semibold rounded-full shadow-lg hover:bg-pink-700 transition-colors duration-300 disabled:bg-neutral-600 disabled:cursor-not-allowed"
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
