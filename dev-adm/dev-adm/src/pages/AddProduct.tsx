import React, { useState } from "react";
import { PackagePlus } from "lucide-react";
import { useWebflow } from "../context/WebflowContext";
import { db, storage } from "../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useProducts } from "../context/ProductContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function ProductManagement() {
  const { webflowData } = useWebflow();
  const { addProduct } = useProducts();
    const navigate = useNavigate();
  
  const [addOnImages, setAddOnImages] = useState<File[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = webflowData?.categories || [];

  const handleAddOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setAddOnImages(files);
  };

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setMainImage(file || null);
  };

  const handleAddProduct = async () => {
    const name = (
      document.querySelector('input[placeholder="Product Name"]') as HTMLInputElement
    )?.value;
    const sku = (
      document.querySelector('input[placeholder="SKU Number"]') as HTMLInputElement
    )?.value;
    const stock = Number(
      (document.querySelector('input[placeholder="Stock Quantity"]') as HTMLInputElement)?.value
    );
    const price = Number(
      (document.querySelector('input[placeholder="Price"]') as HTMLInputElement)?.value
    );
    const discount = Number(
      (document.querySelector('input[placeholder="Discount"]') as HTMLInputElement)?.value
    );
    const description = (
      document.querySelector('textarea[placeholder="Product description"]') as HTMLTextAreaElement
    )?.value;

    // new fields
    const moq = Number(
      (document.querySelector('input[placeholder="MOQ"]') as HTMLInputElement)?.value
    );
    const sizeChart = (
      document.querySelector('input[placeholder="Sizes (e.g. M, L, XL)"]') as HTMLInputElement
    )?.value;
    const fabric = (
      document.querySelector('input[placeholder="Fabric"]') as HTMLInputElement
    )?.value;
    const color = (
      document.querySelector('input[placeholder="Color"]') as HTMLInputElement
    )?.value;
    const shippingPrice = Number(
      (document.querySelector('input[placeholder="Shipping Price"]') as HTMLInputElement)?.value
    );

    if (!name || !price || !stock || !category || !mainImage) {
      alert("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload main image
      const mainRef = ref(storage, `products/${Date.now()}_main.jpg`);
      await uploadBytes(mainRef, mainImage);
      const mainUrl = await getDownloadURL(mainRef);

      // Upload add-ons
      const addOnUrls = await Promise.all(
        addOnImages.map(async (img, idx) => {
          const imgRef = ref(storage, `products/${Date.now()}_addon_${idx}.jpg`);
          await uploadBytes(imgRef, img);
          return await getDownloadURL(imgRef);
        })
      );

      const productData = {
        name,
        sku,
        stock,
        price,
        discount,
        description,
        category,
        moq,
        sizeChart,
        fabric,
        color,
        shippingPrice,
        mainImage: mainUrl,
        addOnImages: addOnUrls,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "products"), productData);
      addProduct({ id: docRef.id, ...productData });
      alert("Product added successfully!");
      navigate("/products");

    } catch (err) {
      console.error("Product Upload Error:", err);
      alert("Failed to add product.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Add a New Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Product Name</Label>
              <Input placeholder="Product Name" />
            </div>
            <div>
              <Label>SKU Number</Label>
              <Input placeholder="SKU Number" />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" placeholder="Stock Quantity" />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" placeholder="Price" />
            </div>
            <div>
              <Label>Discount (%)</Label>
              <Input type="number" placeholder="Discount" />
            </div>
            <div>
              <Label>Shipping Price</Label>
              <Input type="number" placeholder="Shipping Price" />
            </div>
          </div>

          {/* New Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>MOQ</Label>
              <Input type="number" placeholder="MOQ" />
            </div>
            <div>
              <Label>Size Chart</Label>
              <Input placeholder="Sizes (e.g. M, L, XL)" />
            </div>
            <div>
              <Label>Fabric</Label>
              <Input placeholder="Fabric" />
            </div>
            <div>
              <Label>Color</Label>
              <Input placeholder="Color" />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea placeholder="Product description" />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat: any, idx: number) => (
                  <SelectItem key={idx} value={cat.name}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Images */}
          <div>
            <Label>Main Image</Label>
            <Input type="file" accept="image/*" onChange={handleMainChange} />
            {mainImage && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(mainImage)}
                  alt="Main Preview"
                  className="h-20 w-20 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div>
            <Label>Add-On Images (up to 5)</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddOnChange}
            />
            {addOnImages.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {addOnImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(img)}
                    alt={`AddOn-${idx}`}
                    className="h-16 w-16 object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleAddProduct}
            disabled={isSubmitting}
          >
            <PackagePlus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Adding..." : "Add Product"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
