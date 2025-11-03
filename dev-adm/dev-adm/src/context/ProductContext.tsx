import React, { createContext, useContext, useState, ReactNode } from 'react';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Define product type (adjust fields based on your Firestore schema)
export interface Product {
  id: string;
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  discount?: number;
  stock?: number;
  sku?: string;
  mainImage?: string;
  addOnImages?: string[];
  [key: string]: any; // fallback for extra fields
}

interface ProductContextType {
  allProducts: Product[];
  loading: boolean;
  error: Error | null;
  fetchProducts: () => Promise<void>;
  addProduct: (newProduct: Product) => void;
  updateProduct: (updatedProduct: Product) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const products: Product[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      }));
      setAllProducts(products);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (newProduct: Product) => {
    setAllProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setAllProducts(prev =>
      prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  return (
    <ProductContext.Provider
      value={{
        allProducts,
        loading,
        error,
        fetchProducts,
        addProduct,
        updateProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
