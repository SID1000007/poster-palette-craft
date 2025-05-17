
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface OverlayControlsProps {
  overlayOpacity: number;
  onOpacityChange: (value: number) => void;
}

const OverlayControls: React.FC<OverlayControlsProps> = ({ overlayOpacity, onOpacityChange }) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-editor-dark rounded-lg">
      <Label htmlFor="overlay-opacity" className="text-white min-w-24">
        Overlay Opacity: {Math.round(overlayOpacity * 100)}%
      </Label>
      <Slider
        id="overlay-opacity"
        min={0}
        max={1}
        step={0.01}
        value={[overlayOpacity]}
        onValueChange={(value) => onOpacityChange(value[0])}
        className="w-full max-w-xs"
      />
    </div>
  );
};

export default OverlayControls;
