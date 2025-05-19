
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Text, Square, Circle, Download, Eye, Crop } from 'lucide-react';
import { ToolType } from '../types';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onDownload: () => void;
  onPreview: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange, onDownload, onPreview }) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-2 bg-editor-dark rounded-lg">
        <Link to="/">
          <Button variant="ghost" size="icon" className="text-white">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        
        <Separator orientation="vertical" className="h-8" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={activeTool === 'select' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => onToolChange('select')}
              className="text-white"
            >
              Select
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select and modify elements</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'text' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onToolChange('text')}
              className="text-white"
            >
              <Text size={16} className="mr-1" />
              Text
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add text to your poster</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'rectangle' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onToolChange('rectangle')}
              className="text-white"
            >
              <Square size={16} className="mr-1" />
              Rectangle
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add a rectangle shape</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'circle' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onToolChange('circle')}
              className="text-white"
            >
              <Circle size={16} className="mr-1" />
              Circle
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add a circle shape</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'crop' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onToolChange('crop')}
              className="text-white"
            >
              <Crop size={16} className="mr-1" />
              Crop
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Crop background image</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="flex-grow"></div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPreview}
              className="mr-2"
            >
              <Eye size={16} className="mr-1" />
              Preview
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>See how your poster will look when downloaded</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="default" 
              size="sm" 
              onClick={onDownload}
              className="bg-editor-purple hover:bg-editor-purple-light"
            >
              <Download size={16} className="mr-1" />
              Download
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download your poster as an image</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
