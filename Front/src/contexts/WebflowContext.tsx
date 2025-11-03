import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface FeaturedProduct {
  addOnImages?: string[];
  category: string;
  createdAt?: any;
  description: string;
  discount: number;
  id: string;
  mainImage: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
}

interface WebflowData {
  banner: string[];
  categories: { icon: string; name: string }[];
  discount: number;
  minimumPurchaseAmount?: number;
  minimumpurchaseAmount?: number;
  sale: { isActive: boolean };
}

interface WebflowContextType {
  webflowData: WebflowData | null;
  webflowLoading: boolean;
  webflowError: string | null;
  featuredData: FeaturedProduct[] | null;
  featuredLoading: boolean;
  featuredError: string | null;
}

const WebflowContext = createContext<WebflowContextType | undefined>(undefined);

export const useWebflow = () => {
  const ctx = useContext(WebflowContext);
  if (!ctx) throw new Error("useWebflow must be used within WebflowProvider");
  return ctx;
};

export const WebflowProvider = ({ children }: { children: ReactNode }) => {
  const [webflowData, setWebflowData] = useState<WebflowData | null>(null);
  const [webflowLoading, setWebflowLoading] = useState(true);
  const [webflowError, setWebflowError] = useState<string | null>(null);

  const [featuredData, setFeaturedData] = useState<FeaturedProduct[] | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  useEffect(() => {
    const loadMockData = () => {
      // Mock webflow data - Stationary themed
      const mockWebflowData: WebflowData = {
        banner: [
          "/banner.png" // Local banner image from public folder
        ],
        categories: [
          { icon: "📝", name: "notebooks" },
          { icon: "✏️", name: "pens" },
          { icon: "📚", name: "books" },
          { icon: "📎", name: "office-supplies" },
          { icon: "🎨", name: "art-supplies" }
        ],
        discount: 0,
        minimumPurchaseAmount: 1000,
        sale: { isActive: false }
      };

      // Mock featured products - Stationary themed
      const mockFeaturedProducts: FeaturedProduct[] = [
        {
          id: "mock-1", // Match the main products IDs
          name: "Premium Notebook Set",
          price: 299,
          discount: 25,
          category: "notebooks",
          mainImage: "/assest/sample-product-1.jpg",
          description: "High-quality premium notebook set with lined pages and durable hardcover binding.",
          sku: "NB-001",
          stock: 100,
          addOnImages: ["/assest/sample-product-2.jpg"]
        },
        {
          id: "mock-2", // Match the main products IDs
          name: "Professional Pen Collection",
          price: 899,
          discount: 30,
          category: "pens",
          mainImage: "/assest/sample-product-2.jpg",
          description: "Premium ballpoint and gel pen collection for professional writing needs.",
          sku: "PEN-001",
          stock: 80,
          addOnImages: ["/assest/sample-product-3.jpg"]
        },
        {
          id: "mock-3", // Match the main products IDs
          name: "Office Supply Bundle",
          price: 799,
          discount: 33,
          category: "office-supplies",
          mainImage: "/assest/sample-product-3.jpg",
          description: "Complete office supply bundle with staplers, clips, folders, and organizers.",
          sku: "OFF-001",
          stock: 60,
          addOnImages: ["/assest/sample-product-1.jpg"]
        },
        {
          id: "mock-4", // Match the main products IDs
          name: "Art Supplies Kit",
          price: 1299,
          discount: 32,
          category: "art-supplies",
          mainImage: "/assest/sample-product-1.jpg",
          description: "Professional art supplies kit with pencils, markers, brushes, and drawing pads.",
          sku: "ART-001",
          stock: 45,
          addOnImages: ["/assest/sample-product-2.jpg"]
        }
      ];

      // Simulate loading
      setTimeout(() => {
        setWebflowData(mockWebflowData);
        setWebflowLoading(false);
        
        // Load featured products after webflow data
        setTimeout(() => {
          setFeaturedData(mockFeaturedProducts);
          setFeaturedLoading(false);
        }, 500);
      }, 500);
    };

    loadMockData();
  }, []);

  return (
    <WebflowContext.Provider
      value={{
        webflowData,
        webflowLoading,
        webflowError,
        featuredData,
        featuredLoading,
        featuredError,
      }}
    >
      {children}
    </WebflowContext.Provider>
  );
};
