import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Send, HelpCircle, Mail, Phone, Clock, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export const Support: React.FC = () => {
  const { submitContact } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // FAQ states - index of open FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(prev => (prev === idx ? null : idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setErrorMsg('נא למלא את כל שדות החובה (שם, אימייל והודעה)');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await submitContact({ name, email, phone, orderId, message });
      setSuccessMsg(res.message || 'הודעתך התקבלה בהצלחה!');
      setName('');
      setEmail('');
      setPhone('');
      setOrderId('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'אירעה שגיאה בשליחת הפנייה. אנא נסה שנית.');
    } finally {
      setLoading(false);
    }
  };

  const faqs: FaqItem[] = [
    {
      q: 'תוך כמה זמן מגיע המשלוח לישראל?',
      a: 'כל הגאדג\'טים באתר נשלחים ישירות ממרכז הלוגיסטיקה הבינלאומי של ספק העל CJ Dropshipping. זמן השילוח הממוצע לישראל הוא בין 10 ל-16 ימי עסקים (לא כולל שבתות וחגים). כל משלוח כולל מספר מעקב רשמי המאפשר מעקב מלא עד לפתח ביתך.'
    },
    {
      q: 'האם אצטרך לשלם מע"מ או מכס על ההזמנה?',
      a: 'על פי פקודת המכס בישראל, ייבוא אישי של מוצרים שערכם הכולל נמוך מ-75$ פטור לחלוטין מתשלום מע"מ ומכס. כל הגאדג\'טים הנמכרים אצלנו מתומחרים בנפרד מתחת לרף זה, כך שלא תידרש לשלם שום עלות נוספת עם הגעת החבילה לארץ.'
    },
    {
      q: 'כיצד ניתן לבטל או לשנות כתובת בהזמנה?',
      a: 'מכיוון שההזמנות באתר מנותבות אוטומטית לעיבוד, אריזה ושילוח מהיר מול מחסני CJ בסין, ניתן לבקש ביטול או שינוי כתובת תוך 12 שעות לכל היותר מרגע הרכישה. במידה ועבר זמן רב יותר, החבילה כבר נשלחה ולא נוכל לעצור אותה. במקרה של צורך דחוף בשינוי, פנה אלינו מיד באמצעות טופס זה.'
    },
    {
      q: 'האם המוצרים מגיעים עם אחריות?',
      a: 'בוודאי! כל הגאדג\'טים הטכנולוגיים ב-TechZone מגיעים עם אחריות מלאה של 12 חודשים מיום המסירה. האחריות מכסה תקלות טכניות, פגמי ייצור או בעיות תפקוד פנימיות. האחריות אינה מכסה שבר פיזי, רטיבות או נזק שנגרם משימוש לא סביר.'
    },
    {
      q: 'מהיכן נשלחים המוצרים שלי?',
      a: 'אנו משתפים פעולה עם מחסני השילוח הרשמיים של CJ Dropshipping הממוקמים בסין (ייוואו ושנזן) המיועדים למסחר אלקטרוני מהיר. שיתוף פעולה זה מאפשר לנו להציע מוצרים מקוריים ישירות מהיצרן במחירי סיטונאות תחרותיים ללא פערי תיווך מקומיים.'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>מרכז תמיכה ושירות לקוחות</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            אנחנו כאן כדי לעזור לך! מצא תשובות לשאלות נפוצות או שלח לנו פנייה ישירה ונחזור אלייך בהקדם.
          </p>
        </div>

        {/* Layout grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          
          {/* COLUMN 1: Contact Form */}
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: 'var(--shadow)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} color="var(--primary)" />
              שלח לנו הודעה
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>שם מלא <span style={{ color: 'var(--error)' }}>*</span>:</label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder="ישראל ישראלי"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>אימייל לחזרה <span style={{ color: 'var(--error)' }}>*</span>:</label>
                <input 
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>טלפון (אופציונלי):</label>
                  <input 
                    type="tel"
                    className="input-field"
                    placeholder="0501234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>מספר הזמנה (אופציונלי):</label>
                  <input 
                    type="text"
                    className="input-field"
                    placeholder="TZ-123456"
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                    disabled={loading}
                    style={{ direction: 'ltr', textAlign: 'left' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>תוכן ההודעה <span style={{ color: 'var(--error)' }}>*</span>:</label>
                <textarea 
                  className="input-field"
                  placeholder="כיצד נוכל לעזור לך?"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  disabled={loading}
                  rows={4}
                  style={{ resize: 'vertical', fontFamily: 'inherit', padding: '12px 16px' }}
                />
              </div>

              {errorMsg && (
                <div style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: 'var(--success)', 
                  fontSize: '0.88rem', 
                  backgroundColor: 'rgba(16, 185, 129, 0.05)', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  border: '1px solid var(--success)' 
                }}>
                  <CheckCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !name || !email || !message}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  fontSize: '1rem', 
                  borderRadius: '10px', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.15)'
                }}
              >
                {loading ? (
                  <RefreshCw size={16} style={{ animation: 'spin 1.5s infinite linear' }} />
                ) : <Send size={16} />}
                {loading ? 'שולח פנייה...' : 'שלח פנייה כעת'}
              </button>
            </form>
          </div>

          {/* COLUMN 2: FAQ Accordions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} color="var(--primary)" />
              שאלות נפוצות (FAQ)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={idx}
                    style={{
                      backgroundColor: 'var(--card)',
                      border: `1.5px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.25s ease',
                      boxShadow: isOpen ? '0 4px 15px rgba(var(--primary-rgb), 0.04)' : 'none'
                    }}
                  >
                    {/* FAQ Question Header */}
                    <button
                      onClick={() => toggleFaq(idx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'right',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color: isOpen ? 'var(--primary)' : 'var(--text)',
                        fontFamily: 'inherit'
                      }}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* FAQ Answer Content */}
                    <div style={{
                      maxHeight: isOpen ? '250px' : '0',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderTop: isOpen ? '1px solid var(--border)' : 'none',
                      backgroundColor: 'var(--background)'
                    }}>
                      <p style={{
                        padding: '16px 20px',
                        margin: 0,
                        fontSize: '0.88rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                        textAlign: 'justify'
                      }}>
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Quick contact details card */}
            <div style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--primary)" />
                <span>מענה טלפוני (וואטסאפ): <strong style={{ color: 'var(--text)' }}>050-1234567</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} color="var(--primary)" />
                <span>שעות פעילות: <strong style={{ color: 'var(--text)' }}>א\'-ה\': 09:00 - 18:00</strong></span>
              </div>
            </div>
          </div>

        </div>
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
