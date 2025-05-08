import { AuthenticationResult, IPublicClientApplication } from "@azure/msal-browser";
import { useEffect, useState } from "react";

export async function getAccessToken(instance: IPublicClientApplication) {
	const accessTokenRequest = {
		scopes: [
			`https://chabeazureb2cnpe.onmicrosoft.com/api-missions/user_access`,
		],
		account: instance.getAllAccounts()[0]!,
	};
	return instance
		.acquireTokenSilent(accessTokenRequest)
		.then((accessTokenResponse) => {
            return accessTokenResponse
			// return [accessTokenResponse.accessToken, accessTokenResponse] as const;
		});
}

export const useMsalToken = (msalInstance: IPublicClientApplication) => {
    
    const respRef = useState<AuthenticationResult | null>(null);
    
    useEffect(() => {
        getAccessToken(msalInstance).then((resp) => {
            // respRef.current = resp;
			respRef[1](resp)
        });
    }, [msalInstance]);

    return { msalToken: respRef[0]?.accessToken, msalResponse: respRef[0] };

}
