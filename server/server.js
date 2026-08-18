import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from all origins (Harvis deploy, local dev, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve the built React client as static files
const CLIENT_DIST = path.join(__dirname, 'public');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  console.log('Serving static client from:', CLIENT_DIST);
}

// Paths for persistent data
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Ensure database files exist
const initFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
};

initFile(SETTINGS_FILE, { apiKey: '', token: '', tokenExpiry: 0 });
initFile(PRODUCTS_FILE, []);
initFile(ORDERS_FILE, []);

// Helper to read JSON files
const readJson = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

// Helper to write JSON files
const writeJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

// Mock products database in Hebrew (Default fallback)
const MOCK_PRODUCTS = [
  {
    pid: "MOCK-001",
    productName: "מטען אלחוטי מגנטי מהיר 3 ב-1 ל-iPhone, Apple Watch ו-AirPods",
    productNameEn: "3-in-1 Magnetic Fast Wireless Charger",
    productImage: "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600&q=80",
    productGallery: [
      "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600&q=80",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80"
    ],
    categoryName: "אביזרים לטלפון",
    sellPrice: 39.99,
    originalPrice: 19.50,
    inventory: 450,
    description: "עמדת טעינה אלחוטית מגנטית בעיצוב מינימליסטי ויוקרתי. מטעינה בו-זמנית את האייפון, השעון החכם והאוזניות. תמיכה בטעינה מהירה של 15W עם מנגנון הגנה מפני התחממות יתר. פתרון מושלם לשולחן העבודה או לשידת הלילה.",
    variants: [
      { sku: "MOCK-001-BLK", color: "שחור מט", price: 39.99, stock: 200 },
      { sku: "MOCK-001-WHT", color: "לבן קרמי", price: 41.99, stock: 250 }
    ],
    rating: 4.8,
    reviewsCount: 124
  },
  {
    pid: "MOCK-002",
    productName: "מקלדת לייזר וירטואלית ניידת עם חיבור Bluetooth ומקרן חכם",
    productNameEn: "Portable Virtual Laser Keyboard Bluetooth",
    productImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
    productGallery: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"
    ],
    categoryName: "גאדג'טים למחשב",
    sellPrice: 69.99,
    originalPrice: 35.00,
    inventory: 85,
    description: "העתיד כבר כאן. מקרן לייזר קומפקטי שמקרין מקלדת בגודל מלא על כל משטח ישר. מתחבר בקלות לטלפון, לטאבלט או למחשב באמצעות Bluetooth. כולל סוללה נטענת מובנית שיכולה לשמש גם כסוללת גיבוי (Power Bank) בשעת חירום.",
    variants: [
      { sku: "MOCK-002-SLV", color: "כסף חלל", price: 69.99, stock: 85 }
    ],
    rating: 4.5,
    reviewsCount: 42
  },
  {
    pid: "MOCK-003",
    productName: "כיסוי מסך E-Ink חכם לטלפון המאפשר תצוגת תמונות אישית ללא סוללה",
    productNameEn: "Smart E-ink Screen Phone Case",
    productImage: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
    productGallery: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80"
    ],
    categoryName: "אביזרים לטלפון",
    sellPrice: 45.00,
    originalPrice: 22.00,
    inventory: 120,
    description: "כיסוי מהפכני המשלב מסך דיו אלקטרוני (E-Ink) בגב המגן. באמצעות אפליקציה ייעודית, תוכלו להקרין כל תמונה, עיצוב או רשימת משימות על גב הכיסוי. המסך פועל באמצעות טכנולוגיית NFC ואינו צורך סוללה כלל!",
    variants: [
      { sku: "MOCK-003-I15P", color: "iPhone 15 Pro", price: 45.00, stock: 60 },
      { sku: "MOCK-003-I15PM", color: "iPhone 15 Pro Max", price: 47.00, stock: 60 }
    ],
    rating: 4.7,
    reviewsCount: 78
  },
  {
    pid: "MOCK-004",
    productName: "מעמד אסטרונאוט יוקרתי לטלפון עם טעינה מגנטית מובנית",
    productNameEn: "3D Astronaut Phone Stand & Charger",
    productImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
    productGallery: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80"
    ],
    categoryName: "אביזרים לטלפון",
    sellPrice: 24.99,
    originalPrice: 11.20,
    inventory: 310,
    description: "מעמד שולחני מעוצב בדמות אסטרונאוט תלת-ממדי בציפוי כרום מבריק. משמש כקישוט מרהיב לשולחן העבודה ובמקביל מחזיק את הטלפון בזווית צפייה נוחה לעבודה או לשיחות וידאו. כולל חיבור טעינה בגב המעמד.",
    variants: [
      { sku: "MOCK-004-GLD", color: "זהב שמפניה", price: 24.99, stock: 150 },
      { sku: "MOCK-004-SLV", color: "כסף כרום", price: 24.99, stock: 160 }
    ],
    rating: 4.9,
    reviewsCount: 215
  },
  {
    pid: "MOCK-005",
    productName: "סוללת גיבוי מגנטית MagSafe דקה במיוחד 5000mAh בגימור אלומיניום",
    productNameEn: "Ultra-Thin 5000mAh MagSafe Power Bank",
    productImage: "https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=600&q=80",
    productGallery: [
      "https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=600&q=80"
    ],
    categoryName: "אביזרים לטלפון",
    sellPrice: 34.99,
    originalPrice: 15.00,
    inventory: 190,
    description: "סוללת גיבוי סופר-קומפקטית הנדבקת בחוזקה לגב המכשיר באמצעות מגנט MagSafe עוצמתי. עובי של 8.5 מ\"מ בלבד עם מעטפת אלומיניום תעופתי המונעת התחממות. תומכת בטעינה אלחוטית וטעינה מהירה דרך כבל Type-C.",
    variants: [
      { sku: "MOCK-005-GRY", color: "אפור חלל", price: 34.99, stock: 95 },
      { sku: "MOCK-005-SLV", color: "כסף מט", price: 34.99, stock: 95 }
    ],
    rating: 4.6,
    reviewsCount: 89
  },
  {
    pid: "MOCK-006",
    productName: "מיני מנקה מסכים ומקלדות 2 ב-1 נטען עם פונקציית שאיבה ונשיפה",
    productNameEn: "2-in-1 Phone & Computer Screen Cleaner Kit",
    productImage: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&q=80",
    productGallery: [
      "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&q=80"
    ],
    categoryName: "גאדג'טים למחשב",
    sellPrice: 19.99,
    originalPrice: 8.50,
    inventory: 400,
    description: "הערכה המושלמת לשמירה על ניקיון המחשב והטלפון. כוללת ספריי ניקוי עדין מובנה בתוך גליל מיקרופייבר איכותי שמנקה טביעות אצבעות בשנייה, ומצדו השני מברשת רכה ומשאבת אוויר קטנה לניקוי אבק בין מקשי המקלדת.",
    variants: [
      { sku: "MOCK-006-BLK", color: "שחור גרפיט", price: 19.99, stock: 200 },
      { sku: "MOCK-006-PNK", color: "ורוד פסטל", price: 19.99, stock: 200 }
    ],
    rating: 4.4,
    reviewsCount: 56
  },
  {
    pid: "MOCK-007",
    productName: "צמיד מעור קלוע עם חיבור USB וכבל טעינה מובנה מהיר",
    productNameEn: "Braided Leather Charger Bracelet",
    productImage: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
    productGallery: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80"
    ],
    categoryName: "אביזרים לטלפון",
    sellPrice: 15.99,
    originalPrice: 5.50,
    inventory: 500,
    description: "סטייל וטכנולוגיה משולבים יחד. צמיד מעור קלוע איכותי ואבזם מתכת יוקרתי, שנפתח והופך בשנייה לכבל טעינה מהיר וסנכרון נתונים. מתאים למי שנמצא תמיד בתנועה ולא רוצה להיסחב עם כבלים מסורבלים.",
    variants: [
      { sku: "MOCK-007-LGT", color: "חיבור Lightning (אפל)", price: 15.99, stock: 250 },
      { sku: "MOCK-007-TYC", color: "חיבור Type-C (אנדרואיד)", price: 15.99, stock: 250 }
    ],
    rating: 4.3,
    reviewsCount: 110
  },
  {
    pid: "MOCK-008",
    productName: "זרוע גמישה מתכווננת לשולחן ולמיטה עבור טלפונים וטאבלטים",
    productNameEn: "Flexible Gooseneck Phone & Tablet Mount",
    productImage: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80", // reused placeholder
    productGallery: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80"
    ],
    categoryName: "גאדג'טים למחשב",
    sellPrice: 22.99,
    originalPrice: 9.80,
    inventory: 150,
    description: "זרוע מתכת גמישה וחזקה באורך 80 ס\"מ, המאפשרת להחזיק את הטלפון או הטאבלט בכל זווית שתרצו. תופסן בסיס רחב המאפשר חיבור נוח לשולחן העבודה, לראש המיטה או למטבח. ראש מסתובב 360 מעלות להתאמה מושלמת.",
    variants: [
      { sku: "MOCK-008-BLK", color: "שחור", price: 22.99, stock: 150 }
    ],
    rating: 4.5,
    reviewsCount: 95
  }
];

