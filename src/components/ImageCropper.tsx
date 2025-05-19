import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CropSettings } from '../types';
import { toast } from 'sonner';

interface ImageCropperProps {
  imageSrc: string;
  canvasWidth: number;
  canvasHeight: number;
  initialCrop?: CropSettings;
  onApplyCrop: (cropSettings: CropSettings) => void;
  onCancelCrop: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  canvasWidth,
  canvasHeight,
  initialCrop,
  onApplyCrop,
  onCancelCrop
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState({
    x: initialCrop?.x || 0,
    y: initialCrop?.y || 0,
    width: initialCrop?.width || canvasWidth,
    height: initialCrop?.height || canvasHeight
  });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });

  // When the image loads, initialize the crop box to match the canvas dimensions
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      handleImageLoad();
    }
  }, [imageSrc]);

  const handleImageLoad = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    
    // Get the actual rendered image size (after any CSS scaling)
    const imgRect = img.getBoundingClientRect();
    setImageSize({ width: imgRect.width, height: imgRect.height });

    // Set initial crop box to match canvas dimensions and aspect ratio
    if (!initialCrop) {
      // Calculate the initial crop box size to match the canvas aspect ratio
      const aspectRatio = canvasWidth / canvasHeight;
      let cropWidth, cropHeight;

      if (imgRect.width / imgRect.height > aspectRatio) {
        // Image is wider than canvas aspect ratio
        cropHeight = imgRect.height;
        cropWidth = cropHeight * aspectRatio;
      } else {
        // Image is taller than canvas aspect ratio
        cropWidth = imgRect.width;
        cropHeight = cropWidth / aspectRatio;
      }

      // Center the crop box on the image
      const x = (imgRect.width - cropWidth) / 2;
      const y = (imgRect.height - cropHeight) / 2;
      
      setCropBox({
        x,
        y,
        width: cropWidth,
        height: cropHeight
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignore if clicked on a resize handle
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    if (isDragging) {
      e.preventDefault();
      
      // Calculate the movement delta
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // Update crop box position
      setCropBox(prev => {
        const newX = Math.max(0, Math.min(containerRect.width - prev.width, prev.x + deltaX));
        const newY = Math.max(0, Math.min(containerRect.height - prev.height, prev.y + deltaY));
        
        return {
          ...prev,
          x: newX,
          y: newY
        };
      });
      
      // Update drag start position
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing && resizeDirection) {
      e.preventDefault();
      
      // Calculate the movement delta
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      // Maintain aspect ratio
      const aspectRatio = canvasWidth / canvasHeight;
      
      setCropBox(prev => {
        let newWidth = prev.width;
        let newHeight = prev.height;
        let newX = prev.x;
        let newY = prev.y;
        
        // Handle different resize directions
        switch (resizeDirection) {
          case 'top-left':
            // Calculate new width based on aspect ratio
            if (Math.abs(deltaX) > Math.abs(deltaY * aspectRatio)) {
              newWidth = Math.max(50, prev.width - deltaX);
              newHeight = newWidth / aspectRatio;
            } else {
              newHeight = Math.max(50, prev.height - deltaY);
              newWidth = newHeight * aspectRatio;
            }
            newX = prev.x + (prev.width - newWidth);
            newY = prev.y + (prev.height - newHeight);
            break;
          case 'top-right':
            if (Math.abs(deltaX) > Math.abs(deltaY * aspectRatio)) {
              newWidth = Math.max(50, prev.width + deltaX);
              newHeight = newWidth / aspectRatio;
            } else {
              newHeight = Math.max(50, prev.height - deltaY);
              newWidth = newHeight * aspectRatio;
            }
            newY = prev.y + (prev.height - newHeight);
            break;
          case 'bottom-left':
            if (Math.abs(deltaX) > Math.abs(deltaY * aspectRatio)) {
              newWidth = Math.max(50, prev.width - deltaX);
              newHeight = newWidth / aspectRatio;
            } else {
              newHeight = Math.max(50, prev.height + deltaY);
              newWidth = newHeight * aspectRatio;
            }
            newX = prev.x + (prev.width - newWidth);
            break;
          case 'bottom-right':
            if (Math.abs(deltaX) > Math.abs(deltaY * aspectRatio)) {
              newWidth = Math.max(50, prev.width + deltaX);
              newHeight = newWidth / aspectRatio;
            } else {
              newHeight = Math.max(50, prev.height + deltaY);
              newWidth = newHeight * aspectRatio;
            }
            break;
        }
        
        // Ensure the crop box stays within the image bounds
        if (newX < 0) {
          newX = 0;
          newWidth = prev.width + prev.x;
          newHeight = newWidth / aspectRatio;
        }
        
        if (newY < 0) {
          newY = 0;
          newHeight = prev.height + prev.y;
          newWidth = newHeight * aspectRatio;
        }
        
        if (newX + newWidth > containerRect.width) {
          newWidth = containerRect.width - newX;
          newHeight = newWidth / aspectRatio;
        }
        
        if (newY + newHeight > containerRect.height) {
          newHeight = containerRect.height - newY;
          newWidth = newHeight * aspectRatio;
        }
        
        return {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        };
      });
      
      // Update resize start position
      setResizeStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };
  
  // Convert crop box to actual image crop settings
  const handleApply = () => {
    if (!imageRef.current || !containerRef.current || !cropBoxRef.current) return;
    
    // Map the crop box coordinates to the actual image size
    const img = imageRef.current;
    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Scale the crop coordinates to the original image dimensions
    const scaleX = imgNaturalWidth / containerRect.width;
    const scaleY = imgNaturalHeight / containerRect.height;
    
    const cropSettings: CropSettings = {
      x: cropBox.x * scaleX,
      y: cropBox.y * scaleY,
      width: cropBox.width * scaleX,
      height: cropBox.height * scaleY
    };
    
    onApplyCrop(cropSettings);
    toast.success("Crop applied successfully");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold">Crop Image</h2>
        <p className="text-sm text-muted-foreground">
          Drag or resize the crop box to select which part of the image to include in your poster.
          The crop box maintains the aspect ratio of your selected canvas dimensions.
        </p>
      </div>
      
      <div 
        ref={containerRef} 
        className="relative overflow-hidden bg-black cursor-move"
        style={{ 
          height: '60vh',
          maxHeight: '60vh',
          margin: 'auto'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Crop this image"
          className="object-contain max-w-full max-h-full w-auto h-auto"
          style={{ margin: 'auto', display: 'block' }}
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
        />
        
        <div
          ref={cropBoxRef}
          className="absolute border-2 border-white cursor-move"
          style={{
            left: `${cropBox.x}px`,
            top: `${cropBox.y}px`,
            width: `${cropBox.width}px`,
            height: `${cropBox.height}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Resize handles */}
          <div 
            className="resize-handle top-left" 
            style={{ 
              position: 'absolute', 
              top: '-5px', 
              left: '-5px', 
              width: '10px', 
              height: '10px', 
              background: 'white', 
              cursor: 'nwse-resize'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
          />
          <div 
            className="resize-handle top-right" 
            style={{ 
              position: 'absolute', 
              top: '-5px', 
              right: '-5px', 
              width: '10px', 
              height: '10px', 
              background: 'white', 
              cursor: 'nesw-resize'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'top-right')}
          />
          <div 
            className="resize-handle bottom-left" 
            style={{ 
              position: 'absolute', 
              bottom: '-5px', 
              left: '-5px', 
              width: '10px', 
              height: '10px', 
              background: 'white', 
              cursor: 'nesw-resize'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
          />
          <div 
            className="resize-handle bottom-right" 
            style={{ 
              position: 'absolute', 
              bottom: '-5px', 
              right: '-5px', 
              width: '10px', 
              height: '10px', 
              background: 'white', 
              cursor: 'nwse-resize'
            }}
            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
          />
        </div>
      </div>
      
      <div className="flex justify-center gap-3 mt-4">
        <Button variant="outline" onClick={onCancelCrop}>
          Cancel
        </Button>
        <Button 
          onClick={handleApply}
          className="bg-editor-purple hover:bg-editor-purple-light"
        >
          Apply Crop
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper;
