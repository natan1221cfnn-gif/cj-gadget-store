import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Truck, CheckCircle2, X, ShieldCheck } from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const { cart, checkout, formatPrice } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !phone || !address || !city) {
      setErrorMsg('נא למלא את כל שדות המשלוח');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      const createdOrder = await checkout({ name, phone, address, city });
      setOrderSuccess(createdOrder);
    } catch (err: any) {
      setErrorMsg(err.message || 'אירעה שגיאה בעיבוד ההזמנה. נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.15)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: orderSuccess ? '550px' : '900px', // Wider on checkout to fit 2 columns
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 800 }}>
            <CreditCard size={20} color="var(--primary)" />
            {orderSuccess ? 'הזמנתך הושלמה בהצלחה!' : 'מעבר לקופה ותשלום מאובטח'}
          </h3>
          {!isSubmitting && (
            <button className="btn btn-secondary" onClick={onClose} style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '80vh' }}>
          {orderSuccess ? (
            /* Success Screen */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', padding: '10px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)'
              }}>
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>הזמנה התקבלה במערכת!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  ההזמנה שולמה, נרשמה ונותבה אוטומטית לעיבוד ב-CJ Dropshipping למשלוח מהיר.
                </p>
              </div>

              {/* Local & CJ Order tracking details */}
              <div style={{
                width: '100%',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '0.9rem',
                textAlign: 'right'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>מספר הזמנה מקומי:</span>
                  <span style={{ fontWeight: 'bold' }}>{orderSuccess.orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>מזהה הזמנה ב-CJ:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{orderSuccess.cjOrderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>מספר מעקב למשלוח:</span>
                  <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#55AAAA' }}>{orderSuccess.trackingNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>סה"כ שולם:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{formatPrice(orderSuccess.totalPrice)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Truck size={14} />
                <span>מוצרים יישלחו מ-CJ לכתובת: {orderSuccess.shippingInfo.address}, {orderSuccess.shippingInfo.city}</span>
              </div>

              <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '10px', width: '100%', borderRadius: '10px' }}>
                חזרה לחנות
              </button>
            </div>
          ) : (
            /* Split 2 Columns Checkout Form */
            <form onSubmit={handleSubmit} style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '30px' 
            }}>
              
              {/* LEFT COLUMN: Shipping Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  פרטי משלוח ללקוח
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>שם מלא של הנמען:</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="ישראל ישראלי" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>מספר טלפון:</label>
                    <input 
                      type="tel" 
                      className="input-field" 
                      placeholder="0501234567" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 2 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>כתובת (רחוב ומספר בית):</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="הרצל 15, דירה 3" 
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>עיר:</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="תל אביב" 
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center' }}>
                    {errorMsg}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn" 
                  disabled={isSubmitting}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    marginTop: '10px',
                    backgroundColor: '#E5B87F', 
                    color: '#1E293B',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(229, 184, 127, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={18} />
                  {isSubmitting ? 'מעבד ומנתב הזמנה ל-CJ...' : 'בצע הזמנה מאובטחת'}
                </button>
              </div>

              {/* RIGHT COLUMN: Order Summary */}
              <div style={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px' }}>
                  סיכום הזמנה ({cart.length})
                </h4>
                
                {/* List of items */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px', 
                  maxHeight: '260px', 
                  overflowY: 'auto', 
                  marginBottom: '20px',
                  paddingLeft: '4px'
                }}>
                  {cart.map((item, idx) => (
                    <div key={`${item.variant.sku}-${idx}`} style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      alignItems: 'center', 
                      fontSize: '0.85rem',
                      backgroundColor: 'var(--card)',
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)'
                    }}>
                      <img 
                        src={item.product.productImage} 
                        alt={item.product.productName} 
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.product.productName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          דגם: {item.variant.color} • כמות: {item.quantity}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                        {formatPrice(item.variant.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Total box */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  borderTop: '1px solid var(--border)', 
                  paddingTop: '16px',
                  marginTop: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    <span>מחיר מוצרים:</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    <span>עלות משלוח:</span>
                    <span style={{ color: 'var(--success)' }}>חינם</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    borderTop: '1.5px solid var(--border)', 
                    paddingTop: '12px', 
                    marginTop: '6px', 
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: 'var(--text)'
                  }}>
                    <span>סה"כ לתשלום:</span>
                    <span style={{ color: 'var(--primary)' }}>{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