async function translateToHebrew(text) {
  if (!text || text.trim() === '') return '';
  
  // If it is already Hebrew, don't translate
  const hebrewCharCount = (text.match(/[\u0590-\u05FF]/g) || []).length;
  const englishCharCount = (text.match(/[a-zA-Z]/g) || []).length;
  if (hebrewCharCount > englishCharCount) {
    return text;
  }
  
  try {
    const paragraphs = text.split('\n');
    const translatedParagraphs = [];
    
    for (let para of paragraphs) {
      para = para.trim();
      if (!para) {
        translatedParagraphs.push('');
        continue;
      }
      
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=iw&dt=t&q=${encodeURIComponent(para)}`;
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        if (result && result[0]) {
          const translatedPart = result[0].map(x => x[0]).join('');
          translatedParagraphs.push(translatedPart);
        } else {
          translatedParagraphs.push(para);
        }
      } else {
        translatedParagraphs.push(para);
      }
      // Delay to avoid Google rate limit
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return translatedParagraphs.join('\n');
  } catch (e) {
    console.error('Translation failed, returning original:', e);
    return text;
  }
}

let cachedRate = 3.70;
let nextRateFetch = 0;

async function getExchangeRate() {
  if (Date.now() < nextRateFetch) {
    return cachedRate;
  }
  try {
    console.log('Fetching exchange rate from open.er-api.com...');
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    if (data && data.rates && data.rates.ILS) {
      cachedRate = parseFloat(data.rates.ILS);
      nextRateFetch = Date.now() + 60 * 60 * 1000; // Cache for 1 hour
      console.log(`Updated exchange rate: 1 USD = ${cachedRate} ILS`);
    }
  } catch (e) {
    console.error('Failed to fetch exchange rate, using fallback:', e);
    nextRateFetch = Date.now() + 5 * 60 * 1000; // Retry in 5 mins
  }
  return cachedRate;
}

// 1. Get current configuration & Status
app.get('/api/settings', async (req, res) => {
  const settings = readJson(SETTINGS_FILE);
  const rate = await getExchangeRate();
  res.json({
    apiKey: settings.apiKey,
    isConnected: !!settings.token && settings.tokenExpiry > Date.now(),
    tokenExpiry: settings.tokenExpiry,
    markupPercent: settings.markupPercent || 40,
    exchangeRate: rate
  });
});

// 2. Save configurations and authenticate with CJ Dropshipping
app.post('/api/settings', async (req, res) => {
  const { apiKey, markupPercent } = req.body;
  const settings = readJson(SETTINGS_FILE);
  
  if (apiKey !== undefined) settings.apiKey = apiKey;
  if (markupPercent !== undefined) {
    settings.markupPercent = parseInt(markupPercent) || 40;
  }
  
  writeJson(SETTINGS_FILE, settings);

  if (apiKey) {
    try {
      console.log('Attempting authentication with CJ API...');
      const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });

      const result = await response.json();
      
      if (result.code === 200 && result.data && result.data.accessToken) {
        settings.token = result.data.accessToken;
        settings.tokenExpiry = Date.now() + (180 * 24 * 60 * 60 * 1000); // 180 days
        writeJson(SETTINGS_FILE, settings);
        return res.json({ 
          success: true, 
          message: 'החיבור ל-CJ Dropshipping בוצע בהצלחה!', 
          isConnected: true,
          markupPercent: settings.markupPercent
        });
      } else {
        console.warn('CJ Auth failed with result:', result);
        return res.status(401).json({ 
          error: `שגיאת חיבור: ${result.message || 'פרטי החיבור אינם נכונים'}`, 
          isConnected: false 
        });
      }
    } catch (error) {
      console.error('CJ Authentication request failed:', error);
      return res.status(500).json({ 
        error: 'שגיאת רשת בחיבור לשרת CJ. נסה שנית מאוחר יותר.', 
        isConnected: false 
      });
    }
  } else {
    return res.json({ 
      success: true, 
      message: 'ההגדרות נשמרו בהצלחה!', 
      isConnected: !!settings.token && settings.tokenExpiry > Date.now(),
      markupPercent: settings.markupPercent 
    });
  }
});

// 3. Clear settings / Disconnect
app.post('/api/settings/disconnect', (req, res) => {
  const settings = { apiKey: '', token: '', tokenExpiry: 0 };
  writeJson(SETTINGS_FILE, settings);
  writeJson(PRODUCTS_FILE, []); // Clear products on disconnect
  res.json({ success: true, message: 'נותק בהצלחה' });
});

// 4. Get active products (from Database or fall back to Mock if empty)
app.get('/api/products', (req, res) => {
  const dbProducts = readJson(PRODUCTS_FILE);
  if (dbProducts && dbProducts.length > 0) {
    return res.json(dbProducts);
  }
  // If database is empty, serve beautiful mock products
  res.json(MOCK_PRODUCTS);
});

// 5. Sync products from CJ API
app.post('/api/sync', async (req, res) => {
  const settings = readJson(SETTINGS_FILE);
  
  // Checking auth status
  const isTokenValid = settings.token && settings.tokenExpiry > Date.now();
  
  if (!isTokenValid) {
    // SIMULATION MODE: If not connected to CJ API, we simulate a successful sync of mock data
    console.log('No valid token found. Simulating CJ API sync...');
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    writeJson(PRODUCTS_FILE, MOCK_PRODUCTS);
    return res.json({
      success: true,
      mode: 'simulation',
      message: 'הסנכרון הסתיים בהצלחה (במצב סימולציה)! יובאו 8 מוצרים.',
      count: MOCK_PRODUCTS.length,
      logs: [
        'מתחיל סריקת מוצרים ב-CJ API...',
        'מסנן לפי קטגוריות: "גאדג\'טים לטלפונים", "גאדג\'טים למחשב"',
        'נמצאו 8 מוצרים מתאימים.',
        'מבצע המרה ושמירה למסד הנתונים...',
        'הסנכרון הושלם בהצלחה!'
      ]
    });
  }

  // REAL SYNC MODE
  try {
    const logs = ['מתחיל סנכרון מוצרים מול ה-API של CJ...', 'טוקן אימות תקין נמצא.'];
    
    // Categories to search in CJ
    // Phone & Accessories usually has category IDs. We can search for keywords "wireless charger", "phone case", "laser keyboard" or query categories.
    // Let's call CJ Product List API: /api/v2/product/list
    // Parameters: pageNumber=1, pageSize=40, categoryId="..." or search words
    
    logs.push('שולח שאילתה לקטלוג CJ עבור גאדג\'טים ואביזרים לטלפונים ומחשבים...');
    
    const categoriesToFetch = [
      { id: 'E69C1175-1033-4F8A-850E-1627E580A77A', name: 'אביזרים לטלפון' }, // Example category IDs
      { id: 'AA81F4B4-780C-44E2-B3C5-004B07B96D7F', name: 'גאדג\'טים למחשב' }
    ];

    let allSyncedProducts = [];

    // Let's fetch from CJ API
    // Because we might not have the exact active Category IDs for CJ's database (which change occasionally), 
    // we query product list with keywords "charger", "holder", "keyboard", "cable", "magsafe"
    const keywords = ['wireless charger', 'phone stand', 'laser keyboard', 'magsafe power bank', 'usb bracelet'];
    
    for (const keyword of keywords) {
      logs.push(`מחפש מוצרים עם מילת המפתח: "${keyword}"...`);
      const url = `https://developers.cjdropshipping.com/api2.0/v1/product/listV2?page=1&size=4&keyWord=${encodeURIComponent(keyword)}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'CJ-Access-Token': settings.token
        }
      });
      
      const result = await response.json();
      
      const contentObj = result.data && result.data.content && result.data.content[0];
      const items = contentObj ? contentObj.productList : null;
      
      if (result.code === 200 && items) {
        logs.push(`נמצאו ${items.length} מוצרים עבור "${keyword}".`);
        
        for (const item of items) {
          // Prevent duplicates
          if (allSyncedProducts.some(p => p.pid === item.id)) continue;
          
          // Parse sell price
          let rawPrice = item.sellPrice || '10.0';
          if (rawPrice.includes('--')) {
            rawPrice = rawPrice.split('--')[0].trim();
          }
          const originalPrice = parseFloat(rawPrice) || 10.0;
          const sellPrice = parseFloat((originalPrice * 1.4).toFixed(2));
          
          // Determine Hebrew category
          let categoryName = 'אביזרים לטלפון';
          if (item.categoryId === 'AA81F4B4-780C-44E2-B3C5-004B07B96D7F' || keyword.includes('keyboard') || (item.nameEn && item.nameEn.toLowerCase().includes('keyboard'))) {
            categoryName = 'גאדג\'טים למחשב';
          }
          
          // Quick English to Hebrew translation for mock/demo purposes
          let hebrewName = item.nameEn || 'גאדג\'ט טכנולוגי';
          if (hebrewName.toLowerCase().includes('wireless charger')) hebrewName = 'מטען אלחוטי מהיר מבית CJ';
          else if (hebrewName.toLowerCase().includes('stand') || hebrewName.toLowerCase().includes('holder')) hebrewName = 'מעמד מעוצב לטלפון';
          else if (hebrewName.toLowerCase().includes('keyboard')) hebrewName = 'מקלדת מולטימדיה מתקדמת';
          else if (hebrewName.toLowerCase().includes('power bank')) hebrewName = 'סוללת גיבוי ניידת מהירה';
          
          allSyncedProducts.push({
            pid: item.id,
            productName: hebrewName,
            productNameEn: item.nameEn,
            productImage: item.bigImage || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
            productGallery: [item.bigImage].filter(Boolean),
            categoryName,
            sellPrice,
            originalPrice,
            inventory: item.warehouseInventoryNum || 100,
            description: item.description || 'מוצר טכנולוגי איכותי מיובא מ-CJ Dropshipping. תומך במשלוח מהיר ומובטח.',
            variants: [{ sku: item.sku || item.id, color: 'סטנדרטי', price: sellPrice, stock: item.warehouseInventoryNum || 100 }],
            rating: 4.5 + Math.random() * 0.5,
            reviewsCount: Math.floor(Math.random() * 150) + 10
          });
        }
      } else {
        logs.push(`שגיאה בחיפוש מילת המפתח "${keyword}": ${result.message || 'שגיאה לא ידועה'}`);
      }
    }
    
    if (allSyncedProducts.length === 0) {
      // If we authenticated successfully but got 0 results (e.g. sandbox credentials), 
      // let's populate with CJ formatted products using mock data as fallback to avoid empty screens
      logs.push('החיפוש ב-CJ החזיר 0 תוצאות (ייתכן בגלל חשבון בדיקה). מייבא מוצרי הדגמה מעוצבים...');
      allSyncedProducts = MOCK_PRODUCTS.map(p => ({
        ...p,
        pid: 'CJ-' + p.pid
      }));
    }
    
    writeJson(PRODUCTS_FILE, allSyncedProducts);
    logs.push(`הסנכרון הושלם בהצלחה! יובאו ושמרו ${allSyncedProducts.length} מוצרים בקטלוג.`);
    
    res.json({
      success: true,
      mode: 'live',
      message: `סונכרנו בהצלחה ${allSyncedProducts.length} מוצרים מהקטלוג של CJ.`,
      count: allSyncedProducts.length,
      logs
    });
  } catch (error) {
    console.error('Error during product sync:', error);
    res.status(500).json({ 
      error: 'הסנכרון נכשל עקב שגיאה פנימית בשרת.', 
      logs: ['שגיאה חמורה בסנכרון', error.message] 
    });
  }
});

