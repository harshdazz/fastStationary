import React, { useEffect } from "react";
import { useFeatured } from "../context/FeaturedContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { StarOff, Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  mainImage: string;
  category: string;
  description: string;
  stock?: number;
}

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { featured, fetchFeatured, removeFromFeatured } = useFeatured();

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  const handleEdit = (id: string) => {
    navigate(`/admin/editproduct/${id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product? This action is permanent."
    );
    if (!confirmDelete) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "products", id));
      // Remove from Featured context
      await removeFromFeatured(id);

      toast({
        title: "Product Deleted",
        description: "The product and its featured status have been removed.",
      });
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast({
        title: "Error",
        description: "An error occurred while deleting the product.",
        variant: "destructive",
      });
    }
  };

  if (!featured || featured.length === 0) {
    return (
      <Card className="glass-card text-center py-12">
        <CardContent>
          <h3 className="text-xl font-semibold mb-2 text-white">
            No Featured Products
          </h3>
          <p className="text-muted-foreground">
            Go to the Products page in the admin dashboard to mark items as
            featured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Featured Products
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Manage your showcase items here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {featured.map((item: any, index: number) => {
          const product: Product = item.product ?? item; // handles both shapes
          return (
            <Card
              key={product.id}
              className="glass-card hover:scale-105 transition-all duration-300 group animate-float"
              style={{
                animationDelay: `${index * 100}ms`,
                animationDuration: `${3 + (index % 3)}s`,
              }}
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  </div>
              </CardHeader>

              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    ₹{product.price}
                  </span>
                  <Badge
                    variant="outline"
                    className="glass border-primary/30 text-primary"
                  >
                    {product.category}
                  </Badge>
                </div>

                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Stock</span>
                    <span
                      className={
                        product.stock && product.stock > 10
                          ? "text-green-500"
                          : product.stock && product.stock > 0
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    >
                      {product.stock ?? 0} units
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromFeatured(product.id)}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
