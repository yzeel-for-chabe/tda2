import { useQuery } from "@tanstack/react-query";
import type { paths } from "../../generated/openapi_geolocation"

type response = paths['/v1/geolocation/missions/tda']['post']['responses']['200']['content']['application/json']

const geolocation_url = false ? 'http://localhost:3004/v1/geolocation/missions/tda' : 'https://api.phoenixsoftware.fr/v1/geolocation/missions/tda'

export function useGeolocationInfo(wayniumMissionIds: string[]) {
    return useQuery<response>({
        queryKey: ['geolocations'],
        refetchInterval: 30_000,
        queryFn: async (): Promise<response> => {
            

            const response = await fetch(
                geolocation_url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "wayniumids": wayniumMissionIds.map(id => id)
                    })
                }
            );

            if(!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json() as response;
        },
        enabled: wayniumMissionIds.length != 0, // Prevent query from running without a token
    });
}