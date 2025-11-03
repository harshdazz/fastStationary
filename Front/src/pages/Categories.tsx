import { useState } from "react";
import { Search, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Categories = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const allProducts = [
    // Women's Shorts
    { id: 1, name: "Cotton Comfort Shorts", category: "womens-shorts", price: "₹899", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop", rating: 4.5 },
    { id: 2, name: "Denim Style Shorts", category: "womens-shorts", price: "₹1,299", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop", rating: 4.2 },
    { id: 3, name: "Printed Summer Shorts", category: "womens-shorts", price: "₹699", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop", rating: 4.8 },
    
    // Women's Sleepwear
    { id: 4, name: "Silk Nightgown", category: "womens-sleepwear", price: "₹2,499", image: "https://images.unsplash.com/photo-1564342039177-154b23a2ee6c?w=400&h=400&fit=crop", rating: 4.7 },
    { id: 5, name: "Cotton Pajama Set", category: "womens-sleepwear", price: "₹1,599", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop", rating: 4.4 },
    { id: 6, name: "Satin Robe", category: "womens-sleepwear", price: "₹1,899", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop", rating: 4.6 },

    // Women's Tops
    { id: 7, name: "Embroidered Kurti", category: "womens-tops", price: "₹1,799", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=400&fit=crop", rating: 4.9 },
    { id: 8, name: "Designer Blouse", category: "womens-tops", price: "₹2,299", image: "https://images.unsplash.com/photo-1564342039177-154b23a2ee6c?w=400&h=400&fit=crop", rating: 4.5 },
    { id: 9, name: "Casual Top", category: "womens-tops", price: "₹999", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop", rating: 4.3 },

    // Women's Western Wear
    { id: 10, name: "Fusion Dress", category: "womens-western", price: "₹3,499", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop", rating: 4.8 },
    { id: 11, name: "Indo-Western Gown", category: "womens-western", price: "₹4,999", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=400&fit=crop", rating: 4.7 },
    { id: 12, name: "Modern Jumpsuit", category: "womens-western", price: "₹2,899", image: "https://images.unsplash.com/photo-1564342039177-154b23a2ee6c?w=400&h=400&fit=crop", rating: 4.4 },
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "womens-shorts", label: "Women's Shorts" },
    { value: "womens-sleepwear", label: "Women's Sleepwear" },
    { value: "womens-tops", label: "Women's Tops" },
    { value: "womens-western", label: "Women's Western Wear" },
  ];

  const filteredProducts = allProducts
    .filter(product => 
      (selectedCategory === "all" || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''));
        case "price-high":
          return parseInt(b.price.replace(/[^\d]/g, '')) - parseInt(a.price.replace(/[^\d]/g, ''));
        case "rating":
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Header */}
        <section className="bg-gradient-elegant py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center text-gradient mb-4">
              All Categories
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
              Explore our complete collection of women's clothing with traditional Indian craftsmanship
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} products
              </p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="product-card group cursor-pointer">
                    <div className="relative overflow-hidden rounded-t-xl">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary">{product.price}</span>
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-muted-foreground ml-1">{product.rating}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full hover-scale">
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="product-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {product.category.replace('-', ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary mb-1">{product.price}</div>
                          <div className="flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm text-muted-foreground ml-1">{product.rating}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="hover-scale">
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;