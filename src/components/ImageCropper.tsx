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
  const [imageSize, setImageSize] = useState({ 
    width: 0, 
    height: 0, 
    naturalWidth: 0, 
    naturalHeight: 0,
    displayWidth: 0,
    displayHeight: 0 
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate aspect ratio for the canvas
  const canvasAspectRatio = canvasWidth / canvasHeight;

  // Load the image and set up the initial crop box
  useEffect(() => {
    // Create a new image to get the natural dimensions
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!imageRef.current || !containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Calculate display dimensions to fit within container while maintaining aspect ratio
      let displayWidth, displayHeight;
      const imageAspectRatio = img.naturalWidth / img.naturalHeight;
      
      if (imageAspectRatio > 1) {
        // Landscape image
        displayWidth = Math.min(containerWidth, img.naturalWidth);
        displayHeight = displayWidth / imageAspectRatio;
      } else {
        // Portrait or square image
        displayHeight = Math.min(containerHeight, img.naturalHeight);
        displayWidth = displayHeight * imageAspectRatio;
      }
      
      // Update the image size state
      setImageSize({
        width: displayWidth,
        height: displayHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: displayWidth,
        displayHeight: displayHeight
      });
      
      // Set up the initial crop box
      setupInitialCropBox(displayWidth, displayHeight, img.naturalWidth, img.naturalHeight);
      
      setImageLoaded(true);
    };
    
    img.src = imageSrc;
  }, [imageSrc, canvasWidth, canvasHeight, initialCrop]);

  // Set up the initial crop box based on the image dimensions and canvas aspect ratio
  const setupInitialCropBox = (
    displayWidth: number, 
    displayHeight: number, 
    naturalWidth: number, 
    naturalHeight: number
  ) => {
    if (!imageRef.current || !containerRef.current) return;
    
    let cropWidth, cropHeight;
    
    // If we have initial crop settings, use those
    if (initialCrop) {
      // Convert the crop settings to display coordinates
      const scaleX = displayWidth / naturalWidth;
      const scaleY = displayHeight / naturalHeight;
      
      setCropBox({
        x: initialCrop.x * scaleX,
        y: initialCrop.y * scaleY,
        width: initialCrop.width * scaleX,
        height: initialCrop.height * scaleY
      });
      return;
    }
    
    // Otherwise, calculate crop dimensions based on canvas aspect ratio
    const imageAspectRatio = displayWidth / displayHeight;
    
    if (imageAspectRatio > canvasAspectRatio) {
      // Image is wider than the canvas aspect ratio
      cropHeight = displayHeight;
      cropWidth = cropHeight * canvasAspectRatio;
    } else {
      // Image is taller than the canvas aspect ratio
      cropWidth = displayWidth;
      cropHeight = cropWidth / canvasAspectRatio;
    }
    
    // Center the crop box
    const x = (displayWidth - cropWidth) / 2;
    const y = (displayHeight - cropHeight) / 2;
    
    setCropBox({
      x,
      y,
      width: cropWidth,
      height: cropHeight
    });
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
    if (!containerRef.current || !imageLoaded) return;
    
    if (isDragging) {
      e.preventDefault();
      
      // Calculate the movement delta
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // Update crop box position
      setCropBox(prev => {
        // Calculate new position
        let newX = prev.x + deltaX;
        let newY = prev.y + deltaY;
        
        // Constrain to image boundaries
        newX = Math.max(0, Math.min(imageSize.width - prev.width, newX));
        newY = Math.max(0, Math.min(imageSize.height - prev.height, newY));
        
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
      
      // Update the crop box while maintaining aspect ratio
      setCropBox(prev => {
        let newWidth = prev.width;
        let newHeight = prev.height;
        let newX = prev.x;
        let newY = prev.y;
        
        // Calculate new dimensions based on the resize direction
        switch (resizeDirection) {
          case 'top-left':
            // Use the primary drag direction to determine sizing
            if (Math.abs(deltaX) > Math.abs(deltaY * canvasAspectRatio)) {
              newWidth = Math.max(50, prev.width - deltaX);
              newHeight = newWidth / canvasAspectRatio;
            } else {
              newHeight = Math.max(50, prev.height - deltaY);
              newWidth = newHeight * canvasAspectRatio;
            }
            newX = prev.x + (prev.width - newWidth);
            newY = prev.y + (prev.height - newHeight);
            break;
          case 'top-right':
            if (Math.abs(deltaX) > Math.abs(deltaY * canvasAspectRatio)) {
              newWidth = Math.max(50, prev.width + deltaX);
              newHeight = newWidth / canvasAspectRatio;
            } else {
              newHeight = Math.max(50, prev.height - deltaY);
              newWidth = newHeight * canvasAspectRatio;
            }
            newY = prev.y + (prev.height - newHeight);
            break;
          case 'bottom-left':
            if (Math.abs(deltaX) > Math.abs(deltaY * canvasAspectRatio)) {
              newWidth = Math.max(50, prev.width - deltaX);
              newHeight = newWidth / canvasAspectRatio;
            } else {
              newHeight = Math.max(50, prev.height + deltaY);
              newWidth = newHeight * canvasAspectRatio;
            }
            newX = prev.x + (prev.width - newWidth);
            break;
          case 'bottom-right':
            if (Math.abs(deltaX) > Math.abs(deltaY * canvasAspectRatio)) {
              newWidth = Math.max(50, prev.width + deltaX);
              newHeight = newWidth / canvasAspectRatio;
            } else {
              newHeight = Math.max(50, prev.height + deltaY);
              newWidth = newHeight * canvasAspectRatio;
            }
            break;
        }
        
        // Enforce boundaries
        if (newX < 0) {
          const diff = -newX;
          newX = 0;
          newWidth -= diff;
          newHeight = newWidth / canvasAspectRatio;
        }
        
        if (newY < 0) {
          const diff = -newY;
          newY = 0;
          newHeight -= diff;
          newWidth = newHeight * canvasAspectRatio;
        }
        
        if (newX + newWidth > imageSize.width) {
          newWidth = imageSize.width - newX;
          newHeight = newWidth / canvasAspectRatio;
        }
        
        if (newY + newHeight > imageSize.height) {
          newHeight = imageSize.height - newY;
          newWidth = newHeight * canvasAspectRatio;
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
    if (!imageLoaded) return;
    
    // Map the crop box coordinates to the actual image size
    // Scale the crop coordinates to the original image dimensions
    const scaleX = imageSize.naturalWidth / imageSize.width;
    const scaleY = imageSize.naturalHeight / imageSize.height;
    
    const cropSettings: CropSettings = {
      x: cropBox.x * scaleX,
      y: cropBox.y * scaleY,
      width: cropBox.width * scaleX,
      height: cropBox.height * scaleY
    };
    
    // Log for debugging
    console.log('Applying crop settings:', cropSettings);
    console.log('Image natural dimensions:', imageSize.naturalWidth, imageSize.naturalHeight);
    console.log('Image display dimensions:', imageSize.width, imageSize.height);
    console.log('Canvas dimensions:', canvasWidth, canvasHeight);
    
    onApplyCrop(cropSettings);
    toast.success("Crop applied successfully");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold">Crop Image</h2>
        <p className="text-sm text-muted-foreground">
          Drag or resize the crop box to select which part of the image to include in your poster.
          The crop box maintains the aspect ratio of your selected canvas dimensions ({canvasWidth} × {canvasHeight}).
        </p>
      </div>
      
      <div 
        ref={containerRef} 
        className="relative overflow-hidden bg-black cursor-move flex items-center justify-center"
        style={{ 
          height: '60vh',
          maxHeight: '60vh',
          margin: 'auto'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {imageLoaded ? (
          <>
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop this image"
              className="max-w-full max-h-full"
              style={{
                width: imageSize.width,
                height: imageSize.height
              }}
              crossOrigin="anonymous"
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
              
              {/* Aspect ratio label */}
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: '10px', 
                  right: '10px', 
                  background: 'rgba(0,0,0,0.7)', 
                  color: 'white',
                  padding: '2px 5px',
                  fontSize: '12px',
                  borderRadius: '2px'
                }}
              >
                {canvasWidth} × {canvasHeight}
              </div>
            </div>
          </>
        ) : (
          <div className="text-white">Loading image...</div>
        )}
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
