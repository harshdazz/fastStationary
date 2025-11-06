// /contexts/ProductContext.tsx - CONNECTED TO FIREBASE
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
 // make sure this points to your firebase.ts file

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  discount: number;
  category: string;
  mainImage: string;
  addOnImages?: string[];
  description?: string;
  moq?: number;
  shippingPrice?: number;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true,
  error: "",
  getProductById: () => undefined,
});

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductById = (id: string) => products.find((p) => p.id === id);

  return (
    <ProductContext.Provider value={{ products, loading, error, getProductById }}>
      {children}
    </ProductContext.Provider>
  );
};
