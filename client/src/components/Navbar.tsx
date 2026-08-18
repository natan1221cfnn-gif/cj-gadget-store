import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Settings, Package, Trash2, X, Plus, Minus, CreditCard, Heart, User, Search, Menu, HelpCircle, Truck, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenCheckout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCheckout }) => {
  const { cart, activePage, setPage, removeFromCart, updateCartQuantity, apiSettings, formatPrice, setAdminSubTab } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleMobileNav = (page: 'store' | 'admin' | 'orders' | 'track' | 'support', subTab?: 'settings' | 'products') => {
    if (subTab) setAdminSubTab(subTab);
    setPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        height: '74px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          {/* Right side: Logo & Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mobile Hamburger Button */}
            <button 
              className="nav-mobile-btn" 
              onClick={toggleMobileMenu}
              aria-label="פתח תפריט"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setPage('store')}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.2rem',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.15)'
              }}>
                TZ
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>טק-זון</h1>
                <span className="hide-on-mobile" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>חנות גאדג'טים חכמה</span>
              </div>
            </div>
          </div>

          {/* Middle: Desktop Navigation Links */}
          <nav className="nav-desktop">
            <button 
              onClick={() => setPage('store')}
              style={{
                background: 'none',
                border: 'none',
                color: activePage === 'store' ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.95rem',
                fontWeight: activePage === 'store' ? 700 : 500,
                cursor: 'pointer',
                padding: '8px 0',
                borderBottom: `2px solid ${activePage === 'store' ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.2s ease'
              }}
            >
              כל הגאדג'טים
            </button>
            <button 
              onClick={() => setPage('track')}
              style={{
                background: 'none',
                border: 'none',
                color: activePage === 'track' ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.95rem',
                fontWeight: activePage === 'track' ? 700 : 500,
                cursor: 'pointer',
                padding: '8px 0',
                borderBottom: `2px solid ${activePage === 'track' ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.2s ease'
              }}
            >
              מעקב משלוחים
            </button>
            <button 
              onClick={() => setPage('support')}
              style={{
                background: 'none',
                border: 'none',
                color: activePage === 'support' ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.95rem',
                fontWeight: activePage === 'support' ? 700 : 500,
                cursor: 'pointer',
                padding: '8px 0',
                borderBottom: `2px solid ${activePage === 'support' ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.2s ease'
              }}
            >
              תמיכה וצור קשר
            </button>
            <button 
              onClick={() => setPage('orders')}
              style={{
                background: 'none',
                border: 'none',
                color: activePage === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.95rem',
                fontWeight: activePage === 'orders' ? 700 : 500,
                cursor: 'pointer',
                padding: '8px 0',
                borderBottom: `2px solid ${activePage === 'orders' ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.2s ease'
              }}
            >
              הזמנות מערכת
            </button>
            <button 
              onClick={() => { setAdminSubTab('settings'); setPage('admin'); }}
              style={{
                background: 'none',
                border: 'none',
                color: activePage === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.95rem',
                fontWeight: activePage === 'admin' ? 700 : 500,
                cursor: 'pointer',
                padding: '8px 0',
                borderBottom: `2px solid ${activePage === 'admin' ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              הגדרות API
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: apiSettings.isConnected ? 'var(--success)' : '#FFA500',
                display: 'inline-block'
              }} title={apiSettings.isConnected ? 'מחובר ל-CJ API' : 'מצב סימולציה (לא מחובר)'} />
            </button>
          </nav>

          {/* Left side: Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Search Icon */}
            <button 
              onClick={() => {
                setPage('store');
                setTimeout(() => {
                  const el = document.getElementById('search-input');
                  if (el) el.focus();
                }, 100);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
              title="חיפוש גאדג'טים"
            >
              <Search size={20} style={{ strokeWidth: 1.8 }} />
            </button>

            {/* Wishlist Icon */}
            <button 
              className="hide-on-mobile"
              onClick={() => alert('רשימת משאלות (סימולציה)')}
              style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
              title="רשימת משאלות"
            >
              <Heart size={20} style={{ strokeWidth: 1.8 }} />
            </button>

            {/* Profile/Admin Icon */}
            <button 
              className="hide-on-mobile"
              onClick={() => setPage('admin')}
              style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
              title="חשבון אדמין"
            >
              <User size={20} style={{ strokeWidth: 1.8 }} />
            </button>

            {/* Separator (Desktop) */}
            <span className="hide-on-mobile" style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }}></span>

            {/* Cart Icon Button */}
            <button 
              className="btn btn-secondary" 
              onClick={toggleCart} 
              style={{ 
                position: 'relative', 
                width: '40px', 
                height: '40px', 
                padding: 0,
                borderRadius: '10px',
                border: '1px solid var(--border)'
              }}
            >
              <ShoppingBag size={19} style={{ strokeWidth: 1.8 }} />
              {cartItemsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-start'
        }} onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="animate-slide-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '82%',
              maxWidth: '320px',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 20px',
              direction: 'rtl',
              overflowY: 'auto'
            }}
          >
            {/* Mobile Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: '#FFFFFF'
                }}>
                  TZ
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>טק-זון</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>תפריט ראשי</div>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Mobile Drawer Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <button 
                onClick={() => handleMobileNav('store')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activePage === 'store' ? 'var(--badge-bg)' : 'transparent',
                  color: activePage === 'store' ? 'var(--primary)' : 'var(--text)',
                  fontWeight: activePage === 'store' ? 700 : 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textAlign: 'right'
                }}
              >
                <Layers size={18} />
                כל הגאדג'טים
              </button>

              <button 
                onClick={() => handleMobileNav('track')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activePage === 'track' ? 'var(--badge-bg)' : 'transparent',
                  color: activePage === 'track' ? 'var(--primary)' : 'var(--text)',
                  fontWeight: activePage === 'track' ? 700 : 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textAlign: 'right'
                }}
              >
                <Truck size={18} />
                מעקב משלוחים
              </button>

              <button 
                onClick={() => handleMobileNav('support')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activePage === 'support' ? 'var(--badge-bg)' : 'transparent',
                  color: activePage === 'support' ? 'var(--primary)' : 'var(--text)',
                  fontWeight: activePage === 'support' ? 700 : 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textAlign: 'right'
                }}
              >
                <HelpCircle size={18} />
                תמיכה וצור קשר
              </button>

              <button 
                onClick={() => handleMobileNav('orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activePage === 'orders' ? 'var(--badge-bg)' : 'transparent',
                  color: activePage === 'orders' ? 'var(--primary)' : 'var(--text)',
                  fontWeight: activePage === 'orders' ? 700 : 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textAlign: 'right'
                }}
              >
                <Package size={18} />
                הזמנות מערכת
              </button>

              <button 
                onClick={() => handleMobileNav('admin', 'settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activePage === 'admin' ? 'var(--badge-bg)' : 'transparent',
                  color: activePage === 'admin' ? 'var(--primary)' : 'var(--text)',
                  fontWeight: activePage === 'admin' ? 700 : 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textAlign: 'right'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Settings size={18} />
                  הגדרות API וניהול
                </div>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: apiSettings.isConnected ? 'var(--success)' : '#FFA500'
                }} />
              </button>
            </div>

            {/* Mobile Drawer Footer */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => { setIsMobileMenuOpen(false); toggleCart(); }}
                style={{ width: '100%', padding: '12px' }}
              >
                <ShoppingBag size={18} />
                עגלת קניות ({cartItemsCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar (Drawer) */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.15)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-start' // Slide in from Left in RTL
        }} onClick={toggleCart}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: 'var(--card)',
            height: '100vh',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.3s ease'
          }} onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700 }}>
                <ShoppingBag size={20} color="var(--primary)" />
                עגלת קניות ({cartItemsCount})
              </h3>
              <button className="btn btn-secondary" onClick={toggleCart} style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {cart.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '70%',
                  color: 'var(--text-muted)'
                }}>
                  <ShoppingBag size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
                  <p style={{ fontSize: '1rem', fontWeight: 500 }}>עגלת הקניות שלך ריקה</p>
                  <button className="btn btn-primary" onClick={() => { toggleCart(); setPage('store'); }} style={{ marginTop: '20px', fontSize: '0.85rem' }}>
                    להמשך קניות
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.map((item, idx) => (
                    <div key={`${item.variant.sku}-${idx}`} style={{
                      display: 'flex',
                      gap: '14px',
                      padding: '14px',
                      backgroundColor: 'var(--card)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      position: 'relative'
                    }}>
                      <img 
                        src={item.product.productImage} 
                        alt={item.product.productName} 
                        style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', backgroundColor: 'var(--background)' }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.product.productName}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          דגם: {item.variant.color}
                        </span>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          {/* Quantity Controls in soft beige style */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            border: '1px solid var(--border)', 
                            borderRadius: '6px', 
                            padding: '2px 6px',
                            backgroundColor: 'var(--background)' 
                          }}>
                            <button 
                              style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                              onClick={() => updateCartQuantity(item.variant.sku, item.quantity - 1)}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                            <button 
                              style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                              onClick={() => updateCartQuantity(item.variant.sku, item.quantity + 1)}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>
                            {formatPrice(item.variant.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Delete button top left */}
                      <button 
                        style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          left: '12px',
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--text-muted)', 
                          cursor: 'pointer', 
                          padding: '4px' 
                        }}
                        onClick={() => removeFromCart(item.variant.sku)}
                        title="הסר פריט"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div style={{
                padding: '24px',
                borderTop: '1px solid var(--border)',
                backgroundColor: 'var(--card)'
              }}>
                {/* Beige Subtotal Box from mockup */}
                <div style={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.95rem' }}>סה"כ לתשלום:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                
                {/* Elegant gold/orange action button */}
                <button 
                  className="btn" 
                  style={{ 
                    width: '100%', 
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    backgroundColor: '#E5B87F', 
                    color: '#1E293B',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(229, 184, 127, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setIsCartOpen(false);
                    onOpenCheckout();
                  }}
                >
                  <CreditCard size={18} />
                  מעבר לקופה
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
