import { useState, useRef, useEffect } from "react";
import { MapPin, Plus, Minus } from "lucide-react";

interface InteractiveMapProps {
  markerPosition: [number, number];
  onPositionChange: (position: [number, number]) => void;
}

export function InteractiveMap({ markerPosition, onPositionChange }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(2);
  
  // Convert lat/lng to pixel coordinates (Mercator projection)
  const latLngToPixel = (lat: number, lng: number, containerWidth: number, containerHeight: number) => {
    // Normalize longitude (-180 to 180) to (0 to 1)
    const x = (lng + 180) / 360;
    
    // Convert latitude using Mercator projection
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = 0.5 - mercN / (2 * Math.PI);
    
    return {
      x: x * containerWidth,
      y: y * containerHeight
    };
  };
  
  // Convert pixel coordinates to lat/lng
  const pixelToLatLng = (x: number, y: number, containerWidth: number, containerHeight: number): [number, number] => {
    // Normalize pixel coordinates to (0 to 1)
    const xNorm = x / containerWidth;
    const yNorm = y / containerHeight;
    
    // Convert to longitude
    const lng = xNorm * 360 - 180;
    
    // Convert from Mercator projection to latitude
    const mercN = (0.5 - yNorm) * (2 * Math.PI);
    const lat = (2 * Math.atan(Math.exp(mercN)) - Math.PI / 2) * (180 / Math.PI);
    
    return [lat, lng];
  };
  
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPosition = pixelToLatLng(x, y, rect.width, rect.height);
    onPositionChange(newPosition);
  };
  
  const handleMarkerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Clamp coordinates within bounds
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const clampedY = Math.max(0, Math.min(y, rect.height));
    
    const newPosition = pixelToLatLng(clampedX, clampedY, rect.width, rect.height);
    onPositionChange(newPosition);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 4));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
  };
  
  // Calculate marker position
  const [markerPos, setMarkerPos] = useState({ x: 50, y: 50 });
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const pos = latLngToPixel(markerPosition[0], markerPosition[1], rect.width, rect.height);
    
    setMarkerPos({
      x: (pos.x / rect.width) * 100,
      y: (pos.y / rect.height) * 100
    });
  }, [markerPosition]);
  
  return (
    <div className="relative w-full h-[400px] rounded-md overflow-hidden bg-[#1a1410] border border-white/10">
      {/* Map Image with Overlay */}
      <div
        ref={containerRef}
        className="relative w-full h-full cursor-crosshair"
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Static Map Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-200"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1550406307-84b491d68ba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMGRhcmt8ZW58MXx8fHwxNzY1MjczMDYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
            transform: `scale(${zoom})`,
            filter: 'brightness(0.7) contrast(1.1)'
          }}
        />
        
        {/* Dark Overlay for Better Contrast */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Interactive Marker */}
        <div
          className="absolute z-10 cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
          style={{
            left: `${markerPos.x}%`,
            top: `${markerPos.y}%`,
            transform: 'translate(-50%, -100%)'
          }}
          onMouseDown={handleMarkerMouseDown}
        >
          {/* Marker Shadow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/40 rounded-full blur-sm" />
          
          {/* Marker Pin */}
          <div className="relative">
            <MapPin className="w-10 h-10 text-red-500 drop-shadow-lg" fill="#ef4444" strokeWidth={2} stroke="white" />
            
            {/* Pulse Animation */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500/30 rounded-full animate-ping" />
          </div>
        </div>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-md overflow-hidden shadow-lg">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all border-b border-white/10 group"
          title="Zoom In"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all group"
          title="Zoom Out"
        >
          <Minus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
      
      {/* Coordinates Display */}
      <div className="absolute bottom-4 left-4 px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-md shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <p className="text-xs text-white/80 font-mono">
            {markerPosition[0].toFixed(4)}°, {markerPosition[1].toFixed(4)}°
          </p>
        </div>
      </div>
      
      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 backdrop-blur-md bg-white/10 border border-white/20 rounded-md shadow-lg">
        <p className="text-xs text-white/60">
          Zoom: {zoom.toFixed(1)}x
        </p>
      </div>
      
      {/* Instructions Tooltip */}
      <div className="absolute top-4 left-4 px-4 py-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-md shadow-lg">
        <p className="text-xs text-white/60">
          Click to place marker • Drag marker to move
        </p>
      </div>
    </div>
  );
}
