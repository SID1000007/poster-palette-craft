
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ImageGrid from '../components/ImageGrid';
import { searchPexels, getCuratedPhotos } from '../utils/pexelsApi';
import { PexelsPhoto } from '../types';
import { toast } from 'sonner';

const Index = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  // Load initial curated photos
  useEffect(() => {
    const loadCuratedPhotos = async () => {
      try {
        setIsLoading(true);
        const data = await getCuratedPhotos(1, 20);
        setPhotos(data.photos);
      } catch (error) {
        console.error('Failed to load curated photos:', error);
        toast.error('Failed to load photos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCuratedPhotos();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    setIsLoading(true);
    
    try {
      const data = await searchPexels(query, 1, 20);
      setPhotos(data.photos);
      if (data.photos.length === 0) {
        toast.info('No images found for your search. Try different keywords.');
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectImage = (photo: PexelsPhoto) => {
    navigate('/editor', { state: { backgroundImage: photo.src.large } });
    toast.success(`Selected image by ${photo.photographer}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="py-8 px-4 flex flex-col items-center space-y-6">
        <h1 className="text-4xl font-bold text-white">Poster Palette Craft</h1>
        <p className="text-xl text-muted-foreground max-w-xl text-center">
          Create beautiful posters with images from Pexels. Search for an image to get started.
        </p>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </header>
      
      <main className="flex-1 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">
            {searchTerm ? `Results for "${searchTerm}"` : 'Curated Images'}
          </h2>
          
          <ImageGrid 
            photos={photos} 
            isLoading={isLoading} 
            onSelectImage={handleSelectImage} 
          />
        </div>
      </main>
      
      <footer className="py-4 px-4 text-center text-muted-foreground border-t border-muted">
        <p>Images provided by <a href="https://www.pexels.com/" className="text-primary hover:underline" target="_blank" rel="noreferrer">Pexels</a></p>
      </footer>
    </div>
  );
};

export default Index;
