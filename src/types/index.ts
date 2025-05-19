export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface SearchResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results: number;
  next_page: string;
}

export interface EditorElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string; // For text elements
  fontSize?: number; // For text elements
  color: string;
  backgroundColor?: string;
  fontFamily?: string;
  zIndex: number;
  rotation?: number;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'whatsapp';

export type PostFormat = 'feed' | 'story';

export interface PosterDimension {
  width: number;
  height: number;
  aspectRatio: string;
  name: string;
}

export interface PlatformDimensions {
  platform: SocialPlatform;
  feedDimensions: PosterDimension[];
  storyDimensions: PosterDimension[];
}

export interface EditorState {
  backgroundImage: string | null;
  overlayOpacity: number;
  elements: EditorElement[];
  selectedElementId: string | null;
  canvasDimensions?: {
    width: number;
    height: number;
    platform: SocialPlatform;
    format: PostFormat;
    name: string;
  };
}

// Define the types of tools available in the editor
export type ToolType = 'select' | 'text' | 'rectangle' | 'circle';
