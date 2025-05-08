/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configuration, LogLevel } from "@azure/msal-browser";

// Bluesoft stuff
export const b2cPolicies = {
    names: {
      signUpSignIn: 'B2C_1A_SIGNUP_SIGNIN_PHONEOREMAILMFA',
      editProfile: 'B2C_1A_EDIT_PROFILE',
      // forgotPassword: 'B2C_1_reset_v3',
    },
    authorities: {
      signUpSignIn: {
        authority: `https://chabeazureb2cnpe.b2clogin.com/chabeazureb2cnpe.onmicrosoft.com/B2C_1A_SIGNUP_SIGNIN_PHONEOREMAILMFA`,
      },
      editProfile: {
        authority:
        `https://chabeazureb2cnpe.b2clogin.com/chabeazureb2cnpe.onmicrosoft.com/B2C_1A_EDIT_PROFILE`,
      },
      // forgotPassword: {
      //     authority: 'https://chabeazureb2cnpe.b2clogin.com/chabeazureb2cnpe.onmicrosoft.com/B2C_1_reset_v3',
      // },
    },
    authorityDomain: `chabeazureb2cnpe.b2clogin.com`,
  };

/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */

export const msalConfig: Configuration = {
    auth: {
        clientId: "4195303f-5f26-4cde-970e-10bb7a8abe58",
        authority: b2cPolicies.authorities.signUpSignIn.authority,
        redirectUri:
            window.location.hostname.indexOf("localhost") != -1 ? "http://localhost:3000" : "https://rct.tda2.chabe.com",

        knownAuthorities: [b2cPolicies.authorityDomain ?? ''], // Mark your B2C tenant's domain as trusted.
        // validateAuthority: true,
        navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.


    },
    cache: {
        // cacheLocation: "localStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {	
        loggerOptions: {	
            loggerCallback: (level, message, containsPii) => {	
                if (containsPii) {		
                    return;		
                }		
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }	
            }	
        }	
    },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
	
    scopes: []
};

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};