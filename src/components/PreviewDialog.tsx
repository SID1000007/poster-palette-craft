
import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { EditorState } from '../types';

interface PreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editorState: EditorState;
  onDownload: () => void;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({ isOpen, onClose, editorState, onDownload }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  if (!editorState.backgroundImage) return null;

  // Create a modified background style that properly applies the crop
  let backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  // If we have crop settings, apply them correctly
  if (editorState.cropSettings) {
    const { x, y, width, height } = editorState.cropSettings;
    
    // If we have canvas dimensions, calculate correct scaling
    if (editorState.canvasDimensions) {
      const canvasWidth = editorState.canvasDimensions.width;
      const canvasHeight = editorState.canvasDimensions.height;
      
      // Calculate the scale factor to fit the cropped region into the canvas
      const scaleX = canvasWidth / width;
      const scaleY = canvasHeight / height;
      
      backgroundStyle = {
        position: 'absolute',
        inset: 0,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        objectFit: 'none',
        objectPosition: `${-x * scaleX}px ${-y * scaleY}px`,
        transform: `scale(${1 / scaleX}, ${1 / scaleY})`,
        transformOrigin: '0 0',
      };
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Poster Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center my-4 bg-gray-800 p-4 rounded-md overflow-hidden">
          <div ref={previewRef} className="preview-canvas relative overflow-hidden" 
              style={{ 
                width: editorState.canvasDimensions?.width, 
                height: editorState.canvasDimensions?.height,
                maxWidth: '100%',
                maxHeight: '70vh'
              }}>
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
                pointerEvents: 'none',
              }}
            />
            
            {/* Editor Elements */}
            {editorState.elements.map((element) => {
              const style: React.CSSProperties = {
                position: 'absolute',
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                zIndex: element.zIndex,
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
              };
              
              switch (element.type) {
                case 'text':
                  return (
                    <div
                      key={element.id}
                      className="preview-element preview-text"
                      style={{
                        ...style,
                        color: element.color,
                        fontSize: `${element.fontSize}px`,
                        fontFamily: element.fontFamily,
                        backgroundColor: 'transparent',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        userSelect: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        padding: '0 2px',
                      }}
                    >
                      {element.content}
                    </div>
                  );
                case 'rectangle':
                  return (
                    <div
                      key={element.id}
                      className="preview-element"
                      style={{
                        ...style,
                        border: `2px solid ${element.color}`,
                        backgroundColor: element.backgroundColor || 'transparent',
                        boxSizing: 'border-box',
                      }}
                    />
                  );
                case 'circle':
                  return (
                    <div
                      key={element.id}
                      className="preview-element"
                      style={{
                        ...style,
                        borderRadius: '50%',
                        border: `2px solid ${element.color}`,
                        backgroundColor: element.backgroundColor || 'transparent',
                        boxSizing: 'border-box',
                      }}
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>

        <div className="text-sm text-center mb-2 text-muted-foreground">
          This is how your poster will look when downloaded. The preview matches the exact dimensions.
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Back to Editing
          </Button>
          <Button
            onClick={onDownload}
            className="bg-editor-purple hover:bg-editor-purple-light"
          >
            <Download size={16} className="mr-1" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
