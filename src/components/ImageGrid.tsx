
import React from 'react';
import { PexelsPhoto } from '../types';

interface ImageGridProps {
  photos: PexelsPhoto[];
  isLoading: boolean;
  onSelectImage: (photo: PexelsPhoto) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ photos, isLoading, onSelectImage }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/2] bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No images found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div 
          key={photo.id} 
          className="group relative aspect-[3/2] overflow-hidden rounded-lg cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-200"
          onClick={() => onSelectImage(photo)}
        >
          <img 
            src={photo.src.medium} 
            alt={photo.alt || photo.photographer} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-end">
            <div className="p-2 w-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm truncate">Photo by {photo.photographer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
