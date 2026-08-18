import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Product } from '../context/AppContext';
import { Database, Key, Play, AlertCircle, CheckCircle, RefreshCw, XCircle, Sparkles, Sliders, BarChart3, LayoutDashboard, ShoppingCart, Users, Settings, Edit, Trash2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { 
    apiSettings, isSyncing, syncLogs, saveSettings, disconnectApi, syncProducts, 
    searchCj, importProducts, syncIncompleteDetails, formatPrice, importProductByUrl,
    products, updateProduct, deleteProduct, setPage, adminSubTab, setAdminSubTab
  } = useApp();

  const { apiKey, isConnected } = apiSettings;
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || '');
  const [markupPercentInput, setMarkupPercentInput] = useState('40');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [healMessage, setHealMessage] = useState('');

  // Search & Import States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchError, setSearchError] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  // Selection
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  // Direct Import via Link States
  const [directUrlInput, setDirectUrlInput] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [urlImportMessage, setUrlImportMessage] = useState('');

  // Editing Product states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editVideo, setEditVideo] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isUpdatingProd, setIsUpdatingProd] = useState(false);
  const [catalogMessage, setCatalogMessage] = useState('');

  React.useEffect(() => {
    if (apiKey) setApiKeyInput(apiKey);
    if (apiSettings.markupPercent !== undefined) {
      setMarkupPercentInput(String(apiSettings.markupPercent));
    }
  }, [apiSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const markupVal = parseInt(markupPercentInput) || 40;

    setIsConnecting(true);
    try {
      await saveSettings(apiKeyInput, markupVal);
      setSuccessMsg('ההגדרות נשמרו בהצלחה!');
    } catch (err: any) {
      setErrorMsg(err.message || 'החיבור ל-CJ נכשל. בדוק את מפתח ה-API.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleHealProducts = async () => {
    setIsHealing(true);
    setHealMessage('');
    try {
      const res = await syncIncompleteDetails();
      setHealMessage(`סונכרנו בהצלחה! ${res.count} מוצרים קיימים עודכנו בתמונות גלריה ותיאור מלא.`);
    } catch (err: any) {
      setHealMessage('שגיאה בהשלמת פרטים: ' + err.message);
    } finally {
      setIsHealing(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לנתק את החיבור ל-CJ Dropshipping? הקטלוג יחזור למצב סימולציה.')) {
      await disconnectApi();
      setApiKeyInput('');
      setSearchResults([]);
      setSelectedProducts([]);
      setTotalResults(0);
      setSearchKeyword('');
      setDirectUrlInput('');
      setUrlImportMessage('');
    }
  };

  const handleSearch = async (e?: React.FormEvent, page: number = 1) => {
    if (e) e.preventDefault();
    setSearchError('');
    setIsSearching(true);
    setSearchPage(page);
    
    try {
      const res = await searchCj(searchKeyword, page);
      setSearchResults(res.products);
      setTotalResults(res.total);
      if (res.products.length === 0) {
        setSearchError('לא נמצאו מוצרים תואמים לחיפוש ב-CJ');
      }
    } catch (err: any) {
      setSearchError(err.message || 'אירעה שגיאה בביצוע החיפוש מול CJ');
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSelect = (product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.some(p => p.pid === product.pid);
      if (exists) {
        return prev.filter(p => p.pid !== product.pid);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedProducts(prev => {
      const otherPageSelected = prev.filter(p => !searchResults.some(sr => sr.pid === p.pid));
      return [...otherPageSelected, ...searchResults];
    });
  };

  const handleSelectNone = () => {
    setSelectedProducts(prev => {
      return prev.filter(p => !searchResults.some(sr => sr.pid === p.pid));
    });
  };

  const handleImport = async () => {
    if (selectedProducts.length === 0) return;
    setIsImporting(true);
    setImportMessage('');
    try {
      await importProducts(selectedProducts);
      setImportMessage(`ייבוא הושלם! ${selectedProducts.length} מוצרים יובאו בהצלחה לקטלוג החנות.`);
      setSelectedProducts([]);
    } catch (err: any) {
      setImportMessage('שגיאה בייבוא המוצרים: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrlInput.trim()) return;

    setIsImportingUrl(true);
    setUrlImportMessage('');
    try {
      const res = await importProductByUrl(directUrlInput);
      setUrlImportMessage(`המוצר "${res.product?.productName || ''}" יובא בהצלחה מ-CJ!`);
      setDirectUrlInput('');
    } catch (err: any) {
      setUrlImportMessage('שגיאה בייבוא המוצר: ' + (err.message || 'חיבור רשת נכשל'));
    } finally {
      setIsImportingUrl(false);
    }
  };

  // Product Editing & Catalog management handlers
  const handleStartEdit = (prod: Product) => {
    setEditingProductId(prod.pid);
    setEditName(prod.productName);
    setEditPrice(String(prod.sellPrice));
    setEditVideo(prod.productVideo || '');
    setEditDesc(prod.description || '');
  };

  const handleSaveEdit = async (pid: string) => {
    setIsUpdatingProd(true);
    setCatalogMessage('');
    try {
      await updateProduct(pid, {
        productName: editName,
        sellPrice: parseFloat(editPrice) || 0,
        productVideo: editVideo,
        description: editDesc
      });
      setCatalogMessage('המוצר עודכן בהצלחה בקטלוג החנות!');
      setEditingProductId(null);
    } catch (err: any) {
      setCatalogMessage('שגיאה בעדכון המוצר: ' + (err.message || 'חיבור רשת נכשל'));
    } finally {
      setIsUpdatingProd(false);
    }
  };

  const handleDeleteProduct = async (pid: string, name: string) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את המוצר "${name}" לחלוטין מקטלוג החנות?`)) {
      setCatalogMessage('');
      try {
        await deleteProduct(pid);
        setCatalogMessage('המוצר נמחק בהצלחה מקטלוג החנות.');
      } catch (err: any) {
        setCatalogMessage('שגיאה במחיקת המוצר: ' + err.message);
      }
    }
  };

  // Render API settings and Import View
  const renderApiSettings = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Connection panels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1: API Key Config */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', margin: 0, fontWeight: 800 }}>
                <Key size={18} color="var(--primary)" />
                הגדרות מפתח API
              </h3>
              {isConnected && (
                <button 
                  onClick={handleDisconnect}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--error)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  נתק חיבור
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>API Key (מפתח API של CJ):</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="הדבק כאן את מפתח ה-API של CJ..." 
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                disabled={isConnecting}
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
            </div>
            
            <button 
              onClick={handleSave} 
              className="btn btn-primary" 
              disabled={isConnecting}
              style={{ marginTop: 'auto', alignSelf: 'flex-start', borderRadius: '8px', padding: '8px 16px' }}
            >
              {isConnecting ? 'מבצע אימות...' : isConnected ? 'עדכן מפתח' : 'חבר ואמת חשבון'}
            </button>
          </div>

          {/* Card 2: Markup profit margins */}
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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', margin: 0, fontWeight: 800 }}>
              <Sparkles size={18} color="#C5A880" />
              הגדרות מרווח רווח (%)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>שולי רווח מתווסף במכירה (%):</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="לדוגמא 40" 
                value={markupPercentInput}
                onChange={(e) => setMarkupPercentInput(e.target.value)}
                min="0"
                max="1000"
                style={{ maxWidth: '120px' }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                לדוגמא: מוצר שעולה $10 ב-CJ יימכר בחנות שלך ב-${(10 * (1 + (parseInt(markupPercentInput) || 40) / 100)).toFixed(2)} USD (לפני עלויות משלוח).
              </span>
            </div>

            <button 
              onClick={handleSave} 
              className="btn btn-secondary" 
              disabled={isConnecting}
              style={{ marginTop: 'auto', alignSelf: 'flex-start', borderRadius: '8px', padding: '8px 16px' }}
            >
              שמור הגדרות רווח
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', fontSize: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid var(--error)' }}>
            <XCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.85rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid var(--success)' }}>
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sync panel */}
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>
              <Database size={18} color="var(--primary)" />
              סנכרון קטלוג מוצרים
            </h3>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleHealProducts}
                disabled={isHealing || !isConnected}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
              >
                {isHealing ? (
                  <RefreshCw size={16} style={{ animation: 'spin 1.5s infinite linear' }} />
                ) : (
                  <Sparkles size={16} />
                )}
                {isHealing ? 'משלים פרטים...' : 'השלם תמונות ותיאורים למוצרים קיימים'}
              </button>

              <button 
                className="btn btn-primary" 
                onClick={syncProducts}
                disabled={isSyncing}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
              >
                {isSyncing ? (
                  <RefreshCw size={16} style={{ animation: 'spin 1.5s infinite linear' }} />
                ) : (
                  <Play size={16} />
                )}
                {isSyncing ? 'מסתנכרן כעת...' : 'הפעל סנכרון מוצרים'}
              </button>
            </div>
          </div>

          {healMessage && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid var(--success)',
              color: 'var(--success)', 
              fontSize: '0.9rem', 
              marginBottom: '16px' 
            }}>
              {healMessage}
            </div>
          )}

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
            לחיצה על כפתור הסנכרון תעדכן מחירים ומלאים בהתאם להגדרות, ותסנכרן את מסד הנתונים מול CJ Dropshipping.
          </p>

          {/* Sync logs */}
          {syncLogs.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', fontWeight: 700 }}>לוג סנכרון (זמן אמת):</h4>
              <div style={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: 'var(--text)',
                maxHeight: '160px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                textAlign: 'left',
                direction: 'ltr'
              }}>
                {syncLogs.map((log, idx) => (
                  <div key={idx}>&gt; {log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CJ Search & Import Section */}
        <div style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow)'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', marginBottom: '12px', fontWeight: 800 }}>
            <Database size={18} color="var(--primary)" />
            ייבוא מוצרים מ-CJ
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '20px' }}>
            הקלד מילת מפתח באנגלית (למשל: <code>smart plug</code> או <code>backpack</code>) כדי לחפש בקטלוג של CJ Dropshipping ולייבא ישירות.
          </p>

          <form onSubmit={(e) => handleSearch(e, 1)} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <input 
                type="text"
                placeholder="הקלד שם מוצר באנגלית לחיפוש ב-CJ..."
                className="input-field"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSearching || !searchKeyword.trim()} style={{ borderRadius: '8px' }}>
              {isSearching ? (
                <RefreshCw size={16} style={{ animation: 'spin 1.5s infinite linear' }} />
              ) : 'חפש מוצרים'}
            </button>
          </form>

          {/* Direct URL Import */}
          <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0 20px 0', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
              ייבוא ישיר לפי קישור או מזהה מוצר מ-CJ
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '14px', lineHeight: 1.4 }}>
              הדבק את הקישור המלא למוצר מ-CJ (או מזהה מוצר PID) כדי לייבא אותו באופן מיידי לקטלוג שלך.
              המערכת תשלוף את כל התמונות, סרטוני הוידאו (אם קיימים), המפרט המלא, תתרגם את השדות לעברית ותתמחר בהתאם לשולי הרווח.
            </p>
            <form onSubmit={handleImportByUrl} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="text"
                  placeholder="הדבק קישור למוצר מ-CJ... (למשל: https://cjdropshipping.com/product/led-wireless-...)"
                  className="input-field"
                  value={directUrlInput}
                  onChange={e => setDirectUrlInput(e.target.value)}
                  style={{ direction: 'ltr', textAlign: 'left' }}
                  disabled={isImportingUrl}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-secondary" 
                disabled={isImportingUrl || !directUrlInput.trim()}
                style={{ borderRadius: '8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {isImportingUrl ? (
                  <RefreshCw size={14} style={{ animation: 'spin 1.5s infinite linear' }} />
                ) : <Sparkles size={14} />}
                {isImportingUrl ? 'מייבא מוצר...' : 'ייבא מוצר ישירות'}
              </button>
            </form>
            
            {urlImportMessage && (
              <div style={{ 
                marginTop: '12px',
                padding: '10px 14px', 
                borderRadius: '8px', 
                backgroundColor: urlImportMessage.includes('שגיאה') ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                border: '1px solid ' + (urlImportMessage.includes('שגיאה') ? 'var(--error)' : 'var(--success)'),
                color: urlImportMessage.includes('שגיאה') ? 'var(--error)' : 'var(--success)', 
                fontSize: '0.85rem'
              }}>
                {urlImportMessage}
              </div>
            )}
          </div>

          {searchError && (
            <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '16px' }}>
              {searchError}
            </div>
          )}

          {importMessage && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              backgroundColor: importMessage.includes('שגיאה') ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
              border: '1px solid ' + (importMessage.includes('שגיאה') ? 'var(--error)' : 'var(--success)'),
              color: importMessage.includes('שגיאה') ? 'var(--error)' : 'var(--success)', 
              fontSize: '0.9rem', 
              marginBottom: '16px' 
            }}>
              {importMessage}
            </div>
          )}

          {/* Search Results Grid */}
          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                  נמצאו {searchResults.length} מוצרים ב-CJ:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-secondary" onClick={handleSelectAll} style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '6px' }}>
                    בחר הכל
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleSelectNone} style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '6px' }}>
                    בטל בחירה
                  </button>
                </div>
              </div>

              {/* Grid Layout */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px',
                maxHeight: '450px',
                overflowY: 'auto',
                padding: '12px',
                backgroundColor: 'var(--background)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                {searchResults.map(prod => {
                  const isSelected = selectedProducts.some(p => p.pid === prod.pid);
                  
                  // Estimated retail price in NIS:
                  const estimatedSellPriceUsd = prod.sellPrice * (1 + (parseInt(markupPercentInput) || 40) / 100);
                  const estimatedNisPrice = formatPrice(estimatedSellPriceUsd);

                  return (
                    <div 
                      key={prod.pid}
                      onClick={() => handleToggleSelect(prod)}
                      style={{
                        backgroundColor: 'var(--card)',
                        border: '1.5px solid ' + (isSelected ? 'var(--primary)' : 'var(--border)'),
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(var(--primary-rgb), 0.05)' : 'none'
                      }}
                    >
                      {/* Checkbox input overlay */}
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // Click handled by parent div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '18px',
                          height: '18px',
                          accentColor: 'var(--primary)',
                          cursor: 'pointer',
                          zIndex: 5
                        }}
                      />
                      
                      <div style={{ width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
                        <img 
                          src={prod.productImage} 
                          alt={prod.productName} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '2.1rem'
                        }}>
                          {prod.productName}
                        </h4>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>מחיר (₪):</span>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {estimatedNisPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalResults > 12 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '8px'
                }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => handleSearch(undefined, searchPage - 1)}
                    disabled={searchPage === 1 || isSearching}
                    style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '6px' }}
                  >
                    עמוד קודם
                  </button>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    עמוד {searchPage} מתוך {Math.ceil(totalResults / 12)}
                  </span>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => handleSearch(undefined, searchPage + 1)}
                    disabled={searchPage >= Math.ceil(totalResults / 12) || isSearching}
                    style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '6px' }}
                  >
                    עמוד הבא
                  </button>
                </div>
              )}

              {/* Import button */}
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleImport}
                disabled={selectedProducts.length === 0 || isImporting}
                style={{ 
                  alignSelf: 'flex-start', 
                  padding: '12px 24px', 
                  borderRadius: '10px',
                  fontWeight: 700,
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.1)'
                }}
              >
                {isImporting ? (
                  <RefreshCw size={16} style={{ animation: 'spin 1.5s infinite linear' }} />
                ) : null}
                ייבא מוצרים נבחרים ({selectedProducts.length})
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Product Catalog Manager View
  const renderProductsManager = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>ניהול קטלוג מוצרים בחנות</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{products.length} מוצרים מיובאים סה"כ</span>
        </div>

        {catalogMessage && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: '10px', 
            backgroundColor: catalogMessage.includes('שגיאה') ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
            border: '1px solid ' + (catalogMessage.includes('שגיאה') ? 'var(--error)' : 'var(--success)'),
            color: catalogMessage.includes('שגיאה') ? 'var(--error)' : 'var(--success)', 
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            {catalogMessage}
          </div>
        )}

        {products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            color: 'var(--text-muted)'
          }}>
            <ShoppingCart size={48} style={{ opacity: 0.15, marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>הקטלוג שלך ריק. חבר את מפתח ה-API או ייבא מוצרים בלשונית הגדרות.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {products.map(prod => {
              const isEditing = editingProductId === prod.pid;
              const hasVideo = !!prod.productVideo;

              return (
                <div 
                  key={prod.pid}
                  style={{
                    backgroundColor: 'var(--card)',
                    border: '1.5px solid ' + (isEditing ? 'var(--primary)' : 'var(--border)'),
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: 'var(--shadow)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  {isEditing ? (
                    /* Edit Form layout */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>שם המוצר בעברית:</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>מחיר (₪):</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>קישור ישיר לסרטון וידאו (MP4 / YouTube):</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="הדבק קישור לקובץ וידאו (.mp4) או קישור YouTube..." 
                          value={editVideo}
                          onChange={e => setEditVideo(e.target.value)}
                          style={{ direction: 'ltr', textAlign: 'left' }}
                        />
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                          במידה וקיים סרטון ב-CJ אך הוא לא יובא אוטומטית עקב מגבלות API (כמו במוצר זה), תוכל להעתיק את הקישור הישיר שלו מ-CJ ולהדביק אותו כאן כדי שינגן בגלריית המוצר!
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>תיאור המוצר ומפרט טכני:</label>
                        <textarea 
                          className="input-field" 
                          rows={4}
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          style={{ resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <button 
                          onClick={() => handleSaveEdit(prod.pid)}
                          className="btn btn-primary"
                          disabled={isUpdatingProd}
                          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem' }}
                        >
                          {isUpdatingProd ? 'מעדכן מוצר...' : 'שמור שינויים'}
                        </button>
                        <button 
                          onClick={() => setEditingProductId(null)}
                          className="btn btn-secondary"
                          disabled={isUpdatingProd}
                          style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem' }}
                        >
                          ביטול
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display layout */
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
                        <img src={prod.productImage} alt={prod.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text)', lineHeight: 1.3 }}>{prod.productName}</h4>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>קטגוריה: {prod.categoryName} • מזהה מוצר: <code>{prod.pid}</code></span>
                        
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--primary)' }}>{formatPrice(prod.sellPrice)}</span>
                          
                          {/* Video status badge */}
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: hasVideo ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                            color: hasVideo ? 'var(--success)' : '#D97706',
                            border: `1px solid ${hasVideo ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {hasVideo ? '🎥 סרטון וידאו פעיל' : '⚠️ ללא סרטון וידאו'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleStartEdit(prod)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit size={14} />
                          ערוך
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(prod.pid, prod.productName)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={14} />
                          מחק
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* Top Admin Header Bar */}
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
            
            <span 
              onClick={() => setAdminSubTab('products')} 
              style={{ 
                padding: '8px 16px', 
                color: adminSubTab === 'products' ? 'var(--primary)' : 'var(--text-muted)', 
                fontSize: '0.9rem', 
                fontWeight: adminSubTab === 'products' ? 700 : 500,
                borderBottom: adminSubTab === 'products' ? '2.5px solid var(--primary)' : 'none',
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
            >
              <ShoppingCart size={16} />
              מוצרים ({products.length})
            </span>

            <span onClick={() => setPage('orders')} style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={16} />
              הזמנות
            </span>
            <span style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} />
              לקוחות
            </span>
            
            <span 
              onClick={() => setAdminSubTab('settings')}
              style={{ 
                padding: '8px 16px', 
                color: adminSubTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)', 
                fontSize: '0.9rem', 
                fontWeight: adminSubTab === 'settings' ? 700 : 500,
                borderBottom: adminSubTab === 'settings' ? '2.5px solid var(--primary)' : 'none',
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
            >
              <Sliders size={16} />
              הגדרות API
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

      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Breadcrumb path */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          ניהול מערכת &gt; <span style={{ fontWeight: 600, color: 'var(--text)' }}>
            {adminSubTab === 'products' ? 'קטלוג מוצרים מקומי' : 'אינטגרציות CJ API'}
          </span>
        </div>

        {/* Conditional rendering based on admin sub tab */}
        {adminSubTab === 'products' ? renderProductsManager() : renderApiSettings()}

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
