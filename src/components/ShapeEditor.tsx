
import React, { useState, useEffect } from 'react';
import { EditorElement } from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShapeEditorProps {
  element: EditorElement;
  onUpdate: (updatedElement: EditorElement) => void;
}

const ShapeEditor: React.FC<ShapeEditorProps> = ({ element, onUpdate }) => {
  const [color, setColor] = useState(element.color || '#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState(element.backgroundColor || '');
  const [width, setWidth] = useState(element.width);
  const [height, setHeight] = useState(element.height);
  
  useEffect(() => {
    onUpdate({
      ...element,
      color,
      backgroundColor,
      width,
      height
    });
  }, [color, backgroundColor, width, height]);

  return (
    <div className="space-y-4 p-4 bg-editor-dark rounded-lg">
      <h3 className="text-lg font-medium text-white">
        {element.type === 'rectangle' ? 'Rectangle' : 'Circle'} Properties
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shape-width" className="text-white">Width</Label>
          <Input
            id="shape-width"
            type="number"
            min={10}
            max={500}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="shape-height" className="text-white">Height</Label>
          <Input
            id="shape-height"
            type="number"
            min={10}
            max={500}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="border-color" className="text-white">Border Color</Label>
        <div className="flex gap-2">
          <div
            className="w-10 h-10 rounded border overflow-hidden"
            style={{ background: color }}
          >
            <Input
              id="border-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <Input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fill-color" className="text-white">Fill Color</Label>
        <div className="flex gap-2">
          <div
            className="w-10 h-10 rounded border overflow-hidden"
            style={{ background: backgroundColor || 'transparent' }}
          >
            <Input
              id="fill-color"
              type="color"
              value={backgroundColor || '#000000'}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <Input
            value={backgroundColor || ''}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="flex-1"
            placeholder="transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default ShapeEditor;
