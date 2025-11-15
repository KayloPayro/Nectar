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
        const distance = getDistance(userCoords, {
          latitude: b.coordinates.lat,
          longitude: b.coordinates.lng,
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
        data = businessesWithDistance.filter((b) => favorites.includes(b.id));
      }

      return data;
    },
    [businesses, userCoords, favorites]
  );

  return { filterByCategory };
};
