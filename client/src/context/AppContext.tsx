import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Variant {
  sku: string;
  color: string;
  price: number;
  stock: number;
}

export interface Product {
  pid: string;
  productName: string;
  productNameEn: string;
  productImage: string;
  productGallery: string[];
  productVideo?: string; // Support product video MP4 files from CJ
  categoryName: string;
  sellPrice: number;
  originalPrice: number;
  inventory: number;
  description: string;
  variants: Variant[];
  rating: number;
  reviewsCount: number;
}

export interface CartItem {
  product: Product;
  variant: Variant;
  quantity: number;
}

export interface Order {
  orderId: string;
  date: string;
  items: { productName: string; variantColor: string; quantity: number; price: number }[];
  shippingInfo: { name: string; phone: string; address: string; city: string };
  status: string;
  totalPrice: number;
  cjOrderId: string;
  trackingNumber: string;
}

export interface ApiSettings {
  apiKey: string;
  isConnected: boolean;
  tokenExpiry?: number;
  markupPercent?: number;
  exchangeRate?: number;
}

interface AppContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  apiSettings: ApiSettings;
  activePage: 'store' | 'admin' | 'orders' | 'track' | 'support';
  adminSubTab: 'settings' | 'products';
  selectedProduct: Product | null;
  loading: boolean;
  isSyncing: boolean;
  syncLogs: string[];
  setPage: (page: 'store' | 'admin' | 'orders' | 'track' | 'support') => void;
  setAdminSubTab: (tab: 'settings' | 'products') => void;
  setSelectedProduct: (product: Product | null) => void;
  addToCart: (product: Product, variant: Variant, quantity: number) => void;
  removeFromCart: (sku: string) => void;
  updateCartQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (shippingInfo: { name: string; phone: string; address: string; city: string }) => Promise<any>;
  saveSettings: (apiKey: string, markupPercent?: number) => Promise<void>;
  disconnectApi: () => Promise<void>;
  syncProducts: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  searchCj: (keyword: string, page?: number) => Promise<{ products: Product[]; total: number }>;
  importProducts: (products: Product[]) => Promise<void>;
  formatPrice: (usdPrice: number) => string;
  syncIncompleteDetails: () => Promise<{ success: boolean; count: number }>;
  importProductByUrl: (url: string) => Promise<{ success: boolean; product: Product }>;
  trackOrder: (id: string) => Promise<any>;
  submitContact: (inquiry: { name: string; email: string; phone?: string; orderId?: string; message: string }) => Promise<any>;
  updateProduct: (pid: string, fields: any) => Promise<any>;
  deleteProduct: (pid: string) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Production backend on Render - serves all users worldwide
export const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : 'https://cj-gadget-store.onrender.com/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({ apiKey: '', isConnected: false });
  const [activePage, setPageInternal] = useState<'store' | 'admin' | 'orders' | 'track' | 'support'>('store');
  const [adminSubTab, setAdminSubTab] = useState<'settings' | 'products'>('settings');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  const setPage = (page: 'store' | 'admin' | 'orders' | 'track' | 'support') => {
    setPageInternal(page);
    if (page !== 'store') {
      setSelectedProduct(null);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchSettings(), fetchOrders()]);
      setLoading(false);
    };
    init();
    
    // Load cart from LocalStorage
    const savedCart = localStorage.getItem('tz_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('tz_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setApiSettings(data);
      }
    } catch (err) {
      console.error('Error fetching API settings:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const saveSettings = async (apiKey: string, markupPercent: number = 40) => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, markupPercent })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בשמירת הגדרות');
      }
      await fetchSettings();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const disconnectApi = async () => {
    try {
      await fetch(`${API_BASE_URL}/settings/disconnect`, { method: 'POST' });
      setApiSettings({ apiKey: '', isConnected: false });
      await fetchProducts(); // Fetch mock fallback products
    } catch (err) {
      console.error('Error disconnecting API:', err);
    }
  };

  const syncProducts = async () => {
    setIsSyncing(true);
    setSyncLogs(['מתחיל סנכרון...']);
    try {
      const res = await fetch(`${API_BASE_URL}/sync`, { method: 'POST' });
      const data = await res.json();
      if (data.logs) {
        setSyncLogs(data.logs);
      }
      if (res.ok) {
        await fetchProducts();
      } else {
        setSyncLogs(prev => [...prev, 'שגיאה בסנכרון: ' + (data.error || 'שגיאה כללית')]);
      }
    } catch (err: any) {
      setSyncLogs(prev => [...prev, 'שגיאת רשת בחיבור לשרת: ' + err.message]);
    } finally {
      setIsSyncing(false);
    }
  };

  const addToCart = (product: Product, variant: Variant, quantity: number) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.variant.sku === variant.sku);
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      return [...prev, { product, variant, quantity }];
    });
  };

  const removeFromCart = (sku: string) => {
    setCart(prev => prev.filter(item => item.variant.sku !== sku));
  };

  const updateCartQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(sku);
      return;
    }
    setCart(prev => prev.map(item => item.variant.sku === sku ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async (shippingInfo: { name: string; phone: string; address: string; city: string }) => {
    try {
      const cartData = cart.map(item => ({
        pid: item.product.pid,
        productName: item.product.productName,
        sku: item.variant.sku,
        variantColor: item.variant.color,
        quantity: item.quantity,
        price: item.variant.price
      }));

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cartData, shippingInfo })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בביצוע ההזמנה');
      }

      clearCart();
      await fetchOrders();
      return data.order;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const searchCj = async (keyword: string, page: number = 1): Promise<{ products: Product[]; total: number }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/search-cj?keyword=${encodeURIComponent(keyword)}&page=${page}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בחיפוש מוצרים ב-CJ');
      }
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const importProducts = async (productsToImport: Product[]): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE_URL}/import-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsToImport })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בייבוא מוצרים');
      }
      await fetchProducts(); // Refresh local catalog
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const formatPrice = (usdPrice: number): string => {
    const rate = apiSettings.exchangeRate || 3.70;
    return `₪${(usdPrice * rate).toFixed(2)}`;
  };

  const syncIncompleteDetails = async (): Promise<{ success: boolean; count: number }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/sync-incomplete`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בסנכרון פרטי מוצרים');
      }
      await fetchProducts(); // Refresh local list
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const importProductByUrl = async (url: string): Promise<{ success: boolean; product: Product }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/import-by-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בייבוא המוצר');
      }
      await fetchProducts(); // Refresh local catalog
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const trackOrder = async (id: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/track-order/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ההזמנה לא נמצאה במערכת');
      }
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const submitContact = async (inquiry: any): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiry)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בשליחת פנייה');
      }
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const updateProduct = async (pid: string, fields: any): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${pid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'שגיאה בעדכון המוצר');
      }
      await fetchProducts(); // Refresh local catalog
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const deleteProduct = async (pid: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${pid}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'שגיאה במחיקת המוצר');
      }
      await fetchProducts(); // Refresh local catalog
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      products, orders, cart, apiSettings, activePage, adminSubTab, selectedProduct, loading, isSyncing, syncLogs,
      setPage, setAdminSubTab, setSelectedProduct, addToCart, removeFromCart, updateCartQuantity, clearCart, checkout,
      saveSettings, disconnectApi, syncProducts, fetchProducts, fetchOrders, searchCj, importProducts,
      formatPrice, syncIncompleteDetails, importProductByUrl, trackOrder, submitContact, updateProduct, deleteProduct
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
