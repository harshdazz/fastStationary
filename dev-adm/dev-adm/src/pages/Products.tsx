import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  mainImage: string;
  isFeatured?: boolean;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "products"));
      const data: Product[] = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Product, "id">),
      }));
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Toggle Featured (updates both product + featured array)
 const toggleFeatured = async (product: Product) => {
  const featuredRef = doc(db, "meta", "featured");

  try {
    // 1️⃣ update product doc itself
    const productRef = doc(db, "products", product.id);
    await updateDoc(productRef, { isFeatured: !product.isFeatured });

    // 2️⃣ update featured array
    const snap = await getDoc(featuredRef);
    let featured: Product[] = [];
    if (snap.exists()) {
      featured = snap.data().featured || [];
    } else {
      await setDoc(featuredRef, { featured: [] });
    }

    let updated: Product[] = [];
    if (!product.isFeatured) {
      // Add full product data (move to front)
      updated = [
        { ...product, isFeatured: true }, // store complete product
        ...featured.filter((p) => p.id !== product.id),
      ];
    } else {
      // Remove from featured
      updated = featured.filter((p) => p.id !== product.id);
    }

    await updateDoc(featuredRef, { featured: updated });

    // update local state
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p
      )
    );

    toast({
      title: "Product Updated",
      description: `${product.name} ${
        product.isFeatured ? "removed from" : "added to"
      } featured products.`,
    });
  } catch (err) {
    console.error("Error updating featured:", err);
    toast({
      title: "Error",
      description: "Failed to update featured list",
      variant: "destructive",
    });
  }
};

// Delete Product (also removes from featured array)
const deleteProduct = async (product: Product) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${product.name}?`
  );
  if (!confirmDelete) return;

  try {
    // 1️⃣ Delete product doc
    await deleteDoc(doc(db, "products", product.id));

    // 2️⃣ Remove from featured list
    const featuredRef = doc(db, "meta", "featured");
    const snap = await getDoc(featuredRef);
    if (snap.exists()) {
      const featured: Product[] = snap.data().featured || [];
      const updated = featured.filter((p) => p.id !== product.id);
      await updateDoc(featuredRef, { featured: updated });
    }

    // Update local state
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    toast({
      title: "Product Deleted",
      description: `${product.name} has been deleted successfully.`,
      variant: "destructive",
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    toast({
      title: "Error",
      description: "Failed to delete product",
      variant: "destructive",
    });
  }
};


  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-10">
        Loading products...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Products Management
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Manage your product catalog and featured items
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => navigate("/add")}
        >
          Add New Product
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground text-center">
          No products found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className="glass-card hover:scale-105 transition-all duration-200 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  {product.isFeatured && (
                    <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge
                    variant={
                      product.stock > 10
                        ? "default"
                        : product.stock > 0
                        ? "secondary"
                        : "destructive"
                    }
                    className="absolute top-2 left-2"
                  >
                    Stock: {product.stock}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                <p className="text-muted-foreground text-sm mb-3">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">
                    ₹{product.price}
                  </span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeatured(product)}
                    className={
                      product.isFeatured ? "text-warning border-warning" : ""
                    }
                  >
                    <Star
                      className={`h-4 w-4 mr-1 ${
                        product.isFeatured ? "fill-current" : ""
                      }`}
                    />
                    {product.isFeatured ? "Unfeature" : "Feature"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/editproduct/${product.id}`)
                    }
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProduct(product)}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
