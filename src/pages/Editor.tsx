
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EditorState, EditorElement, ToolType, SocialPlatform, PostFormat, CropSettings } from '../types';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import OverlayControls from '../components/OverlayControls';
import TextEditor from '../components/TextEditor';
import ShapeEditor from '../components/ShapeEditor';
import DimensionSelector from '../components/DimensionSelector';
import PreviewDialog from '../components/PreviewDialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';

interface LocationState {
  backgroundImage: string;
}

const Editor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [showPreview, setShowPreview] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>({
    backgroundImage: null,
    overlayOpacity: 0.3,
    elements: [],
    selectedElementId: null,
    isCropping: false,
    canvasDimensions: {
      width: 1080,
      height: 1080,
      platform: 'instagram',
      format: 'feed',
      name: 'Square (1:1)'
    }
  });

  // Load background image from route state
  useEffect(() => {
    const state = location.state as LocationState;
    if (!state || !state.backgroundImage) {
      // For development, let's use a placeholder if no image is provided
      const placeholderImage = 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg';
      setEditorState(prevState => ({
        ...prevState,
        backgroundImage: placeholderImage,
      }));
      
      // Still show a toast for better UX
      toast("Using placeholder image. To start properly, select an image from the home page.");
      return;
    }

    setEditorState(prevState => ({
      ...prevState,
      backgroundImage: state.backgroundImage,
    }));
  }, []);

  // Handle tool selection
  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool !== 'select') {
      setEditorState(prevState => ({
        ...prevState,
        selectedElementId: null,
      }));
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

  // Handle poster dimension change
  const handleDimensionChange = (
    platform: SocialPlatform, 
    format: PostFormat, 
    width: number, 
    height: number,
    name: string
  ) => {
    setEditorState(prevState => ({
      ...prevState,
      canvasDimensions: {
        width,
        height,
        platform,
        format,
        name
      }
    }));
    
    toast(`Canvas dimensions set to ${width}×${height}px for ${platform} ${format}`);
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

  // Crop handling functions
  const handleCropStart = () => {
    setEditorState(prevState => ({
      ...prevState,
      isCropping: true,
    }));
    toast.info("Drag or resize the crop box to select the area you want to include");
  };

  const handleCropApply = (cropSettings: CropSettings) => {
    setEditorState(prevState => ({
      ...prevState,
      cropSettings,
      isCropping: false,
    }));
    setActiveTool('select');
    toast.success("Image cropped successfully");
  };

  const handleCropCancel = () => {
    setEditorState(prevState => ({
      ...prevState,
      isCropping: false,
    }));
    setActiveTool('select');
  };

  // Handle preview modal
  const handleShowPreview = () => {
    setShowPreview(true);
  };

  // Handle poster download
  const handleDownload = async () => {
    let targetElement: HTMLElement | null;
      
    // If we're in preview mode, use the preview element
    if (showPreview) {
      targetElement = document.querySelector('.preview-canvas');
    } else {
      // Show preview before downloading
      setShowPreview(true);
      return;
    }
    
    if (!targetElement) {
      toast.error("Could not find canvas element");
      return;
    }
    
    try {
      toast("Preparing your poster for download...");
      
      // Temporarily hide selection borders and resize handles for screenshot
      const selectedElements = document.querySelectorAll('.preview-element');
      const originalStyles = Array.from(selectedElements).map(el => {
        const element = el as HTMLElement;
        const style = {
          border: element.style.border,
          outline: element.style.outline
        };
        element.style.border = 'none';
        element.style.outline = 'none';
        return style;
      });
      
      // Use html2canvas with improved settings for more accurate rendering
      const canvas = await html2canvas(targetElement as HTMLElement, {
        allowTaint: true,
        useCORS: true,
        scale: 2, // Higher scale for better quality
        logging: false,
        backgroundColor: null,
        // Prevent any scaling or transforms that might cause misalignment
        windowWidth: targetElement.offsetWidth,
        windowHeight: targetElement.offsetHeight,
        // Ensure we capture at the exact position and dimensions
        x: 0,
        y: 0,
        width: targetElement.offsetWidth,
        height: targetElement.offsetHeight
      });
      
      // Restore selection borders and outlines
      selectedElements.forEach((el, i) => {
        const element = el as HTMLElement;
        element.style.border = originalStyles[i].border;
        element.style.outline = originalStyles[i].outline;
      });
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to generate image");
          return;
        }
        
        // Create download link
        const link = document.createElement('a');
        
        // Generate filename based on dimensions
        const dimensions = editorState.canvasDimensions;
        const filename = dimensions
          ? `poster_${dimensions.platform}_${dimensions.format}_${dimensions.width}x${dimensions.height}.png`
          : 'poster.png';
          
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        // Clean up
        URL.revokeObjectURL(link.href);
        toast.success("Poster downloaded successfully!");
        
        // Close preview after download
        setShowPreview(false);
      }, 'image/png', 1.0); // Higher quality PNG
      
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
          onPreview={handleShowPreview}
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
              onCropStart={handleCropStart}
              onCropApply={handleCropApply}
              onCropCancel={handleCropCancel}
            />
          </div>
        </div>
        
        {/* Property Editor */}
        <div className="w-full md:w-80 p-4 border-t md:border-t-0 md:border-l border-muted">
          <h2 className="text-xl font-semibold mb-4">Properties</h2>
          
          {/* Add DimensionSelector component */}
          <DimensionSelector
            onDimensionChange={handleDimensionChange}
            selectedPlatform={editorState.canvasDimensions?.platform}
            selectedFormat={editorState.canvasDimensions?.format}
            selectedDimension={editorState.canvasDimensions ? {
              width: editorState.canvasDimensions.width,
              height: editorState.canvasDimensions.height,
              name: editorState.canvasDimensions.name,
              aspectRatio: `${editorState.canvasDimensions.width}:${editorState.canvasDimensions.height}`
            } : undefined}
          />
          
          {selectedElement ? (
            <div className="mt-6">
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
            </div>
          ) : (
            <div className="text-muted-foreground p-4 bg-muted rounded-lg mt-6">
              {activeTool === 'crop' ? (
                <p>Use the crop tool to select which part of the image you want to include in your poster.</p>
              ) : (
                <>
                  <p>Select an element or use the toolbar to add new elements.</p>
                  <p className="mt-2">Keyboard shortcuts:</p>
                  <ul className="mt-2 list-disc pl-5">
                    <li>Delete/Backspace: Delete selected element</li>
                    <li>Ctrl + [: Move backward</li>
                    <li>Ctrl + ]: Move forward</li>
                    <li>Ctrl + {"{{"}: Send to back</li>
                    <li>Ctrl + {"}}"}: Bring to front</li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Preview Dialog */}
      <PreviewDialog 
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        editorState={editorState}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default Editor;
