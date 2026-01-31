// types/business.ts
export interface Business {
  id?: string; // מקומי
  businessId?: string; // מהשרת
  _id?: string; // MongoDB ID
  name: string;
  description: string;
  image: string;
  address:
    | string
    | {
        street: string;
        city: string;
        coordinates: {
          lat: number;
          lng: number;
        };
      };
  coordinates?: {
    // תמיכה בפורמט ישן
    lat: number;
    lng: number;
  };
  category?: string;
  phone?: string;
  email?: string;
  tags: string[];
  rating: number;
  totalReviews?: number;
  openingHours?: any;
  isActive?: boolean;
}
