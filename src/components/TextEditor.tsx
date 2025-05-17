
import React, { useState, useEffect, useRef } from 'react';
import { EditorElement } from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TextEditorProps {
  element: EditorElement;
  onUpdate: (updatedElement: EditorElement) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ element, onUpdate }) => {
  const [text, setText] = useState(element.content || 'Text');
  const [fontSize, setFontSize] = useState(element.fontSize || 24);
  const [color, setColor] = useState(element.color || '#FFFFFF');
  const [fontFamily, setFontFamily] = useState(element.fontFamily || 'Roboto');
  
  const fontOptions = [
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
  ];

  useEffect(() => {
    onUpdate({
      ...element,
      content: text,
      fontSize,
      color,
      fontFamily,
    });
  }, [text, fontSize, color, fontFamily]);

  return (
    <div className="space-y-4 p-4 bg-editor-dark rounded-lg">
      <h3 className="text-lg font-medium text-white">Text Properties</h3>
      
      <div className="space-y-2">
        <Label htmlFor="text-content" className="text-white">Text</Label>
        <Input
          id="text-content"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="font-size" className="text-white">Font Size</Label>
          <Input
            id="font-size"
            type="number"
            min={8}
            max={96}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="text-color" className="text-white">Color</Label>
          <div className="flex gap-2">
            <div
              className="w-10 h-10 rounded border overflow-hidden"
              style={{ background: color }}
            >
              <Input
                id="text-color"
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
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="font-family" className="text-white">Font</Label>
        <Select
          value={fontFamily}
          onValueChange={setFontFamily}
        >
          <SelectTrigger id="font-family">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((font) => (
              <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TextEditor;
