import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// ------------------ Types ------------------ //
export interface WebflowSale {
  isActive: boolean;
  saleObject: Record<string, any>;
  minimumPurchaseAmount?: number;
  discount?: number;
}

export interface WebflowData {
  categories: { name: string; icon: string}[];
  banner: string[];
  sale: WebflowSale;
  minimumPurchaseAmount: number;
  discount: number;
}

interface WebflowContextType {
  webflowData: WebflowData | null;
  loading: boolean;
  updateCategories: (newCategories: { name: string; icon: string }[]) => Promise<void>;

  updateWebflow: (params: {
    banner?: string[];
    minimumPurchaseAmount?: number;
    discount?: number;
  }) => Promise<void>;
  createWebflowDoc: () => Promise<void>;
}

interface WebflowProviderProps {
  children: ReactNode;
}

// ------------------ Context ------------------ //
const WebflowContext = createContext<WebflowContextType | undefined>(undefined);

export const WebflowProvider: React.FC<WebflowProviderProps> = ({ children }) => {
  const [webflowData, setWebflowData] = useState<WebflowData | null>(null);
  const [loading, setLoading] = useState(true);

  const docRef = doc(db, "webflow", "webflowData");

  useEffect(() => {
    if (webflowData) return;

    const fetchData = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWebflowData(docSnap.data() as WebflowData);
        }
      } catch (err) {
        console.log("❌ Failed to fetch webflow data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [webflowData]);

  // ✅ Update categories field
  const updateCategories = async (newCategories: {name: string; icon: string}[]) => {
    try {
      await updateDoc(docRef, { categories: newCategories });
      setWebflowData((prev) =>
        prev ? { ...prev, categories: newCategories } : { ...defaultData, categories: newCategories }
      );
    } catch (err: any) {
      if (err.code === "not-found") {
        const defaultData: WebflowData = {
          categories: newCategories,
          banner: [],
          sale: {
            isActive: false,
            saleObject: {},
            minimumPurchaseAmount: 0,
            discount: 0,
          },
          minimumPurchaseAmount: 0,
          discount: 0,
        };
        try {
          await setDoc(docRef, defaultData);
          setWebflowData(defaultData);
          console.warn("🆕 Created new webflow document with categories.");
        } catch (createErr) {
          console.error("❌ Failed to create webflow document:", createErr);
        }
      } else {
        console.error("❌ Failed to update categories:", err);
      }
    }
  };

  // ✅ Update banner + purchase amount + discount
  const updateWebflow = async ({
    banner = [],
    minimumPurchaseAmount = 0,
    discount = 0,
  }: {
    banner?: string[];
    minimumPurchaseAmount?: number;
    discount?: number;
  }) => {
    try {
      await updateDoc(docRef, { banner, minimumPurchaseAmount, discount });
      setWebflowData((prev) =>
        prev
          ? { ...prev, banner, minimumPurchaseAmount, discount }
          : {
              ...defaultData,
              banner,
              minimumPurchaseAmount,
              discount,
            }
      );
    } catch (err) {
      console.error("❌ Failed to update banner/minimumPurchaseAmount/discount:", err);
    }
  };

  // ✅ Create default document
  const defaultData: WebflowData = {
    categories: [],
    banner: [],
    sale: { isActive: false, saleObject: {}, minimumPurchaseAmount: 0, discount: 0 },
    minimumPurchaseAmount: 0,
    discount: 0,
  };

  const createWebflowDoc = async () => {
    try {
      await setDoc(docRef, defaultData);
      setWebflowData(defaultData);
    } catch (err) {
      console.error("❌ Failed to create webflow document:", err);
    }
  };

  return (
    <WebflowContext.Provider
      value={{
        webflowData,
        updateCategories,
        updateWebflow,
        createWebflowDoc,
        loading,
      }}
    >
      {children}
    </WebflowContext.Provider>
  );
};

// ------------------ Hook ------------------ //
export const useWebflow = (): WebflowContextType => {
  const context = useContext(WebflowContext);
  if (!context) {
    throw new Error("useWebflow must be used within a WebflowProvider");
  }
  return context;
};
