import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const Storefront: React.FC = () => {
  const { products, loading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== 'הכל') {
      result = result.filter(p => p.categoryName === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.productName.toLowerCase().includes(q) || 
        (p.productNameEn && p.productNameEn.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort Products
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.sellPrice - b.sellPrice);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.sellPrice - a.sellPrice);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const slides = [
    {
      image: '/banner1.jpg',
      badge: 'סביבת עבודה חכמה',
      title: 'גאדג\'טים חכמים שישדרגו את סביבת העבודה שלך',
      description: 'פתרונות ארגון, מעמדי מחשב נייד וציוד היקפי מתקדם שישפרו את הנוחות והפרודוקטיביות שלך בכל יום עבודה.'
    },
    {
      image: '/banner2.jpg',
      badge: 'אביזרים לסלולר',
      title: 'אביזרי טעינה וגאדג\'טים מתקדמים לטלפון',
      description: 'מטענים אלחוטיים מגנטיים, מעמדים מעוצבים ואביזרי סאונד מבית מותגים מובילים בסינכרון מלא מול ספק dropshipping רשמי.'
    },
    {
      image: '/banner3.jpg',
      badge: 'חדשנות לבית ולמשרד',
      title: 'טכנולוגיה חכמה ואביזרי שולחן מובחרים',
      description: 'מנורות מסך חכמות, מעמדי טעינה מהירה מרובי מכשירים ומוצרים קטנים שעושים שינוי גדול ביומיום שלך.'
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Banner Carousel */}
      <section style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: '36px 0',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div className="hero-grid">
            {/* Left column: Text */}
            <div style={{
              maxWidth: '550px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <span className="badge" style={{ alignSelf: 'flex-start', backgroundColor: 'var(--badge-bg)', color: 'var(--primary)' }}>
                {slides[activeSlide].badge}
              </span>
              <h2 className="hero-title">
                {slides[activeSlide].title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, margin: 0, minHeight: '60px' }}>
                {slides[activeSlide].description}
              </p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                <a href="#catalog" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '10px' }}>
                  לכל המוצרים בקטלוג
                </a>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    const el = document.getElementById('search-input');
                    if (el) el.focus();
                  }}
                  style={{ padding: '10px 20px', borderRadius: '10px' }}
                >
                  חפש מוצר ספציפי
                </button>
              </div>

              {/* Pagination Dots */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`שקופית ${idx + 1}`}
                    style={{
                      width: activeSlide === idx ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: activeSlide === idx ? 'var(--primary)' : 'var(--border)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right column: 16:9 Image Slider */}
            <div style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '56.25%', // 16:9 ratio
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
              backgroundColor: 'var(--background)'
            }}>
              {slides.map((slide, idx) => (
                <img
                  key={idx}
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: activeSlide === idx ? 1 : 0,
                    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: activeSlide === idx ? 2 : 1
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Filters */}
      <section id="catalog" className="container" style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '16px',
          boxShadow: 'var(--shadow)'
        }}>
          {/* Top row: Search & Sorting */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <input 
                id="search-input"
                type="text" 
                placeholder="חפש גאדג'טים..." 
                className="input-field" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingRight: '42px', paddingLeft: '12px', height: '42px' }}
              />
              <Search size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                top: '50%',
                right: '14px',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }} />
            </div>

            {/* Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '9px 28px 9px 12px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239E9EAF\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'left 10px center',
                  backgroundSize: '14px'
                }}
              >
                <option value="featured">הכי פופולרי</option>
                <option value="price-asc">מחיר: מהנמוך לגבוה</option>
                <option value="price-desc">מחיר: מהגבוה לנמוך</option>
                <option value="rating">דירוג לקוחות</option>
              </select>
            </div>
          </div>

          {/* Bottom row: Categories */}
          <div style={{
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            gap: '8px',
            alignItems: 'center',
            borderTop: '1px solid var(--border)',
            paddingTop: '12px',
            WebkitOverflowScrolling: 'touch'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
              <SlidersHorizontal size={13} />
              סנן:
            </span>
            {['הכל', 'אביזרים לטלפון', 'גאדג\'טים למחשב'].map(cat => (
              <button 
                key={cat}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ padding: '6px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid of Products */}
      <section className="container">
        {loading ? (
          <div className="product-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                backgroundColor: 'var(--card)',
                height: '340px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                animation: 'pulse 1.5s infinite ease-in-out'
              }} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            color: 'var(--text-muted)'
          }}>
            <p style={{ fontSize: '1.05rem', marginBottom: '14px' }}>לא נמצאו גאדג'טים התואמים לחיפוש שלך.</p>
            <button className="btn btn-primary" onClick={() => { setSearchQuery(''); setSelectedCategory('הכל'); }}>
              אפס סינונים
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.pid} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Embedded CSS for pulsing skeleton and standard reset */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
