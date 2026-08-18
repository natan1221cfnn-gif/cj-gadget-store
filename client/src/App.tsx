import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Storefront } from './pages/Storefront';
import { ProductDetail } from './pages/ProductDetail';
import { AdminSettings } from './pages/AdminSettings';
import { OrdersList } from './pages/OrdersList';
import { TrackOrder } from './pages/TrackOrder';
import { Support } from './pages/Support';
import { CheckoutModal } from './components/CheckoutModal';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activePage, selectedProduct, setSelectedProduct } = useApp();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const renderPage = () => {
    if (selectedProduct) {
      return (
        <ProductDetail 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      );
    }

    switch (activePage) {
      case 'store':
        return <Storefront />;
      case 'track':
        return <TrackOrder />;
      case 'support':
        return <Support />;
      case 'orders':
        return <OrdersList />;
      case 'admin':
        return <AdminSettings />;
      default:
        return <Storefront />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingTop: '20px' }}>
        {renderPage()}
      </main>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
      )}

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--card)',
        borderTop: '1px solid var(--border)',
        padding: '50px 0 30px 0',
        marginTop: 'auto',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '30px',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '30px',
            marginBottom: '20px'
          }}>
            <div>
              <h3 style={{ color: 'var(--text)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>TechZone (טק-זון)</h3>
              <p style={{ maxWidth: '450px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                חנות הגאדג'טים החכמה שלך. כל המוצרים מסונכרנים ישירות מול המחסנים של CJ Dropshipping ברחבי העולם ומבוצעים עם ניתוב הזמנות אוטומטי.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={24} color="#C5A880" />
                <div>
                  <span style={{ color: 'var(--text)', fontWeight: 600, display: 'block' }}>רכישה בטוחה</span>
                  <span style={{ fontSize: '0.75rem' }}>סליקה מאובטחת SSL</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={24} color="#C5A880" />
                <div>
                  <span style={{ color: 'var(--text)', fontWeight: 600, display: 'block' }}>שילוח גלובלי מהיר</span>
                  <span style={{ fontSize: '0.75rem' }}>מספרי מעקב לכל הזמנה</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RotateCcw size={24} color="#C5A880" />
                <div>
                  <span style={{ color: 'var(--text)', fontWeight: 600, display: 'block' }}>מדיניות החזרות</span>
                  <span style={{ fontSize: '0.75rem' }}>החזר כספי תוך 30 יום</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            color: 'var(--text-muted)'
          }}>
            <span>© 2026 טק-זון איקומרס בע"מ. כל הזכויות שמורות.</span>
            <span>מבוסס CJ Dropshipping API Integration.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
