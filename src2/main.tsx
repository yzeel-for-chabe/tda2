import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { PublicClientApplication } from "@azure/msal-browser";

import { msalConfig } from "./authConfig";
import { MsalProvider } from "@azure/msal-react";
import AppAuth from "./mainAuth.tsx";
import { ConfigProvider } from "antd";
const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.body).render(
	<React.StrictMode>
		<MsalProvider instance={msalInstance}>
			<ConfigProvider
				theme={{
					token: {
						colorPrimary: "rgb(0, 28, 64)",
					}
				}}
			>
			<AppAuth />
			</ConfigProvider>
		</MsalProvider>
	</React.StrictMode>
);
