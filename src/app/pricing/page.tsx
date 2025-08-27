import { CheckCircle } from 'lucide-react';

const pricingTiers = [
  {
    name: 'Standard Bottle',
    price: '₹1,299',
    description: 'Perfect for finding your new signature scent.',
    features: [
      '50ml Bottle of Your Chosen Fragrance',
      'High-Quality Inspired Perfume',
      'Long-lasting Formula',
    ],
  },
  {
    name: 'Discovery Set',
    price: '₹1,999',
    description: 'Explore a variety of our best-selling scents.',
    features: [
      'Five 10ml Sampler Bottles',
      'Curated Selection of Fragrances',
      'Ideal for Gifting',
      'Discount on Future Full Bottle Purchase',
    ],
  },
  {
    name: 'Luxury Collection',
    price: '₹2,499',
    description: 'For the ultimate fragrance connoisseur.',
    features: [
      '100ml Premium Bottle',
      'Exclusive and Rare Scents',
      'Elegant Packaging',
      'Complimentary Travel Atomizer',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Pricing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingTiers.map((tier) => (
          <div key={tier.name} className="bg-neutral-800 rounded-lg shadow-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-pink-400 mb-2">{tier.name}</h2>
            <p className="text-4xl font-extrabold mb-4">{tier.price}</p>
            <p className="text-neutral-400 mb-6 flex-grow">{tier.description}</p>
            <ul className="space-y-3 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://www.instagram.com/creski.shop"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto w-full text-center py-3 bg-pink-500 text-white font-semibold rounded-full shadow-lg hover:bg-pink-600 transition-colors duration-300"
            >
              Order Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