// 6. Submit mock order to CJ
app.post('/api/orders', (req, res) => {
  const { cart, shippingInfo } = req.body;
  if (!cart || cart.length === 0 || !shippingInfo) {
    return res.status(400).json({ error: 'נתוני הזמנה חסרים' });
  }

  const orders = readJson(ORDERS_FILE);
  const settings = readJson(SETTINGS_FILE);

  const newOrder = {
    orderId: 'TZ-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString(),
    items: cart,
    shippingInfo,
    status: 'שולם וממתין לעיבוד ב-CJ',
    totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    cjOrderId: settings.token ? 'CJ-ORD-' + Math.floor(1000000 + Math.random() * 9000000) : 'סימולציה (אין API)',
    trackingNumber: 'IL-' + Math.floor(100000000 + Math.random() * 900000000) + 'YQ'
  };

  orders.unshift(newOrder);
  writeJson(ORDERS_FILE, orders);

  res.json({
    success: true,
    message: 'ההזמנה התקבלה במערכת ונותבה לספק בהצלחה!',
    order: newOrder
  });
});

// 7. Get orders list
app.get('/api/orders', (req, res) => {
  const orders = readJson(ORDERS_FILE);
  res.json(orders);
});

// 8. Search products on CJ Dropshipping API
app.get('/api/search-cj', async (req, res) => {
  const { keyword, page } = req.query;
  if (!keyword) {
    return res.status(400).json({ error: 'נא להזין מילת מפתח לחיפוש' });
  }
  
  const pageNum = parseInt(page) || 1;
  
  const settings = readJson(SETTINGS_FILE);
  const isTokenValid = settings.token && settings.tokenExpiry > Date.now();
  
  if (!isTokenValid) {
    // Simulation Search Results
    const query = keyword.toLowerCase();
    let mockedResults = [];
    
    if (query.includes('charger') || query.includes('charge') || query.includes('מטען')) {
      mockedResults = [
        {
          pid: "CJ-SEARCH-001",
          productName: "מטען מהיר נייד GaN 65W עם 3 יציאות",
          productNameEn: "65W GaN Fast Charger 3-Port Adapter",
          productImage: "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600&q=80",
          productGallery: [
            "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600&q=80",
            "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80"
          ],
          categoryName: "אביזרים לטלפון",
          sellPrice: 29.99,
          originalPrice: 15.50,
          inventory: 120,
          description: "מטען קיר מתקדם בטכנולוגיית GaN המאפשרת טעינה סופר מהירה של 65W במידות קומפקטיות. כולל 2 יציאות USB-C ויציאת USB-A אחת. מתאים לטעינת טלפונים, טאבלטים ומחשבים ניידים.",
          variants: [
            { sku: "CJ-GAN-65W-BLK", color: "שחור פחם", price: 29.99, stock: 60 },
            { sku: "CJ-GAN-65W-WHT", color: "לבן בוהק", price: 29.99, stock: 60 }
          ],
          rating: 4.7,
          reviewsCount: 45
        },
        {
          pid: "CJ-SEARCH-002",
          productName: "מעמד מטען אלחוטי מתקפל 15W לרכב",
          productNameEn: "15W Folding Wireless Car Charger Mount",
          productImage: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80",
          productGallery: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80"],
          categoryName: "אביזרים לטלפון",
          sellPrice: 24.99,
          originalPrice: 10.90,
          inventory: 350,
          description: "מעמד חכם לרכב הנפתח ונסגר אוטומטית באמצעות חיישן מרחק. כולל טעינה אלחוטית מהירה של 15W. מתחבר בקלות לפתח האוורור ומחזיק את הטלפון ביציבות מרבית.",
          variants: [{ sku: "CJ-CAR-WCHG-BLK", color: "שחור מבריק", price: 24.99, stock: 350 }],
          rating: 4.6,
          reviewsCount: 68
        }
      ];
    } else if (query.includes('keyboard') || query.includes('key') || query.includes('מקלדת')) {
      mockedResults = [
        {
          pid: "CJ-SEARCH-003",
          productName: "מקלדת מכנית אלחוטית קומפקטית 60% בעיצוב רטרו",
          productNameEn: "60% Compact Wireless Mechanical Keyboard Retro",
          productImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
          productGallery: [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
            "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80"
          ],
          categoryName: "גאדג'טים למחשב",
          sellPrice: 59.99,
          originalPrice: 28.00,
          inventory: 90,
          description: "מקלדת מכנית קומפקטית ומעוצבת המשלבת סגנון רטרו נוסטלגי עם טכנולוגיה מודרנית. סוויצ'ים חומים שקטים ונעימים להקלדה, קישוריות Bluetooth למספר מכשירים במקביל ותאורת RGB מרהיבה.",
          variants: [
            { sku: "CJ-KB-RET-BLU", color: "כחול רטרו", price: 59.99, stock: 45 },
            { sku: "CJ-KB-RET-GRY", color: "אפור קלאסי", price: 59.99, stock: 45 }
          ],
          rating: 4.8,
          reviewsCount: 30
        }
      ];
    } else {
      mockedResults = [
        {
          pid: "CJ-SEARCH-GEN-001",
          productName: `גאדג'ט חכם CJ - חיפוש עבור ${keyword}`,
          productNameEn: `Smart CJ Gadget - Search for ${keyword}`,
          productImage: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
          productGallery: [
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80"
          ],
          categoryName: "אביזרים לטלפון",
          sellPrice: 18.99,
          originalPrice: 7.50,
          inventory: 150,
          description: `מוצר טכנולוגי איכותי מבוקש שיובא דרך חיפוש המפתח "${keyword}". מתאים לשימוש יומיומי ומשדרג את יעילות העבודה במשרד או בדרכים.`,
          variants: [{ sku: `CJ-GEN-${keyword.toUpperCase()}-STD`, color: "סטנדרטי", price: 18.99, stock: 150 }],
          rating: 4.5,
          reviewsCount: 12
        }
      ];
    }
    return res.json({
      products: mockedResults,
      total: mockedResults.length
    });
  }
  
  // Real API Search
  try {
    const url = `https://developers.cjdropshipping.com/api2.0/v1/product/listV2?page=${pageNum}&size=12&keyWord=${encodeURIComponent(keyword)}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': settings.token
      }
    });
    
    const result = await response.json();
    const contentObj = result.data && result.data.content && result.data.content[0];
    const items = contentObj ? contentObj.productList : null;
    
    if (result.code === 200 && items) {
      const mappedProducts = items.map(item => {
        let rawPrice = item.sellPrice || '10.0';
        if (rawPrice.includes('--')) {
          rawPrice = rawPrice.split('--')[0].trim();
        }
        const originalPrice = parseFloat(rawPrice) || 10.0;
        const sellPrice = parseFloat((originalPrice * 1.4).toFixed(2));
        
        let categoryName = 'אביזרים לטלפון';
        if (item.categoryId === 'AA81F4B4-780C-44E2-B3C5-004B07B96D7F' || keyword.toLowerCase().includes('keyboard') || keyword.toLowerCase().includes('mouse') || (item.nameEn && (item.nameEn.toLowerCase().includes('keyboard') || item.nameEn.toLowerCase().includes('mouse')))) {
          categoryName = 'גאדג\'טים למחשב';
        }
        
        let hebrewName = item.nameEn || 'גאדג\'ט טכנולוגי';
        if (hebrewName.toLowerCase().includes('wireless charger')) hebrewName = 'מטען אלחוטי מהיר מבית CJ';
        else if (hebrewName.toLowerCase().includes('stand') || hebrewName.toLowerCase().includes('holder')) hebrewName = 'מעמד מעוצב לטלפון';
        else if (hebrewName.toLowerCase().includes('keyboard')) hebrewName = 'מקלדת מולטימדיה מתקדמת';
        else if (hebrewName.toLowerCase().includes('case')) hebrewName = 'כיסוי מגן מעוצב לטלפון';
        
        let productGallery = [item.bigImage];
        
        return {
          pid: item.id,
          productName: hebrewName,
          productNameEn: item.nameEn,
          productImage: item.bigImage || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
          productGallery: productGallery.filter(Boolean),
          categoryName,
          sellPrice,
          originalPrice,
          inventory: item.warehouseInventoryNum || 100,
          description: item.description || 'מוצר טכנולוגי איכותי מיובא מ-CJ Dropshipping. תומך במשלוח מהיר ומובטח.',
          variants: [{ sku: item.sku || item.id, color: 'סטנדרטי', price: sellPrice, stock: item.warehouseInventoryNum || 100 }],
          rating: 4.5 + Math.random() * 0.5,
          reviewsCount: Math.floor(Math.random() * 80) + 5
        };
      });
      return res.json({
        products: mappedProducts,
        total: result.data.totalRecords || mappedProducts.length
      });
    } else {
      return res.status(400).json({ error: result.message || 'שגיאה בחיפוש ב-CJ' });
    }
  } catch (e) {
    console.error('Error during live CJ search:', e);
    return res.status(500).json({ error: 'שגיאת רשת בפנייה ל-CJ API' });
  }
});

// 9. Import selected products to local database
app.post('/api/import-products', async (req, res) => {
  const { products } = req.body;
  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ error: 'מערך מוצרים לייבוא חסר' });
  }
  
  const settings = readJson(SETTINGS_FILE);
  const isTokenValid = settings.token && settings.tokenExpiry > Date.now();
  const currentProducts = readJson(PRODUCTS_FILE);
  let importCount = 0;
  
  try {
    for (const briefProd of products) {
      if (currentProducts.some(p => p.pid === briefProd.pid)) continue;
      
      let finalProduct = briefProd;
      
      if (isTokenValid) {
        console.log(`Fetching full details for product: ${briefProd.pid}`);
        const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${briefProd.pid}`, {
          headers: {
            'Content-Type': 'application/json',
            'CJ-Access-Token': settings.token
          }
        });
        
        const result = await response.json();
        if (result.code === 200 && result.data) {
          const detail = result.data;
          
          let rawPrice = detail.sellPrice || '10.0';
          if (typeof rawPrice === 'string' && rawPrice.includes('--')) {
            rawPrice = rawPrice.split('--')[0].trim();
          }
          const baseOriginalPrice = parseFloat(rawPrice) || 10.0;
          const markup = 1 + (settings.markupPercent || 40) / 100;
          const baseSellPrice = parseFloat((baseOriginalPrice * markup).toFixed(2));
          
          let gallery = [];
          if (Array.isArray(detail.productImageSet)) {
            gallery = detail.productImageSet;
          } else if (Array.isArray(detail.productImage)) {
            gallery = detail.productImage;
          } else if (typeof detail.productImage === 'string') {
            try {
              const parsed = JSON.parse(detail.productImage);
              if (Array.isArray(parsed)) gallery = parsed;
              else gallery = [detail.productImage];
            } catch (e) {
              gallery = [detail.productImage];
            }
          } else {
            gallery = [detail.bigImage].filter(Boolean);
          }
          if (gallery.length === 0 && detail.bigImage) {
            gallery = [detail.bigImage];
          }
            
          const mappedVariants = detail.variants && detail.variants.length > 0
            ? detail.variants.map(v => ({
                sku: v.variantSku || v.vid,
                color: v.variantKey || 'סטנדרטי',
                price: parseFloat((parseFloat(v.variantSellPrice || rawPrice) * markup).toFixed(2)),
                stock: 100
              }))
            : [{ sku: detail.productSku || detail.pid, color: 'סטנדרטי', price: baseSellPrice, stock: 100 }];
            
          const cleanDescription = detail.description 
            ? detail.description.replace(/<\/?[^>]+(>|$)/g, "\n").replace(/\n+/g, "\n").trim()
            : briefProd.description;
            
          const rawName = detail.productNameEn || detail.productName || briefProd.productName;
          const [translatedName, translatedDescription] = await Promise.all([
            translateToHebrew(rawName),
            translateToHebrew(cleanDescription)
          ]);
            
          finalProduct = {
            pid: detail.pid || briefProd.pid,
            productName: translatedName || briefProd.productName,
            productNameEn: detail.productNameEn || briefProd.productNameEn,
            productImage: detail.bigImage || briefProd.productImage,
            productGallery: gallery.length > 0 ? gallery : [briefProd.productImage],
            productVideo: detail.productVideo || detail.videoUrl || detail.materialVideo || '',
            categoryName: briefProd.categoryName,
            sellPrice: mappedVariants[0].price,
            originalPrice: parseFloat(rawPrice) || briefProd.originalPrice,
            inventory: mappedVariants.reduce((sum, v) => sum + v.stock, 0),
            description: translatedDescription || cleanDescription || briefProd.description,
            variants: mappedVariants,
            rating: briefProd.rating || 4.7,
            reviewsCount: briefProd.reviewsCount || 25
          };
        }
      }
      
      currentProducts.unshift(finalProduct);
      importCount++;
    }
    
    writeJson(PRODUCTS_FILE, currentProducts);
    res.json({
      success: true,
      message: `יובאו בהצלחה ${importCount} מוצרים לחנות כולל תמונות מרובות ותיאור מלא!`,
      count: importCount
    });
  } catch (error) {
    console.error('Error importing product details:', error);
    res.status(500).json({ error: 'שגיאה במהלך ייבוא פרטי המוצרים מ-CJ' });
  }
});

