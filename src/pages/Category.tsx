// src/pages/category.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  mainImage: string;
  mrp?: number; 
  category: string;
  shippingPrice?: number;
  moq?: number; // added MOQ support
}

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity, updateSize } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sizeInputs, setSizeInputs] = useState<{ [key: string]: string }>({});

  // Prefill sizeInputs from cartItems
  useEffect(() => {
    const sizesFromCart: { [key: string]: string } = {};
    cartItems.forEach((item) => {
      sizesFromCart[item.id] = item.size || "";
    });
    setSizeInputs(sizesFromCart);
  }, [cartItems]);

  const getProductQuantity = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleSizeChange = (product: Product, value: string) => {
    // Validate and limit total quantity to 999999
    const numbers = value.match(/\d+/g)?.map(Number) || [];
    const totalQty = numbers.reduce((sum, num) => sum + num, 0);
    
    if (totalQty > 999999) {
      // If total exceeds limit, don't update the input
      return;
    }
    
    setSizeInputs((prev) => ({ ...prev, [product.id]: value }));

    const totalFromSize =
      value.match(/\d+/g)?.map(Number).reduce((sum, num) => sum + num, 0) || 0;

    const discountedPrice =
      product.price - ((product.discount ?? 0) / 100) * product.price;

    if (!value.trim() || totalFromSize <= 0) {
      updateQuantity(product.id, 0);
      return;
    }

    const currentQuantity = getProductQuantity(product.id);

    if (currentQuantity > 0) {
      updateSize(product.id, value, discountedPrice);
    } else {
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: discountedPrice,
          image: product.mainImage,
          category: product.category,
          shippingPrice: product.shippingPrice,
        },
        value
      );
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", category)
        );
        const snapshot = await getDocs(q);
        const fetched: Product[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));
        setProducts(fetched);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  return (
    <>
      <Navbar />
      <section className="py-20 bg-gradient-elegant mt-5">
        <div className="container mx-auto px-4">
          <div className="section-header">
            <h2 className="section-title capitalize">{category}</h2>
          </div>

          {loading && (
            <p className="text-center text-muted-foreground">
              Loading products...
            </p>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && products.length === 0 && (
            <p className="text-center text-muted-foreground">
              No products found.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => {
              const quantity = getProductQuantity(product.id);
              const price = `Rs ${product.price.toFixed(2)}`;
              const discountedPrice =
                product.discount && product.discount > 0
                  ? `Rs ${(
                      product.price -
                      (product.price * product.discount) / 100
                    ).toFixed(2)}`
                  : price;
              // Calculate MRP if not provided - assume 20% markup from our price
              const mrp = product.mrp || Math.round((product.discount && product.discount > 0 ? (product.price - (product.price * product.discount) / 100) : product.price) * 1.2);

              const moq = product.moq || 1;
              const isBelowMOQ = quantity < moq;
              
              // Calculate total quantity from size input with max limit
              const totalQuantity = Math.min(
                (sizeInputs[product.id] || "").match(/\d+/g)?.map(Number).reduce((sum, num) => sum + num, 0) || 0,
                999999
              );
              
              // Calculate total prices based on quantity
              const totalPrice = (product.discount && product.discount > 0 ? (product.price - (product.price * product.discount) / 100) : product.price) * totalQuantity;
              const totalMrp = mrp * totalQuantity;

              return (
                <Card
                  key={product.id}
                  className="product-card group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="relative overflow-hidden rounded-t-xl"
                    onClick={() =>
                      navigate(`/product/${product.id}`, { state: { product } })
                    }
                  >
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-full h-64 object-contain bg-white group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">
                          {product.discount}% Discount
                        </span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </h3>
                    <div className="text-muted-foreground text-sm mb-3">
                      <div className="flex flex-col mb-2">
                        <span className="font-bold text-primary text-lg md:text-xl">
                          FT Price: {totalQuantity > 0 ? `Rs ${totalPrice.toFixed(2)}` : discountedPrice}
                        </span>
                        <span className="font-bold text-red-600 text-base md:text-lg line-through">
                          MRP Price: {totalQuantity > 0 ? `Rs ${totalMrp.toFixed(2)}` : `Rs ${mrp}`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        MOQ: {moq} Pcs
                        {totalQuantity > 0 && (
                          <span className="ml-2 text-green-600 font-semibold">
                            Qty: {totalQuantity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Size input with description */}
                    <input
                      type="text"
                      placeholder="Enter sizewise qty required"
                      value={sizeInputs[product.id] || ""}
                      onChange={(e) => handleSizeChange(product, e.target.value)}
                      className="w-full mb-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary text-sm"
                    />

                    {quantity > 0 ? (
                      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                        <div className="flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-full shadow-sm overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none hover:bg-white/20 transition"
                            onClick={() => {
                              const newQty = Math.max(0, quantity - 1);
                              updateQuantity(product.id, newQty);
                              // Update size input to reflect new quantity
                              setSizeInputs((prev) => ({ ...prev, [product.id]: newQty.toString() }));
                            }}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-4 text-lg font-semibold">
                            {quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none hover:bg-white/20 transition"
                            onClick={() => {
                              const newQty = Math.min(999999, quantity + 1);
                              updateQuantity(product.id, newQty);
                              // Update size input to reflect new quantity
                              setSizeInputs((prev) => ({ ...prev, [product.id]: newQty.toString() }));
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          size="lg"
                          className={`flex-1 min-w-[140px] p-2 text-white font-semibold shadow-lg rounded transition-all duration-200 ${
                            isBelowMOQ
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-pink-500 to-red-500 hover:shadow-xl hover:scale-[1.02]"
                          }`}
                          onClick={() => navigate("/cart")}
                          disabled={isBelowMOQ}
                        >
                          Buy Now
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full hover-scale"
                        onClick={() =>
                          addToCart(
                            {
                              id: product.id,
                              name: product.name,
                              price:
                                product.price -
                                ((product.discount ?? 0) / 100) *
                                  product.price,
                              image: product.mainImage,
                              category: product.category,
                              shippingPrice: product.shippingPrice,
                            },
                            sizeInputs[product.id] || ""
                          )
                        }
                      >
                        Add to Cart
                      </Button>
                    )}

                    {/* MOQ Warning */}
                    {isBelowMOQ && quantity > 0 && (
                      <p className="mt-1 text-red-600 text-sm font-semibold">
                        Order Quantity must be at least {moq} Pcs
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default CategoryPage;
