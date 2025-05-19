
import React, { useState, useRef, useEffect } from 'react';
import { EditorElement, EditorState, ToolType, CropSettings } from '../types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import ImageCropper from './ImageCropper';

interface CanvasProps {
  editorState: EditorState;
  activeTool: ToolType;
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (updatedElement: EditorElement) => void;
  onElementAdd: (element: EditorElement) => void;
  onElementRemove: (elementId: string) => void;
  onLayerUpdate: (elementId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onCropStart: () => void;
  onCropApply: (cropSettings: CropSettings) => void;
  onCropCancel: () => void;
}

interface Position {
  x: number;
  y: number;
}

type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

const Canvas: React.FC<CanvasProps> = ({
  editorState,
  activeTool,
  onElementSelect,
  onElementUpdate,
  onElementAdd,
  onElementRemove,
  onLayerUpdate,
  onCropStart,
  onCropApply,
  onCropCancel
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  
  // Show crop interface if crop tool is active
  useEffect(() => {
    if (activeTool === 'crop' && !editorState.isCropping) {
      onCropStart();
    }
  }, [activeTool, editorState.isCropping, onCropStart]);
  
  // Effect to handle selecting element from editorState
  useEffect(() => {
    setSelectedElement(
      editorState.selectedElementId
        ? editorState.elements.find((el) => el.id === editorState.selectedElementId) || null
        : null
    );
  }, [editorState.selectedElementId, editorState.elements]);
  
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorState.selectedElementId) return;
      
      // Delete element
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onElementRemove(editorState.selectedElementId);
        toast("Element deleted");
        return;
      }
      
