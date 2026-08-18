import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Calendar, Truck, Clipboard, MapPin, Check, Search, Filter, SlidersHorizontal, Sliders, BarChart3, LayoutDashboard, ShoppingCart, Users, Settings } from 'lucide-react';

export const OrdersList: React.FC = () => {
  const { orders, setPage, formatPrice, setAdminSubTab } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('הכל');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  // Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filter by Status
      if (statusFilter !== 'הכל' && order.status !== statusFilter) {
        return false;
      }
      
      // Filter by Search Query (ID, Tracking, Name)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesId = order.orderId.toLowerCase().includes(q) || 
                          order.cjOrderId.toLowerCase().includes(q);
        const matchesTracking = order.trackingNumber.toLowerCase().includes(q);
        const matchesCustomer = order.shippingInfo.name.toLowerCase().includes(q) || 
                                order.shippingInfo.city.toLowerCase().includes(q);
        
        return matchesId || matchesTracking || matchesCustomer;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* Top Admin Header Bar (Unified layout for Admin pages) */}
      <div style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        marginTop: '-20px',
        marginBottom: '30px',
        padding: '12px 0'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Navigation tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <span onClick={() => setPage('store')} style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LayoutDashboard size={16} />
              חנות
            </span>
            <span onClick={() => { setAdminSubTab('products'); setPage('admin'); }} style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingCart size={16} />
              מוצרים
            </span>
            <span 
              onClick={() => setPage('orders')}
              style={{ 
                padding: '8px 16px', 
                color: 'var(--primary)', 
                fontSize: '0.9rem', 
                fontWeight: 700,
                borderBottom: '2.5px solid var(--primary)', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
            >
              <Settings size={16} />
              הזמנות
            </span>
            <span style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} />
              לקוחות
            </span>
            <span onClick={() => { setAdminSubTab('settings'); setPage('admin'); }} style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={16} />
              הגדרות
            </span>
            <span style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={16} />
              דוחות
            </span>
          </div>

          {/* Admin Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>אדמין - דוד</span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#EAE6DF',
              backgroundImage: 'url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80")',
              backgroundSize: 'cover',
              border: '2px solid var(--border)'
            }} />
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Page Title & Count */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>מעקב הזמנות גאדג'טים</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {orders.length} הזמנות סה"כ
          </span>
        </div>

        {/* Filters and Search Row */}
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: 'var(--shadow)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <input 
              type="text" 
              placeholder="חפש הזמנה, מספר מעקב..." 
              className="input-field" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: '44px' }}
            />
            <Search size={18} color="var(--text-muted)" style={{
              position: 'absolute',
              top: '50%',
              right: '16px',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Filter badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Filter size={14} />
              <span>סטטוס:</span>
            </div>
            
            <div style={{ display: 'flex', gap: '6px' }}>
              {['הכל', 'נשלח', 'בהמתנה'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: statusFilter === status ? 700 : 500,
                    backgroundColor: statusFilter === status ? 'rgba(197, 168, 128, 0.08)' : 'var(--card)',
                    border: `1px solid ${statusFilter === status ? 'var(--primary)' : 'var(--border)'}`,
                    color: statusFilter === status ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Cards List */}
        {filteredOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            color: 'var(--text-muted)',
            boxShadow: 'var(--shadow)'
          }}>
            <Package size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>לא נמצאו הזמנות תואמות לחיפוש שלך.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredOrders.map((order) => (
              <div key={order.orderId} style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Order Top Header */}
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--background)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>מזהה הזמנה מקומי:</span>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{order.orderId}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>מזהה CJ Dropshipping:</span>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary)' }}>{order.cjOrderId}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <Calendar size={14} />
                      <span>{formatDate(order.date)}</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className="badge" style={{
                    backgroundColor: order.status === 'נשלח' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: order.status === 'נשלח' ? 'var(--success)' : '#D97706',
                    border: `1px solid ${order.status === 'נשלח' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    {order.status}
                  </span>
                </div>

                {/* Card Internal Grid */}
                <div style={{
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px'
                }}>
                  {/* Column 1: Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                      מוצרים שהוזמנו
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>{item.productName}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                              דגם: {item.variantColor} • כמות: {item.quantity}
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--text)', marginRight: '12px' }}>
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
                      marginTop: 'auto', 
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: 'var(--text)'
                    }}>
                      <span>סה"כ הזמנה:</span>
                      <span style={{ color: 'var(--primary)' }}>{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>

                  {/* Column 2: Customer Address & Tracking Details */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    {/* Shipping address */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 700, display: 'block', color: 'var(--text)', marginBottom: '4px' }}>כתובת נמען למשלוח:</span>
                        <span style={{ fontWeight: 600 }}>{order.shippingInfo.name}</span>
                        <span style={{ display: 'block', color: 'var(--text-muted)', marginTop: '2px' }}>{order.shippingInfo.address}, {order.shippingInfo.city}</span>
                        <span style={{ display: 'block', color: 'var(--text-muted)' }}>טלפון: {order.shippingInfo.phone}</span>
                      </div>
                    </div>

                    {/* CJ Connection details */}
                    <div style={{
                      borderTop: '1px solid var(--border)',
                      paddingTop: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '0.82rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>מספר מעקב (Tracking):</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#55AAAA' }}>{order.trackingNumber}</span>
                          <button 
                            onClick={() => copyToClipboard(order.trackingNumber, 'tr-' + order.orderId)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                            title="העתק מספר מעקב"
                          >
                            {copiedId === 'tr-' + order.orderId ? <Check size={14} color="var(--success)" /> : <Clipboard size={14} />}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--success)', fontSize: '0.74rem', marginTop: '4px' }}>
                        <Truck size={14} />
                        <span>נשלח באמצעות CJPacket Ordinary. זמן אספקה צפוי: 10-16 יום.</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
