import React, { useEffect, useRef, useState } from "react";
import { X, Upload } from "lucide-react";
import { useWebflow } from "../context/WebflowContext";
import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Type definitions
interface PreviewImage {
  file: File;
  url: string;
}

export default function Banner() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { webflowData, loading, updateWebflow } = useWebflow();

  const [existingBanners, setExistingBanners] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<PreviewImage[]>([]);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    if (loading || !webflowData) return;

    setExistingBanners(webflowData.banner || []);
    setMinAmount(webflowData.minimumPurchaseAmount ?? 0);
    setDiscount(webflowData.discount ?? 0);
  }, [loading, webflowData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(
      0,
      5 - existingBanners.length - newImages.length
    );
    const withPreview: PreviewImage[] = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...withPreview]);
  };

  const removeExistingImage = (index: number) => {
    const updated = [...existingBanners];
    updated.splice(index, 1);
    setExistingBanners(updated);
  };

  const removeNewImage = (index: number) => {
    const updated = [...newImages];
    URL.revokeObjectURL(updated[index].url);
    updated.splice(index, 1);
    setNewImages(updated);
  };

  const handleClick = () => {
    if (existingBanners.length + newImages.length >= 5) return;
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    try {
      const uploadedUrls: string[] = [];

      for (let img of newImages) {
        const storageRef = ref(
          storage,
          `webflow/banner_${Date.now()}_${img.file.name}`
        );
        await uploadBytes(storageRef, img.file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      const finalBanner = [...existingBanners, ...uploadedUrls];

      await updateWebflow({
        banner: finalBanner,
        minimumPurchaseAmount: Number(minAmount),
        discount: Number(discount),
      });

      alert("✅ Banner and settings updated!");
      setNewImages([]);
    } catch (err) {
      console.error("Failed to update banner:", err);
      alert("❌ Failed to update.");
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="space-y-10">
      {/* Upload Banner */}
      <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Banner Images</CardTitle>
          <CardDescription className="text-gray-400">
            Upload up to 5 banner images to display on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onClick={handleClick}
            className={`flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed transition cursor-pointer ${
              existingBanners.length + newImages.length >= 5
                ? "border-gray-500 text-gray-500"
                : "border-white/20 hover:border-pink-400 text-gray-300"
            }`}
          >
            {existingBanners.length + newImages.length < 5 ? (
              <>
                <Upload className="w-10 h-10 mb-2 text-pink-400" />
                <p className="font-medium">Click to upload banner images</p>
                <p className="text-sm text-gray-500">Accepted: JPG, PNG, WebP</p>
              </>
            ) : (
              <p className="text-gray-400">Maximum 5 banners reached</p>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          {/* Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-8">
            {existingBanners.map((url, index) => (
              <div
                key={`existing-${index}`}
                className="relative group rounded-xl overflow-hidden shadow-md border border-white/10"
              >
                <img
                  src={url}
                  alt={`Banner ${index}`}
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-2 right-2 bg-black/70 rounded-full p-1.5 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            {newImages.map((img, index) => (
              <div
                key={`new-${index}`}
                className="relative group rounded-xl overflow-hidden shadow-md border border-white/10"
              >
                <img
                  src={img.url}
                  alt={`New ${index}`}
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => removeNewImage(index)}
                  className="absolute top-2 right-2 bg-black/70 rounded-full p-1.5 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Sale Settings</CardTitle>
          <CardDescription className="text-gray-400">
            Control minimum purchase amount and discount percentage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-300">Minimum Purchasable Amount ($)</Label>
              <Input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(Number(e.target.value))}
                placeholder="e.g. 100"
                className="mt-1 bg-black/20 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Overall Discount (%)</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="e.g. 10"
                className="mt-1 bg-black/20 border-white/20 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-pink-500 to-pink-400 hover:opacity-90 text-white font-semibold rounded-full px-6 py-3"
            >
              Update Banner & Sale
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
