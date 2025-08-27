
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import perfumeImages from '@/images.json';
import { sendOrderEmail } from '@/app/actions';

type Perfume = {
    name: string;
    family: string;
    personality: string[];
    occasions: string[];
    intensity: string;
};

const getPerfumeImage = (perfumeName: string) => {
    const images = perfumeImages as Record<string, string>;
    const imageName = Object.keys(images).find(key => images[key] === perfumeName);
  
    if (imageName) {
      return `/images/${imageName}`;
    }
  
    const seed = perfumeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://picsum.photos/seed/${seed}/100/100`;
};

const CheckoutContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [recommendedPerfumes, setRecommendedPerfumes] = useState<Perfume[]>([]);
    const [selectedPerfumes, setSelectedPerfumes] = useState<Record<string, boolean>>({});
    const [totalPrice, setTotalPrice] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });

    const PERFUME_PRICE = 45; // Placeholder price

    useEffect(() => {
        const perfumesJson = searchParams.get('perfumes');
        if (perfumesJson) {
            try {
                const parsedPerfumes = JSON.parse(perfumesJson);
                setRecommendedPerfumes(parsedPerfumes);
            } catch (error) {
                console.error("Failed to parse perfumes from URL", error);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const selectedCount = Object.values(selectedPerfumes).filter(Boolean).length;
        setTotalPrice(selectedCount * PERFUME_PRICE);
    }, [selectedPerfumes]);

    const handleSelectionChange = (perfumeName: string) => {
        setSelectedPerfumes(prev => ({
            ...prev,
            [perfumeName]: !prev[perfumeName],
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({ ...prev, [name]: value }));
    };

    const proceedToPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        for (const key in customerDetails) {
            if (customerDetails[key as keyof typeof customerDetails].trim() === '') {
                alert(`Please fill in your ${key}`);
                setIsSubmitting(false);
                return;
            }
        }
        
        const selectedItems = recommendedPerfumes.filter(p => selectedPerfumes[p.name]);
        if (selectedItems.length === 0) {
            alert("Please select at least one perfume to order.");
            setIsSubmitting(false);
            return;
        }

        try {
            await sendOrderEmail({ customerDetails, selectedItems, totalPrice });

            sessionStorage.setItem('customerDetails', JSON.stringify(customerDetails));
            sessionStorage.setItem('selectedItems', JSON.stringify(selectedItems));
            sessionStorage.setItem('totalPrice', JSON.stringify(totalPrice));
            router.push('/payment');

        } catch (error: any) {
            console.error('Failed to process order:', error);
            alert(error.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-pink-400">Checkout</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Perfume Selection & Summary */}
                <div className="bg-neutral-800 p-6 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 border-b border-neutral-700 pb-3">Your Order</h2>
                    
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-4">1. Select Your Perfumes</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {recommendedPerfumes.map(perfume => (
                                <div key={perfume.name} className="flex items-center justify-between bg-neutral-700 p-3 rounded-md">
                                    <div className="flex items-center gap-4">
                                        <Image src={getPerfumeImage(perfume.name)} alt={perfume.name} width={50} height={50} className="rounded" />
                                        <span className="font-medium">{perfume.name}</span>
                                    </div>
                                    <input 
                                        type="checkbox"
                                        checked={!!selectedPerfumes[perfume.name]}
                                        onChange={() => handleSelectionChange(perfume.name)}
                                        className="form-checkbox h-5 w-5 text-pink-500 bg-neutral-600 border-neutral-500 rounded focus:ring-pink-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4">2. Order Summary</h3>
                        <div className="space-y-2 text-neutral-300">
                           {recommendedPerfumes.filter(p => selectedPerfumes[p.name]).map(p => (
                               <div key={p.name} className="flex justify-between">
                                   <span>{p.name}</span>
                                   <span>${PERFUME_PRICE.toFixed(2)}</span>
                               </div>
                           ))}
                           <div className="border-t border-neutral-600 my-2"></div>
                           <div className="flex justify-between text-white font-bold text-lg">
                               <span>Total</span>
                               <span>${totalPrice.toFixed(2)}</span>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Customer Details Form */}
                <div className="bg-neutral-800 p-6 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 border-b border-neutral-700 pb-3">3. Shipping Details</h2>
                    <form onSubmit={proceedToPayment} className="space-y-4">
                        <input type="text" name="name" placeholder="Full Name" value={customerDetails.name} onChange={handleInputChange} required className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:ring-pink-500 focus:border-pink-500" />
                        <input type="email" name="email" placeholder="Email Address" value={customerDetails.email} onChange={handleInputChange} required className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:ring-pink-500 focus:border-pink-500" />
                        <input type="tel" name="phone" placeholder="Phone Number" value={customerDetails.phone} onChange={handleInputChange} required className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:ring-pink-500 focus:border-pink-500" />
                        <input type="text" name="address" placeholder="Street Address" value={customerDetails.address} onChange={handleInputChange} required className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:ring-pink-500 focus:border-pink-500" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="city" placeholder="City" value={customerDetails.city} onChange={handleInputChange} required className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:ring-pink-500 focus:border-pink-500" />
                            <input type="text" name="state" placeholder="State / Province" value={customerDetails.state} onChange={handleInputChange} required className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:ring-pink-500 focus:border-pink-500" />
                        </div>
                        <input type="text" name="zip" placeholder="ZIP / Postal Code" value={customerDetails.zip} onChange={handleInputChange} required className="w-full p-3 bg-neutral-700 rounded-md border border-neutral-600 focus:ring-pink-500 focus:border-pink-500" />
                        
                        <button 
                            type="submit" 
                            disabled={totalPrice === 0 || isSubmitting}
                            className="w-full py-3 px-6 mt-4 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-neutral-600 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : `Proceed to Payment ($${totalPrice.toFixed(2)})`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Use Suspense to handle client-side rendering of search params
const CheckoutPage = () => (
    <Suspense fallback={<div className="text-center p-10">Loading Your Recommendations...</div>}>
        <CheckoutContent />
    </Suspense>
);


export default CheckoutPage;
