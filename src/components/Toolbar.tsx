
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Text, Square, Circle, Download, Eye } from 'lucide-react';
import { ToolType } from '../types';
import { Link } from 'react-router-dom';

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onDownload: () => void;
  onPreview: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange, onDownload, onPreview }) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-editor-dark rounded-lg">
      <Link to="/">
        <Button variant="ghost" size="icon" className="text-white">
          <ArrowLeft size={20} />
        </Button>
      </Link>
      
      <Separator orientation="vertical" className="h-8" />
      
      <Button 
        variant={activeTool === 'select' ? 'secondary' : 'ghost'} 
        size="sm"
        onClick={() => onToolChange('select')}
        className="text-white"
      >
        Select
      </Button>
      
      <Button
        variant={activeTool === 'text' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onToolChange('text')}
        className="text-white"
      >
        <Text size={16} className="mr-1" />
        Text
      </Button>
      
      <Button
        variant={activeTool === 'rectangle' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onToolChange('rectangle')}
        className="text-white"
      >
        <Square size={16} className="mr-1" />
        Rectangle
      </Button>
      
      <Button
        variant={activeTool === 'circle' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onToolChange('circle')}
        className="text-white"
      >
        <Circle size={16} className="mr-1" />
        Circle
      </Button>
      
      <div className="flex-grow"></div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onPreview}
        className="mr-2"
      >
        <Eye size={16} className="mr-1" />
        Preview
      </Button>
      
      <Button 
        variant="default" 
        size="sm" 
        onClick={onDownload}
        className="bg-editor-purple hover:bg-editor-purple-light"
      >
        <Download size={16} className="mr-1" />
        Download
      </Button>
    </div>
  );
};

export default Toolbar;
