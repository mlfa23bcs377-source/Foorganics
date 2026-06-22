import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StoreProduct } from '../types';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const outOfStock = !product || product.stock_quantity <= 0;
  const maxQty = product ? product.stock_quantity : 1;

  const handleAddToCart = () => {
    if (product && !outOfStock) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-earth-900 mb-4">Product not found</h2>
          <Link to="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center text-earth-600 hover:text-organic-600 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-earth-100">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8">
              <div className="mb-4">
                <span className="inline-block bg-organic-100 text-organic-800 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                {outOfStock ? (
                  <span className="ml-2 inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                ) : (
                  <span className="ml-2 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.stock_quantity} in stock
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-earth-900 mb-4">{product.name}</h1>
              <div className="text-3xl font-bold text-organic-700 mb-6">
                ₨{product.price.toLocaleString()}
              </div>
              <p className="text-earth-600 mb-8 leading-relaxed">{product.description}</p>

              {!outOfStock && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-earth-700 mb-2">Quantity</label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg border border-earth-300 flex items-center justify-center hover:bg-earth-50"
                      >
                        -
                      </button>
                      <span className="w-16 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                        className="w-10 h-10 rounded-lg border border-earth-300 flex items-center justify-center hover:bg-earth-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button onClick={handleAddToCart} className="w-full btn-primary text-lg py-3">
                    Add to Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
