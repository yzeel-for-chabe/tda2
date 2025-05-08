import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import App from "./App";
import { Button } from "@mui/material";

import { loginRequest } from "./authConfig";
import { useEffect } from "react";

export const SignInButton = () => {
	const { instance } = useMsal();

	const handleLogin = (loginType: string) => {
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

	handleLogin("redirect")

	// useEffect(() => {
	//   handleLogin('redirect');
	// }, [])

	return null;

	return (

		<Button onClick={() => handleLogin("redirect")}>
			Sign in using Redirect
		</Button>
	);
};

export default function AppAuth() {

	const { instance } = useMsal();
	const isAuthenticated = useIsAuthenticated();
	const url = window.location.href;

	if (!isAuthenticated) {
		// instance.loginRedirect(loginRequest).catch((e) => {
		// 	console.log(e);
		// });
		return <SignInButton />;
	}

	return <App />;
}
