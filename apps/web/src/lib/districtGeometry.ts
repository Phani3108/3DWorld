import { DistrictGeometry, type PublicDistrict } from "@3dworld/contracts";
import { useQuery } from "@tanstack/react-query";

/** Compiled OpenStreetMap geometry for a district (static file), if it has any. */
export const useDistrictGeometry = (district: PublicDistrict | undefined) =>
  useQuery({
    queryKey: ["geometry", district?.geometry],
    enabled: !!district?.geometry,
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: async () => {
      const res = await fetch(`/geo/${district?.geometry}.json`);
      if (!res.ok) throw new Error(`geometry ${res.status}`);
      return DistrictGeometry.parse(await res.json());
    },
  });
