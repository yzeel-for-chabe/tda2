import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import App from "./App";
import { Button } from "@mui/material";

import { loginRequest } from "./authConfig";

export const SignInButton = () => {
    const { instance } = useMsal();
  
    const handleLogin = (loginType) => {
      if (loginType === "popup") {
        instance.loginPopup(loginRequest).catch((e) => {
          console.log(e);
        });
      } else if (loginType === "redirect") {
        instance.loginRedirect(loginRequest).catch((e) => {
          console.log(e);
        });
      }
    };
    return (

        <Button onClick={() => handleLogin("redirect")}>
          Sign in using Redirect
        </Button>
    );
  };

export default function AppAuth() {

    const isAuthenticated = useIsAuthenticated();

    // if(!isAuthenticated) {
    //     return <SignInButton />;
    // }

    return <App />;
}
