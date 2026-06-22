import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StoreProduct } from '../types';
import { getListedProducts } from '../services/productService';
import { ShoppingCartIcon, HeartIcon, BeakerIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getListedProducts();
        setFeaturedProducts(products.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-organic-50 to-earth-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-earth-900 mb-6">
              Welcome to <span className="text-organic-600">FOORGANICS</span>
            </h1>
            <p className="text-xl text-earth-700 mb-8 max-w-2xl mx-auto">
              Your trusted source for premium organic food products. Fresh, healthy, and sustainably sourced.
            </p>
            <Link
              to="/products"
              className="btn-primary text-lg px-8 py-4"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-organic-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BeakerIcon className="h-8 w-8 text-organic-600" />
              </div>
              <h3 className="text-lg font-semibold text-earth-900 mb-2">100% Organic</h3>
              <p className="text-earth-600">All our products are certified organic and sustainably sourced.</p>
            </div>
            <div className="text-center">
              <div className="bg-organic-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <HeartIcon className="h-8 w-8 text-organic-600" />
              </div>
              <h3 className="text-lg font-semibold text-earth-900 mb-2">Healthy Living</h3>
              <p className="text-earth-600">Promoting a healthy lifestyle with natural, chemical-free products.</p>
            </div>
            <div className="text-center">
              <div className="bg-organic-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShoppingCartIcon className="h-8 w-8 text-organic-600" />
              </div>
              <h3 className="text-lg font-semibold text-earth-900 mb-2">Fast Delivery</h3>
              <p className="text-earth-600">Quick and reliable delivery to your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-earth-900 mb-4">Featured Products</h2>
            <p className="text-earth-600">Discover our selection of premium organic products</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/products" className="btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
