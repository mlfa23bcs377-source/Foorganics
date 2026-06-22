import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StoreProduct } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: StoreProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const outOfStock = product.stock_quantity <= 0;

  useEffect(() => {
    setImageError(false);
  }, [product.image]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!outOfStock) addToCart(product);
  };

  const fallbackImage =
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop';

  return (
    <div className="card overflow-hidden group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square bg-earth-100 overflow-hidden">
          <img
            src={imageError ? fallbackImage : product.image || fallbackImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          <div className="absolute top-2 right-2 bg-organic-600 text-white px-2 py-1 rounded text-xs font-medium">
            {product.category}
          </div>
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm sm:text-base font-semibold text-earth-900 mb-1 hover:text-organic-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-earth-600 text-xs sm:text-sm mb-2 line-clamp-2 hidden sm:block">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg font-bold text-organic-700">
            ₨{product.price.toLocaleString()}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {outOfStock ? 'Unavailable' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
