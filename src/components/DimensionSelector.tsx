
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  SocialPlatform, 
  PostFormat, 
  PlatformDimensions,
  PosterDimension 
} from '../types';

interface DimensionSelectorProps {
  onDimensionChange: (platform: SocialPlatform, format: PostFormat, width: number, height: number, name: string) => void;
  selectedPlatform?: SocialPlatform;
  selectedFormat?: PostFormat;
  selectedDimension?: PosterDimension;
}

// Define all platform dimensions from the screenshot
const PLATFORM_DIMENSIONS: PlatformDimensions[] = [
  {
    platform: 'facebook',
    feedDimensions: [
      { width: 1200, height: 630, aspectRatio: '1.91:1', name: 'Landscape (1.91:1)' },
      { width: 1080, height: 1080, aspectRatio: '1:1', name: 'Square (1:1)' },
      { width: 1080, height: 1350, aspectRatio: '4:5', name: 'Portrait (4:5)' }
    ],
    storyDimensions: [
      { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Story (9:16)' }
    ]
  },
  {
    platform: 'instagram',
    feedDimensions: [
      { width: 1080, height: 1080, aspectRatio: '1:1', name: 'Square (1:1)' },
      { width: 1080, height: 566, aspectRatio: '16:9', name: 'Landscape (16:9)' },
      { width: 1080, height: 1350, aspectRatio: '4:5', name: 'Portrait (4:5)' }
    ],
    storyDimensions: [
      { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Story (9:16)' }
    ]
  },
  {
    platform: 'whatsapp',
    feedDimensions: [
      { width: 1200, height: 628, aspectRatio: '1.91:1', name: 'Template (1.91:1)' },
      { width: 800, height: 800, aspectRatio: '1:1', name: 'Square (1:1)' }
    ],
    storyDimensions: [
      { width: 1080, height: 1920, aspectRatio: '9:16', name: 'Status (9:16)' },
      { width: 750, height: 1334, aspectRatio: '9:16', name: 'Alternative (9:16)' }
    ]
  }
];

const DimensionSelector: React.FC<DimensionSelectorProps> = ({ 
  onDimensionChange,
  selectedPlatform = 'instagram',
  selectedFormat = 'feed',
  selectedDimension
}) => {
  const handlePlatformChange = (platform: SocialPlatform) => {
    // Find the first dimension for this platform and selected format
    const platformConfig = PLATFORM_DIMENSIONS.find(p => p.platform === platform);
    if (!platformConfig) return;
    
    const dimensions = selectedFormat === 'feed' 
      ? platformConfig.feedDimensions[0] 
      : platformConfig.storyDimensions[0];
    
    onDimensionChange(
      platform, 
      selectedFormat, 
      dimensions.width, 
      dimensions.height,
      dimensions.name
    );
  };
  
  const handleFormatChange = (format: PostFormat) => {
    // Find the first dimension for selected platform and this format
    const platformConfig = PLATFORM_DIMENSIONS.find(p => p.platform === selectedPlatform);
    if (!platformConfig) return;
    
    const dimensions = format === 'feed' 
      ? platformConfig.feedDimensions[0] 
      : platformConfig.storyDimensions[0];
    
    onDimensionChange(
      selectedPlatform, 
      format, 
      dimensions.width, 
      dimensions.height,
      dimensions.name
    );
  };
  
  const handleDimensionChange = (width: number, height: number, name: string) => {
    onDimensionChange(selectedPlatform, selectedFormat, width, height, name);
  };
  
  // Get the current platform configuration
  const currentPlatform = PLATFORM_DIMENSIONS.find(p => p.platform === selectedPlatform) 
    || PLATFORM_DIMENSIONS[0];
  
  // Get the dimensions for the current format
  const currentDimensions = selectedFormat === 'feed' 
    ? currentPlatform.feedDimensions
    : currentPlatform.storyDimensions;

  return (
    <div className="space-y-6 p-4 bg-editor-dark rounded-lg">
      <h2 className="text-lg font-semibold text-white">Poster Dimensions</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-white mb-2">Platform</h3>
          <RadioGroup
            value={selectedPlatform}
            onValueChange={(value) => handlePlatformChange(value as SocialPlatform)}
            className="flex flex-wrap gap-3"
          >
            {PLATFORM_DIMENSIONS.map((platform) => (
              <div key={platform.platform} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={platform.platform}
                  id={`platform-${platform.platform}`}
                />
                <Label
                  htmlFor={`platform-${platform.platform}`}
                  className="text-white capitalize"
                >
                  {platform.platform}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-white mb-2">Format</h3>
          <Tabs 
            value={selectedFormat} 
            onValueChange={(value) => handleFormatChange(value as PostFormat)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed">Feed Post</TabsTrigger>
              <TabsTrigger value="story">Story/Status</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-white mb-2">Size</h3>
          <RadioGroup
            value={`${selectedDimension?.width}x${selectedDimension?.height}`}
            onValueChange={(value) => {
              const [width, height] = value.split('x').map(Number);
              const dim = currentDimensions.find(d => d.width === width && d.height === height);
              if (dim) {
                handleDimensionChange(width, height, dim.name);
              }
            }}
            className="space-y-2"
          >
            {currentDimensions.map((dim) => (
              <div key={`${dim.width}x${dim.height}`} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={`${dim.width}x${dim.height}`}
                  id={`dim-${dim.width}x${dim.height}`}
                />
                <Label
                  htmlFor={`dim-${dim.width}x${dim.height}`}
                  className="text-white"
                >
                  {dim.width} × {dim.height}px ({dim.name})
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default DimensionSelector;
