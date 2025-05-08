import { useQuery } from "@tanstack/react-query";
import { Habilitation, HabilitationResponse } from "../core/habilitation";

export function useBsHabilitations(token: string | undefined) {
    return useQuery({
        queryKey: ['habilitation'],
        queryFn: async (): Promise<HabilitationResponse> => {
            if (!token) {
                console.error("No authentication token available")
                throw new Error("No authentication token available")
            };

            const response = await fetch(
                'https://chabe-int-ca-api-habilitations.orangepond-bbd114b2.francecentral.azurecontainerapps.io/api/v1/auth/me/adb2c',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            const res = await response.text();

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return Habilitation.parseHabilitationResponse(res);

        },
        enabled: !!token, // Prevent query from running without a token
    });
}