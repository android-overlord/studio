export default function ContactUsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
      <div className="prose prose-invert max-w-none bg-neutral-800 p-6 rounded-lg">
        <p>
          We'd love to hear from you! Whether you have a question about our fragrances, an order, or just want to say hello, here's how you can reach us.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6">Our Address</h2>
        <p>
          CRESKI Fragrances<br />
          123 Perfume Lane<br />
          Scent City, ST 54321<br />
          India
        </p>
        
        <h2 className="text-2xl font-semibold mt-6">Email Us</h2>
        <p>
          For any inquiries, please email us at:<br />
          <a href="mailto:creski.help@gmail.com" className="text-pink-400 hover:text-pink-300">creski.help@gmail.com</a>
        </p>

        <h2 className="text-2xl font-semibold mt-6">Follow Us</h2>
        <p>
          Connect with us on social media for the latest updates and releases:<br/>
           <a href="https://www.instagram.com/creski.shop" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300">Instagram: @creski.shop</a>
        </p>
      </div>
    </div>
  );
}