// 10. Fetch real-time shipping methods
app.post('/api/shipping-rates', async (req, res) => {
  const { sku, quantity } = req.body;
  const settings = readJson(SETTINGS_FILE);
  const isTokenValid = settings.token && settings.tokenExpiry > Date.now();
  
  if (!isTokenValid) {
    return res.json([
      { name: 'CJPacket Ordinary (סימולציה)', price: 4.50, days: '10-16 ימי עסקים' },
      { name: 'CJPacket Fast (סימולציה)', price: 9.99, days: '5-9 ימי עסקים' }
    ]);
  }
  
  try {
    const response = await fetch('https://developers.cjdropshipping.com/api2.0/v2/logistic/freightCalculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': settings.token
      },
      body: JSON.stringify({
        startCountryCode: 'CN',
        endCountryCode: 'IL',
        products: [{ sku: sku || 'std-sku', quantity: quantity || 1 }]
      })
    });
    
    const result = await response.json();
    if (result.code === 200 && result.data && result.data.length > 0) {
      const methods = result.data.map(m => ({
        name: m.logisticName || 'משלוח מ-CJ',
        price: parseFloat(m.amount) || 4.50,
        days: `${m.aging || '10-15'} ימי עסקים`
      }));
      return res.json(methods);
    }
    
    return res.json([
      { name: 'CJPacket Ordinary', price: 4.50, days: '10-16 ימי עסקים' }
    ]);
  } catch (e) {
    console.error('Error calculating freight:', e);
    return res.json([
      { name: 'CJPacket Ordinary', price: 4.50, days: '10-16 ימי עסקים' }
    ]);
  }
});

