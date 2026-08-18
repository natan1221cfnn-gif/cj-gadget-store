import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Package, MapPin, Truck, Check, Clipboard, Calendar } from 'lucide-react';

export const TrackOrder: React.FC = () => {
  const { trackOrder, formatPrice } = useApp();
  const [orderInput, setOrderInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setTrackingData(null);

    try {
      const res = await trackOrder(orderInput);
      setTrackingData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'ההזמנה לא נמצאה במערכת. אנא ודא כי הזנת מספר תקין.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '80px', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: '750px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>מעקב משלוחים</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            הזן את מספר ההזמנה שלך (למשל: <code>TZ-123456</code>) כדי לקבל עדכון חי על מיקום החבילה.
          </p>
        </div>

        {/* Search Card */}
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow)',
          marginBottom: '30px'
        }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="text" 
                placeholder="הקלד מספר הזמנה או מספר מעקב..." 
                className="input-field" 
                value={orderInput}
                onChange={e => setOrderInput(e.target.value)}
                style={{ paddingRight: '44px', direction: 'ltr', textAlign: 'left' }}
                disabled={loading}
              />
              <Package size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                top: '50%',
                right: '16px',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }} />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !orderInput.trim()}
              style={{ borderRadius: '10px', padding: '12px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {loading ? (
                <RefreshCw size={16} style={{ animation: 'spin 1.5s infinite linear' }} />
              ) : <Search size={16} />}
              {loading ? 'מאתר...' : 'חפש הזמנה'}
            </button>
          </form>

          {errorMsg && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px 16px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              fontSize: '0.88rem'
            }}>
              {errorMsg}
            </div>
          )}
        </div>

        {/* Tracking Details Display */}
        {trackingData && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header info */}
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>סטטוס נוכחי:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {trackingData.status}
                </span>
              </div>

              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>זמן אספקה מוערך:</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                  10-16 ימי עסקים מיום הרכישה
                </span>
              </div>
            </div>

            {/* Split layout: Timeline on right/left, Order details on the other */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              
              {/* TIMELINE COLUMN */}
              <div style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: 'var(--shadow)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} color="var(--primary)" />
                  ציר זמן התקדמות המשלוח
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingRight: '12px' }}>
                  {/* Vertical line connector */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '16px',
                    bottom: '10px',
                    width: '2px',
                    backgroundColor: 'var(--border)',
                    zIndex: 1
                  }} />

                  {trackingData.timeline.map((step: any, idx: number) => (
                    <div key={idx} style={{
                      display: 'flex',
                      gap: '16px',
                      position: 'relative',
                      zIndex: 2,
                      marginBottom: idx === trackingData.timeline.length - 1 ? 0 : '24px',
                      opacity: step.completed ? 1 : 0.45
                    }}>
                      {/* Circle bubble indicator */}
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: step.completed ? 'var(--primary)' : 'var(--card)',
                        border: `2px solid ${step.completed ? 'var(--primary)' : 'var(--border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: step.completed ? '#1E293B' : 'var(--text-muted)',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                      }}>
                        {step.completed ? <Check size={16} strokeWidth={3} /> : <span style={{ fontSize: '0.85rem' }}>{idx + 1}</span>}
                      </div>

                      {/* Step details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '2px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>
                          {step.title}
                        </span>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                          {step.description}
                        </p>
                        {step.date && (
                          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {step.date}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DETAILS COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Shipping & Courier Info */}
                <div style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', margin: 0 }}>
                    פרטי שילוח ומעקב ספק
                  </h3>

                  {/* Tracking ID with copy */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>מספר מעקב (Tracking):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#55AAAA', fontSize: '0.92rem' }}>
                        {trackingData.trackingNumber}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(trackingData.trackingNumber)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}
                        title="העתק מספר מעקב"
                      >
                        {copied ? <Check size={14} color="var(--success)" /> : <Clipboard size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 700, display: 'block', color: 'var(--text)', marginBottom: '4px' }}>כתובת יעד למשלוח:</span>
                      <span style={{ fontWeight: 600 }}>{trackingData.shippingInfo.name}</span>
                      <span style={{ display: 'block', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {trackingData.shippingInfo.address}, {trackingData.shippingInfo.city}
                      </span>
                      <span style={{ display: 'block', color: 'var(--text-muted)' }}>
                        טלפון: {trackingData.shippingInfo.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items in Order */}
                <div style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', margin: 0 }}>
                    מוצרים בחבילה
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {trackingData.items.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{item.productName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            דגם: {item.variantColor} • כמות: {item.quantity}
                          </span>
                        </div>
                        <span style={{ fontWeight: 700 }}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    borderTop: '1px solid var(--border)', 
                    paddingTop: '12px', 
                    marginTop: '8px', 
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: 'var(--text)'
                  }}>
                    <span>סה"כ שולם:</span>
                    <span style={{ color: 'var(--primary)' }}>{formatPrice(trackingData.totalPrice)}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Helper spin component placeholder for Vite types
const RefreshCw: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 16, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);
