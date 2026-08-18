import React from 'react';
import { useApp } from '../context/AppContext';
import type { Product } from '../context/AppContext';
import { Star, ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProduct, formatPrice } = useApp();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.variants && product.variants.length > 0) {
      // Add first variant as default
      addToCart(product, product.variants[0], 1);
    }
  };

  return (
    <div 
      className="animate-fade-in"
      onClick={() => setSelectedProduct(product)}
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px', // Increased border-radius matching mockup
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(var(--primary-rgb), 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Category Badge */}
      <span className="badge" style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid var(--border)',
        backdropFilter: 'blur(4px)',
        color: 'var(--text)',
        fontSize: '0.72rem',
        fontWeight: 600
      }}>
        {product.categoryName}
      </span>

      {/* Product Image */}
      <div style={{
        width: '100%',
        paddingBottom: '100%', // 1:1 Aspect Ratio
        position: 'relative',
        backgroundColor: 'var(--background)',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)'
      }}>
        <img 
          src={product.productImage} 
          alt={product.productName} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      </div>

      {/* Content */}
      <div style={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}>
        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
          <Star size={13} fill="#C5A880" color="#C5A880" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{product.rating.toFixed(1)}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({product.reviewsCount})</span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          lineHeight: 1.35,
          marginBottom: '8px',
          color: 'var(--text)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          height: '2.5rem'
        }}>
          {product.productName}
        </h3>

        {/* Price display above buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: 'auto',
          paddingTop: '6px',
          borderTop: '1px solid var(--border)',
          marginBottom: '10px'
        }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatPrice(product.sellPrice)}
          </span>
          {product.originalPrice > 0 && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              {formatPrice(product.sellPrice * 1.3)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleAddToCart}
            style={{ 
              flex: 1.2, 
              padding: '7px 6px', 
              fontSize: '0.78rem', 
              borderRadius: '7px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            <ShoppingCart size={13} />
            הוסף
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            style={{ 
              flex: 1, 
              padding: '7px 6px', 
              fontSize: '0.78rem', 
              borderRadius: '7px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            <Eye size={13} />
            פרטים
          </button>
        </div>
      </div>
    </div>
  );
};