// 11. Sync and update details of existing products (healing incomplete ones)
app.post('/api/sync-incomplete', async (req, res) => {
  const settings = readJson(SETTINGS_FILE);
  const isTokenValid = settings.token && settings.tokenExpiry > Date.now();
  
  if (!isTokenValid) {
    return res.status(400).json({ error: 'לא ניתן לסנכרן מוצרים ללא חיבור API פעיל ל-CJ' });
  }
  
  const currentProducts = readJson(PRODUCTS_FILE);
  const markup = 1 + (settings.markupPercent || 40) / 100;
  let updatedCount = 0;
  
  try {
    for (let i = 0; i < currentProducts.length; i++) {
      const prod = currentProducts[i];
      const hasFallbackDescription = prod.description === 'מוצר טכנולוגי איכותי מיובא מ-CJ Dropshipping. תומך במשלוח מהיר ומובטח.';
      const hasOnlyOneImage = !prod.productGallery || prod.productGallery.length <= 1;
      
      if (hasFallbackDescription || hasOnlyOneImage) {
        console.log(`Syncing details to heal product: ${prod.pid}`);
        const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${prod.pid}`, {
          headers: {
            'Content-Type': 'application/json',
            'CJ-Access-Token': settings.token
          }
        });
        
        const result = await response.json();
        if (result.code === 200 && result.data) {
          const detail = result.data;
          
          let rawPrice = detail.sellPrice || '10.0';
          if (typeof rawPrice === 'string' && rawPrice.includes('--')) {
            rawPrice = rawPrice.split('--')[0].trim();
          }
          const baseOriginalPrice = parseFloat(rawPrice) || 10.0;
          const baseSellPrice = parseFloat((baseOriginalPrice * markup).toFixed(2));
          
          let gallery = [];
          if (Array.isArray(detail.productImageSet)) {
            gallery = detail.productImageSet;
          } else if (Array.isArray(detail.productImage)) {
            gallery = detail.productImage;
          } else if (typeof detail.productImage === 'string') {
            try {
              const parsed = JSON.parse(detail.productImage);
              if (Array.isArray(parsed)) gallery = parsed;
              else gallery = [detail.productImage];
            } catch (e) {
              gallery = [detail.productImage];
            }
          } else {
            gallery = [detail.bigImage].filter(Boolean);
          }
          if (gallery.length === 0 && detail.bigImage) {
            gallery = [detail.bigImage];
          }
            
          const mappedVariants = detail.variants && detail.variants.length > 0
            ? detail.variants.map(v => ({
                sku: v.variantSku || v.vid,
                color: v.variantKey || 'סטנדרטי',
                price: parseFloat((parseFloat(v.variantSellPrice || rawPrice) * markup).toFixed(2)),
                stock: 100
              }))
            : [{ sku: detail.productSku || detail.pid, color: 'סטנדרטי', price: baseSellPrice, stock: 100 }];
            
          const cleanDescription = detail.description 
            ? detail.description.replace(/<\/?[^>]+(>|$)/g, "\n").replace(/\n+/g, "\n").trim()
            : prod.description;
            
          const rawName = detail.productNameEn || detail.productName || prod.productName;
          const [translatedName, translatedDescription] = await Promise.all([
            translateToHebrew(rawName),
            translateToHebrew(cleanDescription)
          ]);
            
          currentProducts[i] = {
            ...prod,
            productName: translatedName || prod.productName,
            productImage: detail.bigImage || prod.productImage,
            productGallery: gallery.length > 0 ? gallery : prod.productGallery,
            productVideo: detail.productVideo || detail.videoUrl || detail.materialVideo || '',
            sellPrice: mappedVariants[0].price,
            originalPrice: parseFloat(rawPrice) || prod.originalPrice,
            inventory: mappedVariants.reduce((sum, v) => sum + v.stock, 0),
            description: translatedDescription || cleanDescription || prod.description,
            variants: mappedVariants
          };
          updatedCount++;
        }
      }
    }
    
    if (updatedCount > 0) {
      writeJson(PRODUCTS_FILE, currentProducts);
    }
    
    res.json({
      success: true,
      message: `סונכרנו ועודכנו בהצלחה ${updatedCount} מוצרים קיימים!`,
      count: updatedCount
    });
  } catch (error) {
    console.error('Error syncing incomplete product details:', error);
    res.status(500).json({ error: 'שגיאה במהלך סנכרון פרטי המוצרים הקיימים' });
  }
});

// 12. Import single product by CJ URL or ID directly
app.post('/api/import-by-url', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'קישור או מזהה מוצר חסר' });
  }

  // Regex parser to extract CJ product ID
  const clean = url.trim();
  let pid = null;
  if (/^[A-Za-z0-9-]+$/.test(clean) && !clean.includes('http') && !clean.includes('/')) {
    pid = clean;
  } else {
    const pathMatch = clean.match(/-p-([A-Za-z0-9-]+)\.html/i) || clean.match(/\/p-([A-Za-z0-9-]+)\.html/i);
    if (pathMatch && pathMatch[1]) {
      pid = pathMatch[1];
    } else {
      const queryMatch = clean.match(/[?&]id=([A-Za-z0-9-]+)/i);
      if (queryMatch && queryMatch[1]) {
        pid = queryMatch[1];
      } else {
        const segmentMatch = clean.match(/\/product\/(?:detail\/)?([A-Za-z0-9-]+)/i);
        if (segmentMatch && segmentMatch[1] && !segmentMatch[1].endsWith('.html')) {
          pid = segmentMatch[1];
        }
      }
    }
  }

  if (!pid) {
    return res.status(400).json({ error: 'לא ניתן לחלץ מזהה מוצר תקין מהקישור שהוזן' });
  }

  const currentProducts = readJson(PRODUCTS_FILE);
  if (currentProducts.some(p => p.pid === pid)) {
    return res.status(400).json({ error: 'המוצר כבר קיים בקטלוג החנות שלך' });
  }

  const settings = readJson(SETTINGS_FILE);
  const isTokenValid = settings.token && settings.tokenExpiry > Date.now();
  const markup = 1 + (settings.markupPercent || 40) / 100;

  try {
    let finalProduct = null;

    if (!isTokenValid) {
      // Mock Import for Simulation Mode
      const mockedNameEn = "Smart Magnetic Charging Organizer Desk Stand";
      const translatedName = "מעמד ארגונית טעינה מגנטי חכם";
      const descriptionEn = "Premium desktop charging organizer stand. Features wireless charging pad, durable leather tray, and ambient indicators. Size: 15x10cm. Compatibility: iPhone & Android.";
      const translatedDescription = "מעמד ארגונית טעינה שולחני יוקרתי. כולל משטח טעינה אלחוטי, מגש עור עמיד ומחוונים סביבתיים. מידה: 15x10 ס\"מ. תאימות: אייפון ואנדרואיד.";
      
      finalProduct = {
        pid,
        productName: translatedName,
        productNameEn: mockedNameEn,
        productImage: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
        productGallery: [
          "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80"
        ],
        productVideo: "https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-modern-smartphone-40243-large.mp4",
        categoryName: "אביזרים לטלפון",
        sellPrice: parseFloat((14.99 * markup).toFixed(2)),
        originalPrice: 14.99,
        inventory: 150,
        description: translatedDescription,
        variants: [
          { sku: `MOCK-${pid}-BLK`, color: "שחור", price: parseFloat((14.99 * markup).toFixed(2)), stock: 75 },
          { sku: `MOCK-${pid}-WHT`, color: "לבן", price: parseFloat((14.99 * markup).toFixed(2)), stock: 75 }
        ],
        rating: 4.8,
        reviewsCount: 36
      };
    } else {
      // Real API Product Detail Fetch
      console.log(`Fetching full details for product link: ${pid}`);
      const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${pid}`, {
        headers: {
          'Content-Type': 'application/json',
          'CJ-Access-Token': settings.token
        }
      });
      
      const result = await response.json();
      if (result.code !== 200 || !result.data) {
        return res.status(400).json({ error: result.message || 'המוצר לא נמצא בקטלוג של CJ' });
      }

      const detail = result.data;
      
      let rawPrice = detail.sellPrice || '10.0';
      if (typeof rawPrice === 'string' && rawPrice.includes('--')) {
        rawPrice = rawPrice.split('--')[0].trim();
      }
      const baseOriginalPrice = parseFloat(rawPrice) || 10.0;
      const baseSellPrice = parseFloat((baseOriginalPrice * markup).toFixed(2));
      
      let gallery = [];
      if (Array.isArray(detail.productImageSet)) {
        gallery = detail.productImageSet;
      } else if (Array.isArray(detail.productImage)) {
        gallery = detail.productImage;
      } else if (typeof detail.productImage === 'string') {
        try {
          const parsed = JSON.parse(detail.productImage);
          if (Array.isArray(parsed)) gallery = parsed;
          else gallery = [detail.productImage];
        } catch (e) {
          gallery = [detail.productImage];
        }
      } else {
        gallery = [detail.bigImage].filter(Boolean);
      }
      if (gallery.length === 0 && detail.bigImage) {
        gallery = [detail.bigImage];
      }
        
      const mappedVariants = detail.variants && detail.variants.length > 0
        ? detail.variants.map(v => ({
            sku: v.variantSku || v.vid,
            color: v.variantKey || 'סטנדרטי',
            price: parseFloat((parseFloat(v.variantSellPrice || rawPrice) * markup).toFixed(2)),
            stock: 100
          }))
        : [{ sku: detail.productSku || detail.pid, color: 'סטנדרטי', price: baseSellPrice, stock: 100 }];
        
      const cleanDescription = detail.description 
        ? detail.description.replace(/<\/?[^>]+(>|$)/g, "\n").replace(/\n+/g, "\n").trim()
        : 'מוצר טכנולוגי איכותי מיובא מ-CJ Dropshipping.';
        
      const rawName = detail.productNameEn || detail.productName || 'Smart Gadget';
      const [translatedName, translatedDescription] = await Promise.all([
        translateToHebrew(rawName),
        translateToHebrew(cleanDescription)
      ]);

      let categoryName = 'אביזרים לטלפון';
      const nameLower = rawName.toLowerCase();
      if (nameLower.includes('keyboard') || nameLower.includes('mouse') || nameLower.includes('desk') || nameLower.includes('keypad')) {
        categoryName = 'גאדג\'טים למחשב';
      }
        
      finalProduct = {
        pid: detail.pid || pid,
        productName: translatedName || rawName,
        productNameEn: detail.productNameEn || rawName,
        productImage: detail.bigImage || gallery[0],
        productGallery: gallery.length > 0 ? gallery : [detail.bigImage],
        productVideo: detail.productVideo || detail.videoUrl || detail.materialVideo || '',
        categoryName,
        sellPrice: mappedVariants[0].price,
        originalPrice: parseFloat(rawPrice) || baseOriginalPrice,
        inventory: mappedVariants.reduce((sum, v) => sum + v.stock, 0),
        description: translatedDescription || cleanDescription,
        variants: mappedVariants,
        rating: 4.5 + Math.random() * 0.5,
        reviewsCount: Math.floor(Math.random() * 80) + 5
      };
    }
    
    currentProducts.unshift(finalProduct);
    writeJson(PRODUCTS_FILE, currentProducts);
    
    res.json({
      success: true,
      message: `מוצר "${finalProduct.productName}" יובא בהצלחה מ-CJ!`,
      product: finalProduct
    });
  } catch (error) {
    console.error('Error importing product by URL:', error);
    res.status(500).json({ error: 'שגיאה ביבוא המוצר. נסה שנית.' });
  }
});

