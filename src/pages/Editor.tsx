
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EditorState, EditorElement, ToolType } from '../types';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import OverlayControls from '../components/OverlayControls';
import TextEditor from '../components/TextEditor';
import ShapeEditor from '../components/ShapeEditor';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

interface LocationState {
  backgroundImage: string;
}

const Editor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [editorState, setEditorState] = useState<EditorState>({
    backgroundImage: null,
    overlayOpacity: 0.3,
    elements: [],
    selectedElementId: null,
  });

  // Load background image from route state
  useEffect(() => {
    const state = location.state as LocationState;
    if (!state || !state.backgroundImage) {
      // For development, let's use a placeholder if no image is provided
      const placeholderImage = 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg';
      setEditorState({
        ...editorState,
        backgroundImage: placeholderImage,
      });
      
      // Still show a toast for better UX
      toast("Using placeholder image. To start properly, select an image from the home page.");
      return;
    }

    setEditorState({
      ...editorState,
      backgroundImage: state.backgroundImage,
    });
  }, []);

  // Handle tool selection
  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool !== 'select') {
      setEditorState({
        ...editorState,
        selectedElementId: null,
      });
    }
  };

  // Handle element selection
  const handleElementSelect = (elementId: string | null) => {
    setEditorState((prevState) => ({
      ...prevState,
      selectedElementId: elementId,
    }));
    
    if (elementId) {
      setActiveTool('select');
    }
  };

  // Handle element update
  const handleElementUpdate = (updatedElement: EditorElement) => {
    setEditorState((prevState) => ({
      ...prevState,
      elements: prevState.elements.map((el) => 
        el.id === updatedElement.id ? updatedElement : el
      ),
    }));
  };

  // Handle element addition
  const handleElementAdd = (newElement: EditorElement) => {
    setEditorState((prevState) => ({
      ...prevState,
      elements: [...prevState.elements, newElement],
    }));
  };

  // Handle element removal
  const handleElementRemove = (elementId: string) => {
    setEditorState((prevState) => ({
      ...prevState,
      elements: prevState.elements.filter((el) => el.id !== elementId),
      selectedElementId: null,
    }));
  };

  // Handle overlay opacity change
  const handleOverlayOpacityChange = (opacity: number) => {
    setEditorState((prevState) => ({
      ...prevState,
      overlayOpacity: opacity,
    }));
  };

  // Handle layer ordering
  const handleLayerUpdate = (elementId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    setEditorState((prevState) => {
      const elements = [...prevState.elements];
      const index = elements.findIndex((el) => el.id === elementId);
      if (index === -1) return prevState;
      
      const element = elements[index];
      
      if (direction === 'up' && index < elements.length - 1) {
        // Swap z-index with the element above
        const nextElement = elements[index + 1];
        const tempZIndex = element.zIndex;
        element.zIndex = nextElement.zIndex;
        nextElement.zIndex = tempZIndex;
        elements.sort((a, b) => a.zIndex - b.zIndex);
        
        toast("Moved layer up");
      } else if (direction === 'down' && index > 0) {
        // Swap z-index with the element below
        const prevElement = elements[index - 1];
        const tempZIndex = element.zIndex;
        element.zIndex = prevElement.zIndex;
        prevElement.zIndex = tempZIndex;
        elements.sort((a, b) => a.zIndex - b.zIndex);
        
        toast("Moved layer down");
      } else if (direction === 'top') {
        // Move element to top
        elements.forEach((el, i) => {
          if (i !== index) el.zIndex = el.zIndex - 1;
        });
        element.zIndex = elements.length;
        elements.sort((a, b) => a.zIndex - b.zIndex);
        
        toast("Moved layer to front");
      } else if (direction === 'bottom') {
        // Move element to bottom
        elements.forEach((el, i) => {
          if (i !== index) el.zIndex = el.zIndex + 1;
        });
        element.zIndex = 1;
        elements.sort((a, b) => a.zIndex - b.zIndex);
        
        toast("Moved layer to back");
      }
      
      return {
        ...prevState,
        elements,
      };
    });
  };

  // Handle poster download
  const handleDownload = async () => {
    if (!canvasRef.current) return;
    
    try {
      toast("Preparing your poster for download...");
      
      // Temporarily hide selection borders for screenshot
      const selectedElement = editorState.selectedElementId 
        ? document.querySelector(`[data-id="${editorState.selectedElementId}"]`) 
        : null;
      
      if (selectedElement instanceof HTMLElement) {
        selectedElement.style.border = 'none';
      }
      
      const canvas = await html2canvas(canvasRef.current, {
        allowTaint: true,
        useCORS: true,
        scale: 2,
      });
      
      // Restore selection border
      if (selectedElement instanceof HTMLElement) {
        selectedElement.style.border = '2px dashed #9b87f5';
      }
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to generate image");
          return;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'poster.png';
        link.href = URL.createObjectURL(blob);
        link.click();
        
        // Clean up
        URL.revokeObjectURL(link.href);
        toast.success("Poster downloaded successfully!");
      }, 'image/png');
      
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Failed to download poster. Please try again.");
    }
  };

  // Get selected element for property editor
  const selectedElement = editorState.selectedElementId
    ? editorState.elements.find((el) => el.id === editorState.selectedElementId)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-2 border-b border-muted">
        <Toolbar 
          activeTool={activeTool} 
          onToolChange={handleToolChange}
          onDownload={handleDownload}
        />
      </header>
      
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Canvas Area */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="bg-editor-dark p-4 rounded-lg mb-4">
            <OverlayControls
              overlayOpacity={editorState.overlayOpacity}
              onOpacityChange={handleOverlayOpacityChange}
            />
          </div>
          
          <div 
            ref={canvasRef} 
            className="flex-1 overflow-hidden relative"
            style={{ minHeight: '60vh' }}
          >
            <Canvas
              editorState={editorState}
              activeTool={activeTool}
              onElementSelect={handleElementSelect}
              onElementUpdate={handleElementUpdate}
              onElementAdd={handleElementAdd}
              onElementRemove={handleElementRemove}
              onLayerUpdate={handleLayerUpdate}
            />
          </div>
        </div>
        
        {/* Property Editor */}
        <div className="w-full md:w-80 p-4 border-t md:border-t-0 md:border-l border-muted">
          <h2 className="text-xl font-semibold mb-4">Properties</h2>
          
          {selectedElement ? (
            <>
              {selectedElement.type === 'text' ? (
                <TextEditor 
                  element={selectedElement}
                  onUpdate={handleElementUpdate}
                />
              ) : (
                <ShapeEditor
                  element={selectedElement}
                  onUpdate={handleElementUpdate}
                />
              )}
              
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-medium text-white">Layer Controls</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleLayerUpdate(selectedElement.id, 'top')}
                    variant="outline"
                  >
                    Bring to Front
                  </Button>
                  <Button
                    onClick={() => handleLayerUpdate(selectedElement.id, 'up')}
                    variant="outline"
                  >
                    Move Forward
                  </Button>
                  <Button
                    onClick={() => handleLayerUpdate(selectedElement.id, 'down')}
                    variant="outline"
                  >
                    Move Backward
                  </Button>
                  <Button
                    onClick={() => handleLayerUpdate(selectedElement.id, 'bottom')}
                    variant="outline"
                  >
                    Send to Back
                  </Button>
                </div>
                
                <Button
                  onClick={() => handleElementRemove(selectedElement.id)}
                  variant="destructive"
                  className="w-full mt-4"
                >
                  Delete Element
                </Button>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground p-4 bg-muted rounded-lg">
              <p>Select an element or use the toolbar to add new elements.</p>
              <p className="mt-2">Keyboard shortcuts:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Delete/Backspace: Delete selected element</li>
                <li>Ctrl + [: Move backward</li>
                <li>Ctrl + ]: Move forward</li>
                <li>Ctrl + {"{{"}: Send to back</li>
                <li>Ctrl + {"}}"}: Bring to front</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Editor;
