// hooks/useBusinessFilters.ts
import { getDistance } from "geolib";
import { useMemo } from "react";
import { Business } from "../types/business";

interface UserCoords {
  latitude: number;
  longitude: number;
}

export const useBusinessFilters = (
  businesses: Business[],
  userCoords: UserCoords,
  favorites: string[]
) => {
  const filterByCategory = useMemo(
    () => (category: string) => {
      const businessesWithDistance = businesses.map((b) => {
        // ✅ טיפול בשני פורמטים של address
        let lat: number | undefined;
        let lng: number | undefined;

        if (typeof b.address === "string") {
          // אם address הוא string, נסה לקחת מ-coordinates ישירות
          lat = b.coordinates?.lat;
          lng = b.coordinates?.lng;
        } else if (b.address && typeof b.address === "object") {
          // אם address הוא object, קח מתוכו
          lat = b.address.coordinates?.lat;
          lng = b.address.coordinates?.lng;
        }

        // אם אין קואורדינטות, מרחק גדול
        if (!lat || !lng) {
          return { ...b, distance: 999999 };
        }

        const distance = getDistance(userCoords, {
          latitude: lat,
          longitude: lng,
        });

        return { ...b, distance };
      });

      let data: typeof businessesWithDistance = [];

      if (category === "nearby") {
        data = businessesWithDistance
          .filter((b) => b.distance <= 5000)
          .sort((a, b) => a.distance - b.distance);
      } else if (category === "recommended") {
        data = businessesWithDistance
          .filter((b) => b.rating >= 4.5 && b.distance <= 10000)
          .sort((a, b) => {
            const scoreA = a.rating * 1000 - a.distance / 10;
            const scoreB = b.rating * 1000 - b.distance / 10;
            return scoreB - scoreA;
          });
      } else if (category === "premium") {
        data = businessesWithDistance
          .filter((b) => b.rating >= 4.7)
          .sort((a, b) => b.rating - a.rating);
      } else if (category === "favorites") {
        data = businessesWithDistance.filter((b) =>
          favorites.includes(b.businessId || b.id || "")
        );
      }

      return data;
    },
    [businesses, userCoords, favorites]
  );

  return { filterByCategory };
};
