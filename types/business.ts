export interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  image: string;
  rating: number;
  tags: string[];
  coordinates: { lat: number; lng: number };
}