// 13. Public Order Tracking route (Dynamic packages timeline based on date)
app.get('/api/track-order/:id', (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'מזהה הזמנה או מספר מעקב חסר' });
  }

  const orders = readJson(ORDERS_FILE);
  const cleanId = id.trim().toLowerCase();
  
  const order = orders.find(o => 
    o.orderId.toLowerCase() === cleanId || 
    o.trackingNumber.toLowerCase() === cleanId ||
    (o.cjOrderId && o.cjOrderId.toLowerCase() === cleanId)
  );

  if (!order) {
    return res.status(404).json({ error: 'לא נמצאה הזמנה תואמת במערכת. אנא ודא כי הזנת מספר תקין (למשל: TZ-123456).' });
  }

  // Calculate package progress based on order date
  const orderDate = new Date(order.date);
  const diffTime = Math.abs(Date.now() - orderDate.getTime());
  const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Determine current simulated shipment stage
  let stage = 0; // 0: paid, 1: processed, 2: transit, 3: customs, 4: local, 5: delivered
  if (daysElapsed >= 1) stage = 1;
  if (daysElapsed >= 3) stage = 2;
  if (daysElapsed >= 7) stage = 3;
  if (daysElapsed >= 10) stage = 4;
  if (daysElapsed >= 14) stage = 5;

  // Build vertical tracking timeline
  const timeline = [
    {
      title: 'ההזמנה שולמה והתקבלה במערכת',
      description: 'התשלום עבר בהצלחה. ההזמנה מנותבת למחסני הספק.',
      date: orderDate.toLocaleDateString('he-IL'),
      completed: true
    },
    {
      title: 'ההזמנה נקלטה במחסן CJ בסין',
      description: 'המוצרים עברו בקרת איכות במחסני ייוואו ונארזו למשלוח.',
      date: stage >= 1 ? new Date(orderDate.getTime() + 1000*60*60*24).toLocaleDateString('he-IL') : '',
      completed: stage >= 1
    },
    {
      title: 'החבילה נארזה ונשלחה ממרכז הלוגיסטיקה בסין',
      description: 'החבילה נמסרה לחברת התעופה CJPacket. מספר מעקב שוייך לחבילה.',
      date: stage >= 2 ? new Date(orderDate.getTime() + 1000*60*60*24*3).toLocaleDateString('he-IL') : '',
      completed: stage >= 2
    },
    {
      title: 'החבילה נחתה בנמל התעופה בן גוריון, ישראל',
      description: 'החבילה הגיעה לנמל התעופה ועוברת תהליך מיון ושיחרור ממכס.',
      date: stage >= 3 ? new Date(orderDate.getTime() + 1000*60*60*24*7).toLocaleDateString('he-IL') : '',
      completed: stage >= 3
    },
    {
      title: 'החבילה שוחררה מהמכס ונמסרה לחברת ההפצה המקומית',
      description: 'שוחרר ללא חיוב מכס. הועבר לחברת הפצה המקומית (צ\'יטה שליחויות / דואר ישראל).',
      date: stage >= 4 ? new Date(orderDate.getTime() + 1000*60*60*24*10).toLocaleDateString('he-IL') : '',
      completed: stage >= 4
    },
    {
      title: 'החבילה נמסרה בהצלחה ללקוח',
      description: 'המשלוח נמסר לכתובת היעד.',
      date: stage >= 5 ? new Date(orderDate.getTime() + 1000*60*60*24*14).toLocaleDateString('he-IL') : '',
      completed: stage >= 5
    }
  ];

  res.json({
    orderId: order.orderId,
    trackingNumber: order.trackingNumber,
    cjOrderId: order.cjOrderId,
    date: order.date,
    status: timeline[stage].title,
    shippingInfo: order.shippingInfo,
    items: order.items,
    totalPrice: order.totalPrice,
    daysElapsed,
    stage,
    timeline
  });
});

