import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import FeatureCategories from "@/components/FeatureCategories";
import Footer from "@/components/Footer";
import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWebflow } from "@/contexts/WebflowContext";

const Index = () => {
  const { webflowData, webflowLoading, webflowError } = useWebflow();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {webflowLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : webflowError ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <p className="text-red-500 font-medium">Failed to load data. Please try again.</p>
          <Button onClick={()=>{}} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <HeroSlider />
          <FeatureCategories  />
        </>
      )}

      <Footer />
    </div>
  );
};

export default Index;
