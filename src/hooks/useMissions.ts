import { useQuery } from "@tanstack/react-query";
import type { paths } from "../../generated/openapi"

type response = paths['/v1/missions/filter']['post']['responses']['200']['content']['application/json']

const mission_url = true ? 'http://localhost:2999/v1/missions/filter' : 'https://api.phoenixsoftware.fr/v1/missions/filter'

export function useMissions(wayniumclientids: string[]) {
    return useQuery<response>({
        queryKey: ['missions'],
        refetchInterval: 60 * 1000, // Refresh the missions every minute
        queryFn: async (): Promise<Array<any>> => {
            

            const response = await fetch(
                mission_url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        "dayFrom": new Date().toISOString().split('T')[0],
                        "dayTo": new Date().toISOString().split('T')[0],
                        "clientWayniumId": wayniumclientids,
                        "limit": 1000,
                        "offset": 0
                    })
                }
            );

            if(!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json() as response;
        },
        enabled: wayniumclientids.length != 0, // Prevent query from running without a token
    });
}