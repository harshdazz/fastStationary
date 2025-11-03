"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export type FeaturedProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  [key: string]: any; // allow extra fields from Firestore
};

type FeaturedContextType = {
  featured: FeaturedProduct[];
  loading: boolean;
  error: string | null;
  fetchFeatured: () => Promise<void>;
  addToFeaturedOrReorder: (product: FeaturedProduct) => Promise<void>;
  removeFromFeatured: (productId: string) => Promise<void>;
};

const FeaturedContext = createContext<FeaturedContextType>({} as FeaturedContextType);

export const FeaturedProvider = ({ children }: { children: ReactNode }) => {
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = async () => {
    setLoading(true);
    setError(null);
    try {
      const ref = doc(db, "meta", "featured");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const list = Array.isArray(data?.featured) ? data.featured : [];
        setFeatured(list as FeaturedProduct[]);
      } else {
        await setDoc(ref, { featured: [] });
        setFeatured([]);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch featured:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addToFeaturedOrReorder = async (product: FeaturedProduct) => {
    const ref = doc(db, "meta", "featured");
    try {
      const snap = await getDoc(ref);
      let current: FeaturedProduct[] = [];

      if (snap.exists()) {
        current = (snap.data().featured as FeaturedProduct[]) || [];
      }

      const exists = current.find((p) => p.id === product.id);

      if (exists) {
        // Move product to top
        current = [exists, ...current.filter((p) => p.id !== product.id)];
        await updateDoc(ref, { featured: current });
        setFeatured(current);
        alert("Moved to top of featured list.");
      } else if (current.length < 30) {
        // Add product to top
        current.unshift(product);
        await updateDoc(ref, { featured: current });
        setFeatured(current);
        alert("Product added to featured list.");
      } else {
        alert("Featured list is full (max 30). Remove one to add more.");
      }
    } catch (err) {
      console.error("Failed to update featured list:", err);
      alert("Error updating featured list.");
    }
  };

const removeFromFeatured = async (productId: string) => {
  console.log("Removing product from featured:", productId);
  const ref = doc(db, "meta", "featured");

  try {
    // Fetch current featured list
    const snap = await getDoc(ref);
    let current: FeaturedProduct[] = [];

    if (snap.exists()) {
      current = (snap.data().featured as FeaturedProduct[]) || [];
    }

    // Remove the product from the featured array
    const newList = current.filter((p) => p.id !== productId);
    await updateDoc(ref, { featured: newList });
    setFeatured(newList);

    // Update the product document itself -> set isFeatured to false
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { isFeatured: false });

    alert("Product removed from featured list.");
  } catch (err) {
    console.error("Failed to remove from featured list:", err);
    alert("Error removing product from featured list.");
  }
};


  return (
    <FeaturedContext.Provider
      value={{
        featured,
        loading,
        error,
        fetchFeatured,
        addToFeaturedOrReorder,
        removeFromFeatured,
      }}
    >
      {children}
    </FeaturedContext.Provider>
  );
};

export const useFeatured = () => useContext(FeaturedContext);