      // Layer controls
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '[':
            onLayerUpdate(editorState.selectedElementId, 'down');
            break;
          case ']':
            onLayerUpdate(editorState.selectedElementId, 'up');
            break;
          case '{':
            onLayerUpdate(editorState.selectedElementId, 'bottom');
            break;
          case '}':
            onLayerUpdate(editorState.selectedElementId, 'top');
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editorState.selectedElementId, onElementRemove, onLayerUpdate]);
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Ignore clicks on elements (they will be handled by element click)
    if ((e.target as HTMLElement).classList.contains('editor-element') || 
        (e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }
    
    // Deselect when clicking on canvas
    if (activeTool === 'select') {
      onElementSelect(null);
      return;
    }
    
    // Add new element when using element tools
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasBounds.left;
    const y = e.clientY - canvasBounds.top;
    
    // Create a new element based on the active tool
    if (activeTool === 'text') {
      const newElement: EditorElement = {
        id: uuidv4(),
        type: 'text',
        x,
        y,
        width: 200,
        height: 50,
        content: 'Add your text here',
        fontSize: 24,
        color: '#FFFFFF',
        fontFamily: 'Roboto',
        zIndex: editorState.elements.length + 1,
      };
      onElementAdd(newElement);
      onElementSelect(newElement.id);
      toast("Text element added");
    } else if (activeTool === 'rectangle') {
      const newElement: EditorElement = {
        id: uuidv4(),
        type: 'rectangle',
        x,
        y,
        width: 100,
        height: 100,
        color: '#FFFFFF',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        zIndex: editorState.elements.length + 1,
      };
      onElementAdd(newElement);
      onElementSelect(newElement.id);
      toast("Rectangle element added");
    } else if (activeTool === 'circle') {
      const newElement: EditorElement = {
        id: uuidv4(),
        type: 'circle',
        x,
        y,
        width: 100,
        height: 100,
        color: '#FFFFFF',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        zIndex: editorState.elements.length + 1,
      };
      onElementAdd(newElement);
      onElementSelect(newElement.id);
      toast("Circle element added");
    }
  };
  
  const handleElementMouseDown = (e: React.MouseEvent, element: EditorElement) => {
    e.stopPropagation();
    
    if (activeTool !== 'select') return;
    
    onElementSelect(element.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle, element: EditorElement) => {
    e.stopPropagation();
    
    onElementSelect(element.id);
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const canvasBounds = canvasRef.current.getBoundingClientRect();

    // Handle dragging
    if (isDragging && !isResizing && dragStart && selectedElement) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Update element position
      onElementUpdate({
        ...selectedElement,
        x: Math.max(0, Math.min(canvasBounds.width - selectedElement.width, newX)),
        y: Math.max(0, Math.min(canvasBounds.height - selectedElement.height, newY)),
      });
      return;
    }
    
    // Handle resizing
    if (isResizing && dragStart && selectedElement && resizeHandle) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      let newWidth = selectedElement.width;
      let newHeight = selectedElement.height;
      let newX = selectedElement.x;
      let newY = selectedElement.y;
      
      // Adjust dimensions and position based on which handle is being dragged
      switch(resizeHandle) {
        case 'top-left':
          newWidth = Math.max(20, selectedElement.width - deltaX);
          newHeight = Math.max(20, selectedElement.height - deltaY);
          newX = selectedElement.x + (selectedElement.width - newWidth);
          newY = selectedElement.y + (selectedElement.height - newHeight);
          break;
        case 'top-right':
          newWidth = Math.max(20, selectedElement.width + deltaX);
          newHeight = Math.max(20, selectedElement.height - deltaY);
          newY = selectedElement.y + (selectedElement.height - newHeight);
          break;
        case 'bottom-left':
          newWidth = Math.max(20, selectedElement.width - deltaX);
          newHeight = Math.max(20, selectedElement.height + deltaY);
          newX = selectedElement.x + (selectedElement.width - newWidth);
          break;
        case 'bottom-right':
          newWidth = Math.max(20, selectedElement.width + deltaX);
          newHeight = Math.max(20, selectedElement.height + deltaY);
          break;
      }
      
      // Update element with new dimensions and position
      onElementUpdate({
        ...selectedElement,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
      
      // Update drag start for continuous resizing
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setDragStart(null);
  };
  
  const renderElement = (element: EditorElement) => {
    const isSelected = editorState.selectedElementId === element.id;
    
    // Create a common base style that will be consistent for both preview and download
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      zIndex: element.zIndex,
      cursor: isSelected ? 'move' : 'pointer',
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    };
    
    // Add resize handles for selected elements
    const renderResizeHandles = () => {
      if (!isSelected) return null;
      
      const handleStyle: React.CSSProperties = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        backgroundColor: '#9b87f5',
        border: '1px solid white',
        zIndex: element.zIndex + 1,
      };
      
      return (
        <>
          <div
            className="resize-handle top-left"
            style={{ ...handleStyle, top: '-5px', left: '-5px', cursor: 'nwse-resize' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-left', element)}
          />
          <div
            className="resize-handle top-right"
            style={{ ...handleStyle, top: '-5px', right: '-5px', cursor: 'nesw-resize' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-right', element)}
          />
          <div
            className="resize-handle bottom-left"
            style={{ ...handleStyle, bottom: '-5px', left: '-5px', cursor: 'nesw-resize' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left', element)}
          />
          <div
            className="resize-handle bottom-right"
            style={{ ...handleStyle, bottom: '-5px', right: '-5px', cursor: 'nwse-resize' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right', element)}
          />
        </>
      );
    };
    
    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            className="editor-element editor-text"
            data-id={element.id}
            style={{
              ...style,
              color: element.color,
              fontSize: `${element.fontSize}px`,
              fontFamily: element.fontFamily,
              backgroundColor: 'transparent',
              border: isSelected ? '1px dashed #9b87f5' : 'none',
              outline: isSelected ? '1px dashed #9b87f5' : 'none',
              outlineOffset: '1px',
              whiteSpace: 'nowrap', // Prevent text wrapping
              overflow: 'hidden',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center', // Better vertical alignment
              justifyContent: 'flex-start', // Align text to the start by default
              padding: '0 2px', // Add slight padding to prevent text touching the border
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          >
            {element.content}
            {renderResizeHandles()}
          </div>
        );
      case 'rectangle':
        return (
          <div
            key={element.id}
            className="editor-element"
            data-id={element.id}
            style={{
              ...style,
              border: `2px solid ${element.color}`,
              backgroundColor: element.backgroundColor || 'transparent',
              boxSizing: 'border-box',
              outline: isSelected ? '1px dashed #9b87f5' : 'none',
              outlineOffset: '1px',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          >
            {renderResizeHandles()}
          </div>
        );
      case 'circle':
        return (
          <div
            key={element.id}
            className="editor-element"
            data-id={element.id}
            style={{
              ...style,
              borderRadius: '50%',
              border: `2px solid ${element.color}`,
              backgroundColor: element.backgroundColor || 'transparent',
              boxSizing: 'border-box',
              outline: isSelected ? '1px dashed #9b87f5' : 'none',
              outlineOffset: '1px',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          >
            {renderResizeHandles()}
          </div>
        );
      default:
        return null;
    }
  };

  // Calculate canvas dimensions based on selected dimensions or default to fill container
  const canvasStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };

  // If we have specific dimensions set, apply them
  if (editorState.canvasDimensions) {
    const { width, height } = editorState.canvasDimensions;
    const containerWidth = canvasRef.current?.parentElement?.clientWidth || 0;
    const containerHeight = canvasRef.current?.parentElement?.clientHeight || 0;
    
    // Calculate the scale to fit the canvas inside the container
    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down if needed
    
    canvasStyle.width = `${width}px`;
    canvasStyle.height = `${height}px`;
    canvasStyle.transform = `scale(${scale})`;
    canvasStyle.transformOrigin = 'top left';
    canvasStyle.margin = 'auto';
  }
  
  // Calculate background image style with crop
  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  // If we have crop settings, apply them to the background image
  if (editorState.cropSettings && editorState.backgroundImage) {
    const { x, y, width, height } = editorState.cropSettings;
    backgroundStyle.objectFit = 'none';
    backgroundStyle.objectPosition = `${-x}px ${-y}px`;
    backgroundStyle.width = `${width}px`;
    backgroundStyle.height = `${height}px`;
    backgroundStyle.transform = 'scale(1)';
    backgroundStyle.maxWidth = 'none';
    backgroundStyle.maxHeight = 'none';
  }
  
  // Show the crop interface if in cropping mode
  if (editorState.isCropping && editorState.backgroundImage) {
    return (
      <ImageCropper
        imageSrc={editorState.backgroundImage}
        canvasWidth={editorState.canvasDimensions?.width || 1080}
        canvasHeight={editorState.canvasDimensions?.height || 1080}
        initialCrop={editorState.cropSettings}
        onApplyCrop={onCropApply}
        onCancelCrop={onCancelCrop}
      />
    );
  }
  
  return (
    <div className="editor-canvas-container relative w-full h-full flex items-center justify-center bg-gray-800 overflow-auto">
      <div
        ref={canvasRef}
        className="editor-canvas"
        style={canvasStyle}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background Image */}
        {editorState.backgroundImage && (
          <img
            src={editorState.backgroundImage}
            alt="Background"
            className="absolute inset-0"
            crossOrigin="anonymous"
            style={backgroundStyle}
          />
        )}
        
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'black',
            opacity: editorState.overlayOpacity,
            pointerEvents: 'none', // Allow clicking through the overlay
          }}
        />
        
        {/* Editor Elements */}
        {editorState.elements.map((element) => renderElement(element))}
      </div>
      
      {/* Display canvas dimensions if set */}
      {editorState.canvasDimensions && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {editorState.canvasDimensions.width} × {editorState.canvasDimensions.height}px
          <span className="ml-2">
            {editorState.canvasDimensions.platform} ({editorState.canvasDimensions.format})
          </span>
        </div>
      )}
    </div>
  );
};

export default Canvas;
