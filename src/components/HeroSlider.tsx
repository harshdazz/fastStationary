import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebflow } from "@/contexts/WebflowContext";

const HeroSlider = () => {
  const { webflowData, webflowLoading } = useWebflow();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use Firebase banners if available, otherwise use the local banner
  const banners = webflowData?.banner && webflowData.banner.length > 0 
    ? webflowData.banner 
    : ['/banner.png'];
  const isMultiple = banners.length > 1;

  // Auto-slide only if multiple banners
  useEffect(() => {
    if (!isMultiple) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length, isMultiple]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (webflowLoading) return null;

  return (
   <section className="relative h-[70vh] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {banners.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${img})` }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center text-center text-white">
        <div className="max-w-4xl mx-auto px-4 fade-in-up">
        </div>
      </div>

      {/* Arrows and indicators only if multiple */}
      {isMultiple && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 hover-scale"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 hover-scale"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
