import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useState } from "react";
import { motion } from "motion/react";
import { Sliders } from "lucide-react";

export function VideoCustomizationSection() {
  const [activeVideo, setActiveVideo] = useState(0);

  const videos = [
    { id: 1, title: 'Luxury Home', thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxurious-house-with-a-pool-39252-large.mp4' },
    { id: 2, title: 'Modern Interior', thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-living-room-interior-39253-large.mp4' },
    { id: 3, title: 'City Apartment', thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-city-apartment-39254-large.mp4' },
  ];

  return null;
}