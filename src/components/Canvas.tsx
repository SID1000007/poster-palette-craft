
import React, { useState, useRef, useEffect } from 'react';
import { EditorElement, EditorState, ToolType } from '../types';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface CanvasProps {
  editorState: EditorState;
  activeTool: ToolType;
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (updatedElement: EditorElement) => void;
  onElementAdd: (element: EditorElement) => void;
  onElementRemove: (elementId: string) => void;
  onLayerUpdate: (elementId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
}

interface Position {
  x: number;
  y: number;
}

const Canvas: React.FC<CanvasProps> = ({
  editorState,
  activeTool,
  onElementSelect,
  onElementUpdate,
  onElementAdd,
  onElementRemove,
  onLayerUpdate
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  
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
  }, [editorState.selectedElementId]);
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Ignore clicks on elements (they will be handled by element click)
    if ((e.target as HTMLElement).classList.contains('editor-element')) {
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
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !selectedElement || !canvasRef.current) return;
    
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - dragStart.x - canvasBounds.left;
    const newY = e.clientY - dragStart.y - canvasBounds.top;
    
    // Update element position
    onElementUpdate({
      ...selectedElement,
      x: Math.max(0, Math.min(canvasBounds.width - selectedElement.width, newX)),
      y: Math.max(0, Math.min(canvasBounds.height - selectedElement.height, newY)),
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };
  
  const renderElement = (element: EditorElement) => {
    const style: React.CSSProperties = {
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      zIndex: element.zIndex,
      border: editorState.selectedElementId === element.id ? '2px dashed #9b87f5' : 'none',
    };
    
    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            className="editor-element editor-text"
            style={{
              ...style,
              color: element.color,
              fontSize: `${element.fontSize}px`,
              fontFamily: element.fontFamily,
              backgroundColor: 'transparent',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          >
            {element.content}
          </div>
        );
      case 'rectangle':
        return (
          <div
            key={element.id}
            className="editor-element"
            style={{
              ...style,
              border: `2px solid ${element.color}`,
              backgroundColor: element.backgroundColor || 'transparent',
              boxSizing: 'border-box',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          />
        );
      case 'circle':
        return (
          <div
            key={element.id}
            className="editor-element"
            style={{
              ...style,
              borderRadius: '50%',
              border: `2px solid ${element.color}`,
              backgroundColor: element.backgroundColor || 'transparent',
              boxSizing: 'border-box',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div
      ref={canvasRef}
      className="editor-canvas"
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
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'black',
          opacity: editorState.overlayOpacity,
        }}
      />
      
      {/* Editor Elements */}
      {editorState.elements.map((element) => renderElement(element))}
    </div>
  );
};

export default Canvas;
