import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useEmblaCarousel from "embla-carousel-react";
import ImageMagnifier from "@/components/ImageMagnifier";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;           // MRP (Maximum Retail Price) for showing crossed out price
  discount: number;
  category: string;
  description: string;
  mainImage: string;
  addOnImages?: string[];
  sku?: string;
  stock?: number;
  moq?: number;
  fabric?: string;
  color?: string;
  size?: string;
  shippingPrice?: number;
}

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity, updateSize } = useCart();
  const { products, loading: productsLoading, getProductById } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [sizeInputs, setSizeInputs] = useState<{ [key: string]: string }>({});

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setActiveIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  const allImages = product ? [product.mainImage, ...(product.addOnImages || [])] : [];

  // Get product from ProductContext
  useEffect(() => {
    if (!id || productsLoading) return;
    
    const foundProduct = getProductById(id);
    if (foundProduct) {
      setProduct(foundProduct as Product);
    } else {
      // If product not found by ID, try to find by matching name or other criteria
      // This handles cases where the ID might be different between collections
      navigate("/");
    }
  }, [id, products, productsLoading, getProductById, navigate]);


  // Sync cart sizes
  useEffect(() => {
    const sizesFromCart: { [key: string]: string } = {};
    cartItems.forEach((item) => {
      if (item.size) sizesFromCart[item.id] = item.size;
    });
    setSizeInputs((prev) => ({ ...prev, ...sizesFromCart }));
  }, [cartItems]);

  if (productsLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-b-transparent border-gradient-to-r from-pink-500 to-red-500 animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const discountedPrice = product.price - (product.discount / 100) * product.price;
  // Calculate MRP if not provided - assume 20% markup from our price
  const mrp = product.mrp || Math.round(discountedPrice * 1.2);
  const cartItem = cartItems.find((i) => i.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const isBelowMOQ = product.moq && quantity < product.moq;

  const handleSizeChange = (value: string) => {
    setSizeInputs((prev) => ({ ...prev, [product.id]: value }));
    const currentCartItem = cartItems.find((item) => item.id === product.id);
    if (currentCartItem) {
      updateSize(product.id, value);
    } else if (value.trim() !== "") {
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

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-8 mt-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image Slider with Magnifier */}
          <div className="flex-1 order-1 relative">
            <div className="embla w-full overflow-hidden relative" ref={emblaRef}>
              <div className="flex">
                {allImages.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-full relative">
                    <ImageMagnifier
                      src={img}
                      zoom={2.5}
                      lensSize={120}
                    />
                  </div>
                ))}
              </div>
              {/* Prev/Next */}
            <button
  onClick={scrollPrev}
  className="absolute top-1/2 left-2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm z-10 transition-all"
>
  <span className="text-xl font-bold">‹</span>
</button>
<button
  onClick={scrollNext}
  className="absolute top-1/2 right-2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm z-10 transition-all"
>
  <span className="text-xl font-bold">›</span>
</button>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-4 order-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-xl font-semibold text-primary">
              Rs {discountedPrice.toFixed(2)}
              <span className="text-sm text-black line-through ml-2">
                Rs {mrp.toFixed(2)}
              </span>
            </p>


            {/* Description & Cart */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <div className="text-gray-700">
                <p>
                  {showFullDesc
                    ? product.description
                    : product.description.length > 200
                    ? product.description.slice(0, 200) + "..."
                    : product.description}
                </p>
                {product.description.length > 200 && (
                  <button
                    onClick={() => setShowFullDesc((prev) => !prev)}
                    className="text-primary underline mt-1 inline-block"
                  >
                    {showFullDesc ? "Read Less" : "Read More"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter the total quantity"
                value={sizeInputs[product.id] || ""}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary text-sm"
              />

        {quantity > 0 ? (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2 w-full">
    {/* Quantity Controls */}
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full overflow-hidden w-full sm:w-auto justify-between px-2 py-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => updateQuantity(product.id, quantity - 1)}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="px-3 text-lg font-semibold">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => updateQuantity(product.id, quantity + 1)}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>

    {/* Buy Now Button */}
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
    className="w-full mt-2"
    size="lg"
    onClick={() =>
      addToCart(
        {
          id: product.id,
          name: product.name,
          price: discountedPrice,
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

            </div>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
};

export default ProductPage;
