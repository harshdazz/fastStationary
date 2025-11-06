import React, { useRef, useState } from "react";

interface ImageMagnifierProps {
  src: string;
  zoom?: number; // magnification factor
  lensSize?: number; // lens box size in px
}

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  zoom = 2,
  lensSize = 200, // bigger default size
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lensStyle, setLensStyle] = useState<React.CSSProperties | null>(null);
  const [active, setActive] = useState(false);

  const moveLens = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;

    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = clientX - left;
    const y = clientY - top;

    if (x < 0 || y < 0 || x > width || y > height) {
      if (!("touches" in e)) setLensStyle(null);
      return;
    }

    const backgroundX = ((x / width) * 100).toFixed(2) + "%";
    const backgroundY = ((y / height) * 100).toFixed(2) + "%";

    setLensStyle({
      left: x - lensSize / 2,
      top: y - lensSize / 2,
      width: lensSize,
      height: lensSize, // square lens
      backgroundImage: `url(${src})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${width * zoom}px ${height * zoom}px`,
      backgroundPosition: `${backgroundX} ${backgroundY}`,
      borderRadius: 0, // square
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (active) {
      setActive(false);
      setLensStyle(null);
    } else {
      setActive(true);
      moveLens(e);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg border"
      onMouseMove={moveLens}
      onMouseLeave={() => setLensStyle(null)}
      onTouchStart={handleTouchStart}
      onTouchMove={active ? moveLens : undefined}
    >
      {/* Base image */}
      <img src={src} alt="Zoomable" className="w-full h-full object-contain" />

      {/* Magnifier lens */}
      {lensStyle && (
        <div
          className="absolute pointer-events-none border-4 border-gray-400 shadow-lg"
          style={lensStyle}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;
