
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import perfumeImages from '@/images.json';
import { useCart } from '@/hooks/use-cart';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Perfume = {
  name: string;
  price: number;
};

const getPerfumeImage = (perfumeName: string) => {
  const images = perfumeImages as Record<string, string>;
  const imageName = Object.keys(images).find(key => images[key] === perfumeName);
  return imageName ? `/images/${imageName}` : `https://picsum.photos/seed/${perfumeName}/100/100`;
};

const CheckoutPage = () => {
  const { cart, clearCart, removeItem } = useCart();
  const { toast } = useToast();
  
  const [itemsFromQuiz, setItemsFromQuiz] = useState<Perfume[]>([]);
  const [allAvailableItems, setAllAvailableItems] = useState<Perfume[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    let quizItems: Perfume[] = [];
    try {
      const primary = JSON.parse(sessionStorage.getItem('primaryRecommendation') || 'null');
      const alternatives = JSON.parse(sessionStorage.getItem('alternativeRecommendations') || '[]');
      quizItems = [primary, ...alternatives].filter(Boolean);
      setItemsFromQuiz(quizItems);
    } catch (e) {
      console.error("Failed to parse recommendations from session storage", e);
    }
  }, []);

  useEffect(() => {
    const combined = [...itemsFromQuiz, ...cart];
    const unique = Array.from(new Map(combined.map(item => [item.name, item])).values());
    setAllAvailableItems(unique);
  }, [cart, itemsFromQuiz]);

  useEffect(() => {
    const newTotalPrice = allAvailableItems.reduce((acc, item) => acc + (item.price || 0), 0);
    setTotalPrice(newTotalPrice);
  }, [allAvailableItems]);

  const handleRemoveItem = (itemName: string) => {
    // Remove from cart store
    removeItem(itemName);
    
    // Remove from local state if it's there
    setItemsFromQuiz(prev => prev.filter(p => p.name !== itemName));
    
    // update session storage if needed
    const primary = JSON.parse(sessionStorage.getItem('primaryRecommendation') || 'null');
    if (primary && primary.name === itemName) {
      sessionStorage.removeItem('primaryRecommendation');
    }
    const alternatives = JSON.parse(sessionStorage.getItem('alternativeRecommendations') || '[]');
    const updatedAlternatives = alternatives.filter((p: Perfume) => p.name !== itemName);
    sessionStorage.setItem('alternativeRecommendations', JSON.stringify(updatedAlternatives));
    
    toast({
        title: "Item Removed",
        description: `${itemName} has been removed from your list.`,
    });
  };

  const handleClearCart = () => {
    clearCart();
    setItemsFromQuiz([]);
    sessionStorage.removeItem('primaryRecommendation');
    sessionStorage.removeItem('alternativeRecommendations');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Your Items</h1>
      <div className="max-w-2xl mx-auto">
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Items</h2>
            {allAvailableItems.length > 0 && (
                <button onClick={handleClearCart} className="flex items-center text-sm text-neutral-400 hover:text-white transition-colors">
                    <Trash2 className="h-4 w-4 mr-1"/> Clear All
                </button>
            )}
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
                   <button onClick={() => handleRemoveItem(item.name)} className="text-neutral-500 hover:text-red-500 transition-colors">
                      <Trash2 className="h-5 w-5" />
                   </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 text-center bg-neutral-800 p-8 rounded-lg">Your cart is empty.</p>
          )}
          <div className="mt-6 text-right">
            <p className="text-2xl font-bold">Total Estimate: ₹{totalPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-neutral-400 mb-4">To complete your purchase, please contact us on Instagram.</p>
          <a
              href="https://www.instagram.com/creski.shop"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-block py-3 mt-4 bg-pink-600 text-white font-semibold rounded-full shadow-lg hover:bg-pink-700 transition-colors duration-300 disabled:bg-neutral-600 disabled:cursor-not-allowed"
            >
              Order on Instagram
            </a>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
