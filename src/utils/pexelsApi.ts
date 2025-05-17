
import { SearchResponse } from '../types';

const PEXELS_API_KEY = 'vF4auw9RFB4d6TWjAzD9HH1AnX2j2aIVnHtOU5ZXbdT6vpFHaj8Gl8mx';

export async function searchPexels(query: string, page = 1, perPage = 30): Promise<SearchResponse> {
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from Pexels:", error);
    throw error;
  }
}

export async function getCuratedPhotos(page = 1, perPage = 30): Promise<SearchResponse> {
  try {
    const response = await fetch(`https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch curated images: ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching curated photos:", error);
    throw error;
  }
}
