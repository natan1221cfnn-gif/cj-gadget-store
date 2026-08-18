import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Product, Variant } from '../context/AppContext';
import { Star, ShoppingCart, Plus, Minus, ArrowRight, ShieldCheck, Truck, RefreshCw, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose }) => {
  const { addToCart, formatPrice } = useApp();
  const [selectedVariant, setSelectedVariant] = useState<Variant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  
  // Gallery list from product database
  const gallery = product.productGallery && product.productGallery.length > 0 
    ? product.productGallery 
    : [product.productImage];

  // Merge productVideo with gallery images into unified media list
  const mediaList = useMemo(() => {
    const list = gallery.map(url => ({ type: 'image', url }));
    if (product.productVideo) {
      list.unshift({ type: 'video', url: product.productVideo });
    }
    return list;
  }, [gallery, product.productVideo]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Dynamic Shipping state
  const [shippingOptions, setShippingOptions] = useState<{ name: string; price: number; days: string }[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Update selected variant if product changes
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      setActiveImgIndex(0);
      setQuantity(1);
    }
  }, [product]);

  // Fetch shipping options dynamically when variant or quantity changes
  useEffect(() => {
    const fetchShipping = async () => {
      setLoadingShipping(true);
      try {
        const res = await fetch('http://localhost:5000/api/shipping-rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: selectedVariant.sku || product.pid,
            quantity
          })
        });
        if (res.ok) {
          const data = await res.json();
          setShippingOptions(data);
          setSelectedOptionIndex(0);
        }
      } catch (err) {
        console.error('Failed to fetch shipping rates', err);
      } finally {
        setLoadingShipping(false);
      }
    };

    fetchShipping();
  }, [selectedVariant, quantity, product.pid]);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    alert(`נוסף לעגלה: ${product.productName} (${selectedVariant.color}) x${quantity}`);
    onClose();
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex(prev => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex(prev => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const selectedShippingOption = shippingOptions[selectedOptionIndex];
  const shippingDays = selectedShippingOption ? selectedShippingOption.days : '10-16 ימי עסקים';

  // Format multi-line description specs into clean bullet points
  const specLines = product.description
    ? product.description
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
    : [];

  return (
    <div className="animate-fade-in" style={{
      padding: '20px 0 80px 0',
      minHeight: '80vh'
    }}>
      {/* Breadcrumbs Navigation */}
      <div className="container" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button className="btn btn-secondary" onClick={onClose} style={{ display: 'inline-flex', gap: '8px', padding: '8px 16px', borderRadius: '10px' }}>
          <ArrowRight size={18} />
          חזרה לחנות
        </button>
      </div>

      <div className="container">
        {/* Main Grid: Gallery on Right, Product Details on Left */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'start',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: 'var(--shadow)'
        }}>
          
          {/* RIGHT COLUMN: Gallery Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Active Media Box */}
            <div style={{
              width: '100%',
              paddingBottom: '100%', // 1:1 Aspect Ratio
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)'
            }}>
              {mediaList[activeImgIndex].type === 'video' ? (
                <video 
                  src={mediaList[activeImgIndex].url}
                  controls
                  autoPlay
                  muted
                  playsInline
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <img 
                  src={mediaList[activeImgIndex].url} 
                  alt={product.productName} 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}

              {/* Carousel Arrows */}
              {mediaList.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '16px',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--text)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                      zIndex: 5
                    }}
                  >
                    <ChevronRight size={22} />
                  </button>

                  <button 
                    onClick={handleNextImage}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '16px',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--text)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                      zIndex: 5
                    }}
                  >
                    <ChevronLeft size={22} />
                  </button>

                  {/* Dot Indicators */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '6px',
                    zIndex: 5,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {mediaList.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: activeImgIndex === idx ? 'var(--primary)' : 'rgba(255, 255, 255, 0.5)',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Gallery Thumbnails List (Supporting Videos & Images) */}
            {mediaList.length > 1 && (
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                overflowX: 'auto', 
                paddingBottom: '8px',
                scrollbarWidth: 'thin'
              }}>
                {mediaList.map((media, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: `2px solid ${activeImgIndex === idx ? 'var(--primary)' : 'var(--border)'}`,
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      backgroundColor: 'var(--background)',
                      position: 'relative'
                    }}
                  >
                    {media.type === 'video' ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {/* Play badge overlay */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(30, 28, 26, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#FFFFFF', fontSize: '1rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>▶</span>
                        </div>
                      </div>
                    ) : (
                      <img src={media.url} alt="גלריה ממוזערת" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LEFT COLUMN: Details & Specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Breadcrumbs & Brand */}
            <div>
              <div style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>בית</span>
                <span>&lt;</span>
                <span>גאדג'טים</span>
                <span>&lt;</span>
                <span>{product.categoryName}</span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#C5A880', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                טק-זון ★
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', lineHeight: 1.25 }}>
                {product.productName}
              </h2>
              
              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} fill="#C5A880" color="#C5A880" />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{product.rating.toFixed(1)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>• {product.reviewsCount} חוות דעת של לקוחות מרוצים</span>
              </div>
            </div>

            {/* Price Box */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '12px',
              padding: '16px 20px',
              backgroundColor: 'var(--background)',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatPrice(selectedVariant.price)}
              </span>
              {product.originalPrice > 0 && (
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                  {formatPrice(selectedVariant.price * 1.3)}
                </span>
              )}
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} />
                במלאי
              </span>
            </div>

            {/* Color/Variant Selection pills */}
            {product.variants && product.variants.length > 1 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  בחר צבע / דגם:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {product.variants.map((v) => (
                    <button
                      key={v.sku}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: selectedVariant.sku === v.sku ? 'rgba(197, 168, 128, 0.08)' : 'var(--card)',
                        border: `1.5px solid ${selectedVariant.sku === v.sku ? 'var(--primary)' : 'var(--border)'}`,
                        color: selectedVariant.sku === v.sku ? 'var(--primary)' : 'var(--text)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '0.85rem'
                      }}
                    >
                      {v.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart button */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                border: '1px solid var(--border)', 
                borderRadius: '10px', 
                padding: '8px 16px', 
                backgroundColor: 'var(--card)' 
              }}>
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  fontSize: '1.05rem', 
                  borderRadius: '10px',
                  boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.15)',
                  minWidth: '200px'
                }}
              >
                <ShoppingCart size={20} />
                הוסף לעגלה
              </button>
            </div>

            {/* Shipping selection area */}
            <div style={{
              marginTop: '10px',
              padding: '16px',
              backgroundColor: 'var(--background)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.88rem' }}>
                <Truck size={16} color="var(--primary)" />
                <span>אפשרויות משלוח מ-CJ Dropshipping:</span>
              </div>
              
              {loadingShipping ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '12px 0' }}>
                  <RefreshCw size={14} style={{ animation: 'spin 1.5s infinite linear' }} />
                  <span>מחשב עלויות שילוח בזמן אמת...</span>
                </div>
              ) : shippingOptions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {shippingOptions.map((opt, idx) => (
                    <label 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '10px 12px',
                        backgroundColor: selectedOptionIndex === idx ? 'rgba(197, 168, 128, 0.04)' : 'var(--card)',
                        border: '1px solid ' + (selectedOptionIndex === idx ? 'var(--primary)' : 'var(--border)'),
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="shipping" 
                        checked={selectedOptionIndex === idx} 
                        onChange={() => setSelectedOptionIndex(idx)} 
                        style={{ accentColor: 'var(--primary)' }} 
                      />
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>{opt.name}</span>
                          <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>({opt.days})</span>
                        </div>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{formatPrice(opt.price)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  לא נמצאו שיטות משלוח זמינות לישראל.
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                זמן אספקה מוערך לישראל: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{shippingDays}</span> (כולל מספר מעקב).
              </div>
            </div>

            {/* Trust Badges */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border)',
              paddingTop: '16px',
              flexWrap: 'wrap'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="var(--success)" />
                סליקה מאובטחת SSL
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={16} color="var(--primary)" />
                סנכרון מלאי CJ
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} color="#C5A880" />
                כולל מעקב שילוח
              </span>
            </div>

            {/* Bulleted Description Spec Box from mockup */}
            {specLines.length > 0 && (
              <div style={{
                marginTop: '16px',
                borderTop: '1px solid var(--border)',
                paddingTop: '20px'
              }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>
                  תיאור המוצר ומפרט טכני
                </h3>
                <ul style={{
                  paddingRight: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  fontSize: '0.88rem',
                  listStyleType: 'disc'
                }}>
                  {specLines.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