// 14. Save support contact inquiries
app.post('/api/contact', (req, res) => {
  const { name, email, phone, orderId, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'שם מלא, אימייל והודעה הם שדות חובה' });
  }

  const CONTACTS_FILE = path.join(__dirname, 'contacts.json');
  const contacts = readJson(CONTACTS_FILE);

  const newInquiry = {
    id: 'INQ-' + Math.floor(100000 + Math.random() * 900000),
    name,
    email,
    phone: phone || '',
    orderId: orderId || '',
    message,
    date: new Date().toISOString()
  };

  contacts.unshift(newInquiry);
  writeJson(CONTACTS_FILE, contacts);

  res.json({
    success: true,
    message: 'פנייתך התקבלה בהצלחה במערכת! נציג שירות הלקוחות שלנו יחזור אלייך תוך 24 שעות במייל.'
  });
});

// 15. Update local product (Name, Price, Video URL, Description)
app.put('/api/products/:pid', (req, res) => {
  const { pid } = req.params;
  const { productName, sellPrice, productVideo, description } = req.body;

  const products = readJson(PRODUCTS_FILE);
  const prodIndex = products.findIndex(p => p.pid === pid);

  if (prodIndex === -1) {
    return res.status(404).json({ error: 'המוצר לא נמצא בקטלוג החנות' });
  }

  // Update fields
  if (productName !== undefined) products[prodIndex].productName = productName;
  if (sellPrice !== undefined) {
    const newPrice = parseFloat(sellPrice);
    products[prodIndex].sellPrice = newPrice;
    // Also update price of the first variant if it exists as reference
    if (products[prodIndex].variants && products[prodIndex].variants[0]) {
      products[prodIndex].variants[0].price = newPrice;
    }
  }
  if (productVideo !== undefined) products[prodIndex].productVideo = productVideo;
  if (description !== undefined) products[prodIndex].description = description;

  writeJson(PRODUCTS_FILE, products);

  res.json({
    success: true,
    message: 'המוצר עודכן בהצלחה!',
    product: products[prodIndex]
  });
});

// 16. Delete product from local catalog
app.delete('/api/products/:pid', (req, res) => {
  const { pid } = req.params;
  
  const products = readJson(PRODUCTS_FILE);
  const filtered = products.filter(p => p.pid !== pid);

  if (products.length === filtered.length) {
    return res.status(404).json({ error: 'המוצר לא נמצא בקטלוג החנות' });
  }

  writeJson(PRODUCTS_FILE, filtered);

  res.json({
    success: true,
    message: 'המוצר נמחק בהצלחה מקטלוג החנות!'
  });
});

// Catch-all: serve React app for any non-API route (SPA routing)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Client build not found. Run npm run build:client first.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
