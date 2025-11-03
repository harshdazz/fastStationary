import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
import { useWebflow } from "@/context/WebflowContext";

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { webflowData } = useWebflow();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    description: "",
    category: "",
    discount: 0,
    stock: 0,
    sku: "",
    mainImage: "",
    addOnImages: [] as string[],
    moq: 0,
    sizeChart: "",
    fabric: "",
    color: "",
    shippingPrice: 0,
  });

  const [newMainImageFile, setNewMainImageFile] = useState<File | null>(null);
  const [newAddOnImageFiles, setNewAddOnImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          setForm(snap.data() as any);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNewMainImageFile(file);
  };

  const handleAddOnImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total =
      form.addOnImages.length + newAddOnImageFiles.length + files.length;
    if (total > 5) {
      alert("Maximum 5 add-on images allowed.");
      return;
    }
    setNewAddOnImageFiles((prev) => [...prev, ...files]);
  };

  const handleAddOnRemove = (index: number) => {
    const newImages = [...form.addOnImages];
    newImages.splice(index, 1);
    setForm((prev) => ({ ...prev, addOnImages: newImages }));
  };

  const handleRemoveNewAddOn = (index: number) => {
    const updated = [...newAddOnImageFiles];
    updated.splice(index, 1);
    setNewAddOnImageFiles(updated);
  };

  const uploadImage = async (file: File, name: string) => {
    const storageRef = ref(storage, `products/${Date.now()}_${name}.jpg`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleUpdate = async () => {
    try {
      const updatedForm = { ...form };

      if (newMainImageFile) {
        const url = await uploadImage(newMainImageFile, "main");
        updatedForm.mainImage = url;
      }

      if (newAddOnImageFiles.length > 0) {
        const urls = await Promise.all(
          newAddOnImageFiles.map((file, i) => uploadImage(file, `addon_${i}`))
        );
        updatedForm.addOnImages = [...updatedForm.addOnImages, ...urls];
      }

      await updateDoc(doc(db, "products", id!), updatedForm);
      alert("Product updated!");
      navigate("/products");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update product");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Button
        onClick={() => navigate(-1)}
        variant="outline"
        className="mb-6"
      >
        ← Back
      </Button>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Name", key: "name" },
              { label: "Price", key: "price", type: "number" },
              { label: "Discount (%)", key: "discount", type: "number" },
              { label: "Stock", key: "stock", type: "number" },
              { label: "SKU", key: "sku" },
              { label: "MOQ", key: "moq", type: "number" },
              { label: "Size Chart", key: "sizeChart" },
              { label: "Fabric", key: "fabric" },
              { label: "Color", key: "color" },
              { label: "Shipping Price", key: "shippingPrice", type: "number" },
            ].map(({ label, key, type = "text" }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type={type}
                  value={form[key as keyof typeof form] as any}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}

            {/* ✅ Category Select */}
            <div>
              <Label>Category</Label>
              <select
                className="w-full border rounded p-2 bg-white"
                value={form.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="">Select Category</option>
                {webflowData?.categories?.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Main Image */}
          <div>
            <Label>Main Image</Label>
            {form.mainImage && !newMainImageFile && (
              <img
                src={form.mainImage}
                alt="Main"
                className="h-24 w-24 object-cover rounded-lg border mt-2"
              />
            )}
            {newMainImageFile && (
              <img
                src={URL.createObjectURL(newMainImageFile)}
                alt="Preview"
                className="h-24 w-24 object-cover rounded-lg border mt-2"
              />
            )}
            <Input type="file" accept="image/*" onChange={handleMainImageSelect} />
          </div>

          {/* Add-On Images */}
          <div>
            <Label>Add-On Images</Label>
            <div className="flex gap-2 flex-wrap mt-2">
              {form.addOnImages.map((url, i) => (
                <div key={`existing-${i}`} className="relative">
                  <img
                    src={url}
                    alt={`AddOn-${i}`}
                    className="h-20 w-20 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => handleAddOnRemove(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {newAddOnImageFiles.map((file, i) => (
                <div key={`new-${i}`} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${i}`}
                    className="h-20 w-20 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => handleRemoveNewAddOn(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {form.addOnImages.length + newAddOnImageFiles.length < 5 && (
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddOnImageSelect}
                className="mt-2"
              />
            )}
          </div>

          <Button onClick={handleUpdate} className="w-full">
            Update Product
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
