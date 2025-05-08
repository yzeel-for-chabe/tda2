import React from "react";
import ReactDOM from "react-dom/client";
import { PublicClientApplication } from "@azure/msal-browser";

import { msalConfig } from "./authConfig.ts";
import { MsalProvider } from "@azure/msal-react";
import AppAuth from "./mainAuth.tsx";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { Wrapper } from "@googlemaps/react-wrapper";
import { APIProvider } from "@vis.gl/react-google-maps";
const msalInstance = new PublicClientApplication(msalConfig);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24, // 24 hours
		},
	},
})

const persister = createSyncStoragePersister({
	storage: window.localStorage,
})

// persistQueryClient({
// 	queryClient,
// 	persister,
// })

let timeBeforeReloadSec = 300;
let dateLossOfFocus: Date | null = null;
function reloadWindowsAfterLossOfFocus() {
	if (document.visibilityState === 'visible') {
		if (dateLossOfFocus != null) {
			let currentTime = new Date();
			const delta_secs =
				(currentTime.getTime() - dateLossOfFocus.getTime()) / 1000;
			if (delta_secs > timeBeforeReloadSec) {
				window.location.reload();
			}
		}
	} else {
		dateLossOfFocus = new Date();
	}
}
document.addEventListener('visibilitychange', reloadWindowsAfterLossOfFocus);

ReactDOM.createRoot(document.body).render(
	<React.StrictMode>
		<MsalProvider instance={msalInstance}>
			<QueryClientProvider client={queryClient}>
				<ConfigProvider
					theme={{
						token: {
							colorPrimary: "rgb(0, 28, 64)",
						}
					}}
				>
					<Wrapper
						apiKey="AIzaSyDMZQ3-mM6E1c95TXCnuVmqB9xXwD-M_iY"
					>
						<APIProvider
							apiKey={'AIzaSyDMZQ3-mM6E1c95TXCnuVmqB9xXwD-M_iY'}
						>
							<AppAuth />
						</APIProvider>
					</Wrapper>
				</ConfigProvider>
			</QueryClientProvider>
		</MsalProvider>
	</React.StrictMode>
);
