import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-earth-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-organic-400">FOORGANICS</h3>
            <p className="text-earth-300">
              Your trusted source for organic and healthy food products.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-earth-300 hover:text-organic-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-earth-300 hover:text-organic-400 transition-colors">Products</Link></li>
              <li><Link to="/about" className="text-earth-300 hover:text-organic-400 transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-earth-300 hover:text-organic-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-earth-300">
              <li>123 Organic Street</li>
              <li>Green City, GC 12345</li>
              <li>Phone: (555) 123-4567</li>
              <li>Email: info@foorganics.com</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <span className="text-earth-300">Facebook</span>
              <span className="text-earth-300">Twitter</span>
              <span className="text-earth-300">Instagram</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-earth-800 mt-8 pt-8 text-center text-earth-400">
          <p>&copy; 2024 FOORGANICS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
