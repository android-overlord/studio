export default function CancellationPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Cancellation & Refund Policy</h1>
      <div className="prose prose-invert max-w-none bg-neutral-800 p-6 rounded-lg">
        <p>
          Thank you for shopping at CRESKI. We appreciate the trust you have placed in us. Our Cancellation and Refund Policy provides detailed information about your rights and obligations with respect to your purchases.
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Order Cancellation</h2>
        <p>
          You can cancel your order at any time before the item has been shipped. Once the order is shipped, it cannot be canceled. To cancel your order, please contact our customer support team with your order number at <a href="mailto:support@creski.shop" className="text-pink-400 hover:text-pink-300">support@creski.shop</a>.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6">2. Refund Policy</h2>
        <p>
          Due to the nature of our products, we do not offer refunds or returns once an item has been shipped. We ensure that every product is of the highest quality and is inspected before dispatch.
        </p>
        <p>
            In the unlikely event that you receive a damaged or incorrect product, please contact us within 48 hours of delivery with photographic evidence. We will review the case and, if approved, we will send a replacement for the damaged or incorrect item. No refunds will be issued.
        </p>

        <h2 className="text-2xl font-semibold mt-6">3. How to Report a Damaged Item</h2>
        <p>
          To report a damaged or incorrect item, please email us at <a href="mailto:support@creski.shop" className="text-pink-400 hover:text-pink-300">support@creski.shop</a> with the following information:
        </p>
        <ul>
            <li>Your order number</li>
            <li>A clear description of the issue</li>
            <li>Photographs of the damaged or incorrect item and the packaging</li>
        </ul>
        <p>
            Our team will get back to you within 2-3 business days to resolve the issue.
        </p>

        <h2 className="text-2xl font-semibold mt-6">Contact Us</h2>
        <p>
          If you have any questions about our Cancellation and Refund Policy, please contact us at <a href="mailto:support@creski.shop" className="text-pink-400 hover:text-pink-300">support@creski.shop</a>.
        </p>
      </div>
    </div>
  );
}
