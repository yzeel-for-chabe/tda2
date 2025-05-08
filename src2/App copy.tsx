import "./App.css";

import { Wrapper } from "@googlemaps/react-wrapper";
import {
	Button,
	CircularProgress,
	FormControlLabel,
	FormGroup,
	Input,
	Paper,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	ToggleButton,
	Typography,
} from "@mui/material";
import useUrlState from "./core/utils/useUrlState";

import { GeolocActualizer } from "./Components/GeolocActualizer";
import { OneMission } from "./Components/OneMission";
import { useEffect, useRef, useState } from "react";
import {
	random_car,
	random_firstname,
	random_lastname,
	random_tags,
} from "./random";
import { IPublicClientApplication } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { Habilitation } from "./Habilitation";
import { useCountdown } from "./Hooks/useCountdown";
import * as authconfig from "./authConfig";
import { CarLocEx } from "./Components/CarLoc/CarLocEx";
import { MapEx } from "./Components/MapEx";
import { WGetFirstLastLoc } from "./core/waynium";
GeolocActualizer.hi();

// const validate_url_tab = (value: string) => ['tab_missions_to_hotel', 'tab_missions_from_hotel', 'tab_missions_done'].includes(value)
const validate_url_size = (value: string) => ["true", "false"].includes(value);

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
			return [accessTokenResponse.accessToken, accessTokenResponse] as const;
		});
}

export type MissionT = {

	w: any;

	id: number;
	passenger: string;
	tags: string[];
	arrival: {
		estimated: string;
		remaining: string;
	};
	pinned: boolean;
	locations: {
		from: string;
		to: string;
	};
	chauffeur_name: string;
	chauffeur_phone: string;
	car_brand: string;
	license_plate: string;
};

function waynium_to_missiont(w: any): MissionT | null {
	console.log({ w });

	const get_name = (w: any) => {
		const p1 = w.C_Gen_Presence[0]?.C_Gen_Passager || { PAS_PRENOM: '', PAS_NOM: '' };

		const fname = ((p1.PAS_PRENOM || "") as string).trim()
		const lname = ((p1.PAS_NOM || "") as string).trim()

		if (fname == "" && lname == "") {
			return "??";
		}

		if (fname == "") {
			return lname.toUpperCase();
		}

		if (lname == "") {
			return fname + " (Name Unknown)";
		}

		return fname + " " + lname.toUpperCase();
	}

	const ms_to_hm = (ms: number) => {
		const hours = Math.floor(ms / 1000 / 60 / 60);
		const mins = Math.floor((ms / 1000 / 60) % 60);

		return `${hours}:${mins}`;
	}


	try {

		const estimated_arrival = w.MIS_HEURE_FIN as string // 01:01:01
		let ea = new Date(new Date().toISOString().substring(0, 10) + "T" + estimated_arrival)
		let eastr = null

		if (isNaN(ea.getTime())) {
			ea = new Date()
			eastr = "??"
		}

		try { 
			eastr = ea.toTimeString()?.substring(0, 5)
		} catch (e) {
			eastr = "??"
		}

		const cgenchu = w.C_Gen_Chauffeur || { CHU_PRENOM: '', CHU_NOM: '', CHU_TEL_MOBILE_1: '' }
		const cgenvoi = w.C_Gen_Voiture || { VOI_MODELE: '', VOI_LIBELLE: '' }

		const wlocs = WGetFirstLastLoc(w)

		return {

			w: w,

			id: w.MIS_ID,
			passenger: get_name(w),
			tags: [],
			arrival: {
				estimated: eastr,
				remaining: ms_to_hm(ea.getTime() - new Date().getTime()).toString(),
			},
			pinned: false,
			locations: {
				from: wlocs.startLoc.LIE_LIBELLE,
				to: wlocs.endLoc.LIE_LIBELLE,
			},
			chauffeur_name: cgenchu.CHU_PRENOM + " " + cgenchu.CHU_NOM.toUpperCase(),
			chauffeur_phone: cgenchu.CHU_TEL_MOBILE_1,
			car_brand: cgenvoi.VOI_MODELE,
			license_plate: cgenvoi.VOI_LIBELLE,
		};
	} catch (e) {

		return null;
	}
}

function MissionFilter(mission: MissionT, search: string) {
	if (search === "") {
		return true;
	}

	const fulltext = JSON.stringify(mission).toLowerCase();
	return fulltext.includes(search.toLowerCase());
}

const fake_missions = false

const base_api_url =
	window.location.hostname.indexOf("localhoxst") != -1
		? "http://localhost:3001/api/"
		: "https://rct.tda2.chabe.com/api/";

export function App() {
	const [search, setSearch] = useState<string>("");

	// const [tab, setTab] = useUrlState<string>('tab', 'tab_missions_to_hotel', validate_url_tab)
	const [increasedMiddleSize, setIncreasedMiddleSize] = useUrlState<boolean>(
		"all_missions",
		false,
		validate_url_size
	);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [loadingMsg, setLoadingMsg] = useState<string>(
		"Authentification ..."
	);
	const reload_countdown = useCountdown(10, 1000, () => {
		// window.location.reload();
	}); // Reload the page after 1 hour ?

	const [isFailed, setIsFailed] = useState<boolean>(false);
	const [failMsg, setFailMsg] = useState<string>("");

	const [selected, setSelected] = useState(-1);

	const [allMissions, setAllMissions] = useState<MissionT[]>(
		Array.from({ length: fake_missions ? 10 : 0 }, (_, i) => ({
			w: [],
			id: i,
			passenger: `${random_lastname()} ${random_firstname()}`,
			tags: random_tags(),
			arrival: {
				estimated: "15h00",
				remaining: "2h 30min",
			},
			pinned: false,
			locations: {
				from: "Aéroport CDG",
				to: "Hotel de la Paix",
			},
			chauffeur_name: "M. Macho FEUR",
			chauffeur_phone: "+33 6 12 34 56 78",
			car_brand: random_car(),
			license_plate: "AA-000-FF",
		}))
	);

	const updateOneMission = (mission: MissionT) => {
		setAllMissions((prev) =>
			prev.map((m) => (m.id === mission.id ? mission : m))
		);
	};

	const remaining_str_to_minutes = (str: string) => {
		
		const [hours, minutes] = str.replace('min', "").split("h").map((e) => parseInt(e.trim()));
		const r = Math.max(0, hours * 60 + minutes);
	
		console.log({str, r})

		return r;
	}

	const calculate_increased_middle_size = () => {
		// const viewport_width = Math.max(
		// 	document.documentElement.clientWidth || 0,
		// 	window.innerWidth || 0
		// );
		// if (viewport_width < 800) {
		// 	return "100%";
		// }

		// return "calc(100% - 500px)";

		// Requested to completely hide the map if the middle size is increased
		return '100%';
	};

	const [refreshToken, setRefreshToken] = useState(0);
	useEffect(() => {
		setInterval(() => {
			if (!isFailed) setRefreshToken((prev) => prev + 1);
		}, 10_000)
	}, [])

	const { instance } = useMsal();

	const token = useRef<any>(null)

	useEffect(() => {
		const canceltoken = new AbortController();

		if (fake_missions) return;

		(async () => {
			const baseurl =
				"https://chabe-int-ca-api-habilitations.orangepond-bbd114b2.francecentral.azurecontainerapps.io";

			let accessToken = "";
			try {
				const r = (await getAccessToken(instance))
				accessToken = r[0];
				token.current = r[1];
				
			} catch (e) {
				instance.loginRedirect(authconfig.loginRequest).catch((e) => {
					console.log(e);
				});
			}
			const response = await fetch(baseurl + "/api/v1/auth/me/adb2c", {
				signal: canceltoken.signal,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}).then((e) => e.text());

			setLoadingMsg("Checking authorizations");

			const hab = Habilitation.parseHabilitationResponse(response);
			let client_ids = [
				hab.cliId,
				hab.subAccounts.map((a) => `${a.dispatch}_${a.cliId}`),
			].flat();

			setLoadingMsg("Retrieving mission informations");


			// const client_ids_string = client_ids
			// 	.join("_")
			// 	.substring(1, client_ids.join(",").length - 1);
			// console.log(client_ids_string);

			setLoadingMsg(
				`Récupération des missions pour ${client_ids.length} client${client_ids.length > 1 ? "s" : ""
				}`
			);

			const url = "missions/clients/" + client_ids;
			let missions = [];

			try {
				missions = await fetch(base_api_url + url, {
					signal: canceltoken.signal,
				}).then((e) => e.json());

				setAllMissions(missions.filter(m => m != null).map(waynium_to_missiont));

				setIsFailed(false)
				setLoadingMsg("Done");
				setIsLoading(false);
			} catch (e) {
				setIsLoading(false);
				setIsFailed(true);

				reload_countdown.reset();
				reload_countdown.start();
			}
		})();

		return () => {
			reload_countdown.pause();
			reload_countdown.reset();

			// Cancel the http requests
			canceltoken.abort();
		};
	}, [instance, refreshToken]);

	const [showAcc, setShowAcc] = useState(false);

	const incoming_missions = allMissions
		.filter(m => m != null)
		.filter((mission) => !mission.pinned)
		.filter((m) => MissionFilter(m, search))
		.filter((m) => showAcc ? true : m.w.MIS_SMI_ID != "7")
		.filter(e => (
			remaining_str_to_minutes(e.arrival.remaining) < 45
			&& remaining_str_to_minutes(e.arrival.remaining) > 0
		))

	return (
		<>
			<div className="page">
				<nav id="navbar" className="navbar-chabe">
					<menu>
						<li>
							<a
								id="nav-dashboard"
								className="nav-link"
								href="https://agreeable-hill-038a64303.4.azurestaticapps.net/dashboard"
								aria-current="page"
							>
								<img
									src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/nav-home-icon.e0d99f32dc8c1b2787e29f865cbf6da1.svg"
									alt="Clickable Dashboard button side navigation bar"
								/>
							</a>
						</li>
						<li>
							<a
								id="nav-passenger"
								className="nav-link"
								href="https://agreeable-hill-038a64303.4.azurestaticapps.net/passenger"
							>
								<img
									src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/passenger-icon.c910ce52b2c01a277e279004e67c770e.svg"
									alt="Clickable Dashboard button side navigation bar"
								/>
							</a>
						</li>
						<li>
							<a
								id="nav-dashboard"
								className="nav-link is-active"
								href="/dashboard"
								aria-current="page"
							>
								<img
									src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/nav-home-icon.e0d99f32dc8c1b2787e29f865cbf6da1.svg"
									alt="Clickable Dashboard button side navigation bar"
								/>
							</a>
						</li>
					</menu>
					<img
						className="navbar-logo"
						src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/chabe-logo.d6fdbca61b47529a918259752dada744.svg"
						alt="Chabé logo side navigation bar"
					/>
				</nav>

				<div style={{ flex: "1", height: "100%" }}>
					{/* Header */}
					<div
						id="header"
						data-testid="header"
						className="header-chabe"
					>
						<div className="header-item d-flex justify-content-between">
							<li id="header-home" className="header-home">
								<img
									src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/logo-chabe.999d8b4d8a3a06fc5c11f4740d647335.svg"
									alt="Chabé logo header"
								/>
							</li>
							{/* <li>
								<div
									className="notifications"
									data-testid="notifications"
								>
									<div
										className="notifications__icon"
										id="notifications-icon-button"
										data-testid="notifications-icon-button"
										tabIndex={0}
									>
										<img
											src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/notification.810dac206be6943a4c4d743922becbde.svg"
											alt="bell"
										/>
									</div>
								</div>
							</li> */}
							<li>
								<div
									className="account-menu"
									data-testid="account-menu"
								>
									<div
										className="MuiAvatar-root MuiAvatar-circular MuiAvatar-colorDefault account-avatar css-7yrfzp"
										id="btn-account-menu"
										data-testid="btn-account-menu"
										title={token?.current?.account?.name || "Aucun nom"}
									>
										{
											/*
											{
												"authority":"https://chabeazureb2cnpe.b2clogin.com/chabeazureb2cnpe.onmicrosoft.com/b2c_1a_signup_signin_phoneoremailmfa/",
												"uniqueId":"878e9744-2324-415b-b250-9e222b13e16c",
												"tenantId":"54f82052-7511-4aaa-ad43-09735db6bcd9",
												"scopes":["https://chabeazureb2cnpe.onmicrosoft.com/api-missions/user_access"],
												"account":{
													"homeAccountId":"878e9744-2324-415b-b250-9e222b13e16c-b2c_1a_signup_signin_phoneoremailmfa.54f82052-7511-4aaa-ad43-09735db6bcd9",
													"environment":"chabeazureb2cnpe.b2clogin.com",
													"tenantId":"54f82052-7511-4aaa-ad43-09735db6bcd9",
													"username":"","localAccountId":"878e9744-2324-415b-b250-9e222b13e16c",
													"name":"CBP Giang",
													"authorityType":"MSSTS","tenantProfiles":{},
													"idTokenClaims":{
														"exp":1732315584,"nbf":1732229184,"ver":"1.0",
														"iss":"https://chabeazureb2cnpe.b2clogin.com/54f82052-7511-4aaa-ad43-09735db6bcd9/v2.0/","sub":"878e9744-2324-415b-b250-9e222b13e16c",
														"aud":"4195303f-5f26-4cde-970e-10bb7a8abe58","acr":"b2c_1a_signup_signin_phoneoremailmfa",
														"nonce":"019350e7-9120-7e71-ab2f-c84dfd97386c","iat":1732229184,"auth_time":1732229183,
														"email":"gtq.chabe+cbptest@gmail.com",
														"name":"CBP Giang",
														"given_name":"CBP",
														"family_name":"Giang",
														"idp":"Local","tid":"54f82052-7511-4aaa-ad43-09735db6bcd9","at_hash":"bN_OU4EOb_ZMbENT7ExMUQ"},"idToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6Ik83aGRhOE1xMGRKNTFIb190X3Y4VzFReWNBaHRXaHpxNVBpR0xEdkVobXciLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MzIzMTU1ODQsIm5iZiI6MTczMjIyOTE4NCwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9jaGFiZWF6dXJlYjJjbnBlLmIyY2xvZ2luLmNvbS81NGY4MjA1Mi03NTExLTRhYWEtYWQ0My0wOTczNWRiNmJjZDkvdjIuMC8iLCJzdWIiOiI4NzhlOTc0NC0yMzI0LTQxNWItYjI1MC05ZTIyMmIxM2UxNmMiLCJhdWQiOiI0MTk1MzAzZi01ZjI2LTRjZGUtOTcwZS0xMGJiN2E4YWJlNTgiLCJhY3IiOiJiMmNfMWFfc2lnbnVwX3NpZ25pbl9waG9uZW9yZW1haWxtZmEiLCJub25jZSI6IjAxOTM1MGU3LTkxMjAtN2U3MS1hYjJmLWM4NGRmZDk3Mzg2YyIsImlhdCI6MTczMjIyOTE4NCwiYXV0aF90aW1lIjoxNzMyMjI5MTgzLCJlbWFpbCI6Imd0cS5jaGFiZStjYnB0ZXN0QGdtYWlsLmNvbSIsIm5hbWUiOiJDQlAgR2lhbmciLCJnaXZlbl9uYW1lIjoiQ0JQIiwiZmFtaWx5X25hbWUiOiJHaWFuZyIsImlkcCI6IkxvY2FsIiwidGlkIjoiNTRmODIwNTItNzUxMS00YWFhLWFkNDMtMDk3MzVkYjZiY2Q5IiwiYXRfaGFzaCI6ImJOX09VNEVPYl9aTWJFTlQ3RXhNVVEifQ.WsFNqWZXstRVIeioGz3Rblh-Q-GUGBR712RbWdQiDHg7YlRR066SfKaDwdQkxAy2LSNmWStCWIo_6IpPXZzq9G28FDTiRMvoo771Ua9SUsxndq5FVO8Kk72gfcPd9y6lbAC0T9DdXQbt-vGUsGZvmYF_qaZz3-93nRFJflTqMegjJTlmWaKEIVkzNeV2vJa_Bntw8pdC4dfYANVvTRiTnZUJ4CIsN_LUZQiujVgmwnaYkMI0E3UYm8BCLmYvF4DlCsH3wdXuBx7pD_GTA3dob9h3nLYftLJ5OwCJKe4KbYRJIbeZ6aTBrXnjGfTU6d4nG6_sj3kr4hoksIGoZqJT-Q"},"idToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6Ik83aGRhOE1xMGRKNTFIb190X3Y4VzFReWNBaHRXaHpxNVBpR0xEdkVobXciLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MzIzMTU1ODQsIm5iZiI6MTczMjIyOTE4NCwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9jaGFiZWF6dXJlYjJjbnBlLmIyY2xvZ2luLmNvbS81NGY4MjA1Mi03NTExLTRhYWEtYWQ0My0wOTczNWRiNmJjZDkvdjIuMC8iLCJzdWIiOiI4NzhlOTc0NC0yMzI0LTQxNWItYjI1MC05ZTIyMmIxM2UxNmMiLCJhdWQiOiI0MTk1MzAzZi01ZjI2LTRjZGUtOTcwZS0xMGJiN2E4YWJlNTgiLCJhY3IiOiJiMmNfMWFfc2lnbnVwX3NpZ25pbl9waG9uZW9yZW1haWxtZmEiLCJub25jZSI6IjAxOTM1MGU3LTkxMjAtN2U3MS1hYjJmLWM4NGRmZDk3Mzg2YyIsImlhdCI6MTczMjIyOTE4NCwiYXV0aF90aW1lIjoxNzMyMjI5MTgzLCJlbWFpbCI6Imd0cS5jaGFiZStjYnB0ZXN0QGdtYWlsLmNvbSIsIm5hbWUiOiJDQlAgR2lhbmciLCJnaXZlbl9uYW1lIjoiQ0JQIiwiZmFtaWx5X25hbWUiOiJHaWFuZyIsImlkcCI6IkxvY2FsIiwidGlkIjoiNTRmODIwNTItNzUxMS00YWFhLWFkNDMtMDk3MzVkYjZiY2Q5IiwiYXRfaGFzaCI6ImJOX09VNEVPYl9aTWJFTlQ3RXhNVVEifQ.WsFNqWZXstRVIeioGz3Rblh-Q-GUGBR712RbWdQiDHg7YlRR066SfKaDwdQkxAy2LSNmWStCWIo_6IpPXZzq9G28FDTiRMvoo771Ua9SUsxndq5FVO8Kk72gfcPd9y6lbAC0T9DdXQbt-vGUsGZvmYF_qaZz3-93nRFJflTqMegjJTlmWaKEIVkzNeV2vJa_Bntw8pdC4dfYANVvTRiTnZUJ4CIsN_LUZQiujVgmwnaYkMI0E3UYm8BCLmYvF4DlCsH3wdXuBx7pD_GTA3dob9h3nLYftLJ5OwCJKe4KbYRJIbeZ6aTBrXnjGfTU6d4nG6_sj3kr4hoksIGoZqJT-Q","idTokenClaims":{"exp":1732315584,"nbf":1732229184,"ver":"1.0","iss":"https://chabeazureb2cnpe.b2clogin.com/54f82052-7511-4aaa-ad43-09735db6bcd9/v2.0/","sub":"878e9744-2324-415b-b250-9e222b13e16c","aud":"4195303f-5f26-4cde-970e-10bb7a8abe58","acr":"b2c_1a_signup_signin_phoneoremailmfa","nonce":"019350e7-9120-7e71-ab2f-c84dfd97386c","iat":1732229184,"auth_time":1732229183,"email":"gtq.chabe+cbptest@gmail.com","name":"CBP Giang","given_name":"CBP","family_name":"Giang","idp":"Local","tid":"54f82052-7511-4aaa-ad43-09735db6bcd9","at_hash":"bN_OU4EOb_ZMbENT7ExMUQ"},"accessToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6Ik83aGRhOE1xMGRKNTFIb190X3Y4VzFReWNBaHRXaHpxNVBpR0xEdkVobXciLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJmY2Q1NzU5ZC1hZjliLTQ3NGItYTkzOS03MjM5MTJhNzJhYTciLCJpc3MiOiJodHRwczovL2NoYWJlYXp1cmViMmNucGUuYjJjbG9naW4uY29tLzU0ZjgyMDUyLTc1MTEtNGFhYS1hZDQzLTA5NzM1ZGI2YmNkOS92Mi4wLyIsImV4cCI6MTczMjMxNTU4NCwibmJmIjoxNzMyMjI5MTg0LCJzdWIiOiI4NzhlOTc0NC0yMzI0LTQxNWItYjI1MC05ZTIyMmIxM2UxNmMiLCJlbWFpbCI6Imd0cS5jaGFiZStjYnB0ZXN0QGdtYWlsLmNvbSIsIm5hbWUiOiJDQlAgR2lhbmciLCJnaXZlbl9uYW1lIjoiQ0JQIiwiZmFtaWx5X25hbWUiOiJHaWFuZyIsImlkcCI6IkxvY2FsIiwidGlkIjoiNTRmODIwNTItNzUxMS00YWFhLWFkNDMtMDk3MzVkYjZiY2Q5Iiwibm9uY2UiOiIwMTkzNTBlNy05MTIwLTdlNzEtYWIyZi1jODRkZmQ5NzM4NmMiLCJzY3AiOiJ1c2VyX2FjY2VzcyIsImF6cCI6IjQxOTUzMDNmLTVmMjYtNGNkZS05NzBlLTEwYmI3YThhYmU1OCIsInZlciI6IjEuMCIsImlhdCI6MTczMjIyOTE4NH0.YQGiHKJXnh7Sk-4G_oXtC1GbWV21SOLvXJJxUoHy8VMwP9jPYHQH2JxF4GHCeMbIxPC4wNPtI2sBwpVi7G44nAxUOZMN_o8dbBIsQKRWUED3oW_DIokd5CSAg5i1_gyQzGEM8E3ddiFIeiHkmILtS-p7Bk3dSAtNd_ZAJ25FibxAH4R92lPwFxsAreqJaYnikt7eTITCAhO_dv-Gl81wFclarxl42QbIjQpo1OQ5egwOsEsg_so-r0d2-4AfNsxnZknAp_K87lv8TqIF3mNjFOgRCgVPrJmavd8nR-vHqVmS52lZE9mJBqK7B1k8sZ6UodK3vX4EIAnzpVJfBFJD2Q","fromCache":false,"expiresOn":"2024-11-22T22:46:14.000Z","extExpiresOn":"2024-11-22T22:46:14.000Z","correlationId":"019350e7-9104-7fd5-9dba-30cd66fbd904","requestId":"","familyId":"","tokenType":"Bearer","cloudGraphHostName":"","msGraphHost":"","fromNativeBroker":false} */
										}
										{token?.current?.account?.idTokenClaims?.given_name?.[0] || ""}
										{token?.current?.account?.idTokenClaims?.family_name?.[0] || ""}
									</div>
								</div>
							</li>
						</div>
					</div>
					{/* End of Header */}

					<div
						style={{
							display: "flex",
							height: "100%",
							width: "100%",
						}}
					>
						<div
							className="vertical-middle"
							style={{
								width: increasedMiddleSize
									? calculate_increased_middle_size()
									: undefined,
								transition: "width 0.5s",
							}}
						>
							<div className="midtitle">
								<h1
									style={{
										whiteSpace: "nowrap",
										overflow: increasedMiddleSize
											? "hidden"
											: undefined,
										fontFamily:
											"EuclidCircularA-Semibold,-apple-system,BlinkMacSystemFont,sans-serif",
									}}
								>
									{increasedMiddleSize
										? "Toutes les missions"
										: "Arrivées imminentes"}
									<ToggleButton
										value="check"
										selected={increasedMiddleSize}
										onChange={() =>
											setIncreasedMiddleSize(
												!increasedMiddleSize
											)
										}
										style={{
											marginLeft: 10,
											marginTop: 10,
											transform:
												"scale(0.8) translateY(-10px)",
											transition: "* 0.5s",
											fontFamily: "EuclidCircularA-Semibold",
										}}
									>
										{increasedMiddleSize
											? "Afficher les Arrivées imminentes"
											: "Afficher tout"}
									</ToggleButton>
									<br />
									<FormGroup>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												marginBottom: 10,
											}}
										>
											<Input
												style={{ flex: 1 }}
												placeholder="Rechercher"
												value={search}
												onChange={(e) =>
													setSearch(e.target.value)
												}
											/>
											<FormControlLabel
												control={
													<Switch
														checked={showAcc}
														onChange={(_, v) =>
															setShowAcc(v)
														}
													/>
												}
												label="Afficher les accueils"
											/>
										</div>
									</FormGroup>
								</h1>
							</div>

							{isFailed && (
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
										alignItems: "center",
										height: "50%",
									}}
								>
									<Typography
										style={{
											marginTop: 10,
											textAlign: "center",

											color: "red",
										}}
									>
										Impossible de se connecter au serveur
										<br />
										Nous allons essayer à nouveau dans{" "}
										{reload_countdown.value} seconde(s).
										<br />
										<br />
										Nous vous prions de nous excuser pour la
										gêne occasionnée.
										<br />
										{failMsg}
										<div style={{ marginTop: 10 }}></div>
										<Button
											variant="contained"
											onClick={() => {
												window.location.reload();
											}}
										>
											Recharger la page
										</Button>
									</Typography>
								</div>
							)}

							{
								// No mission
								!increasedMiddleSize &&
								!isFailed &&
								!isLoading &&
								incoming_missions.length == 0 && (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											justifyContent: "center",
											alignItems: "center",
											height: "50%",
										}}
									>
										<Typography
											style={{
												marginTop: 10,
												textAlign: "center",
											}}
										>
											Aucune mission prévue pour les
											45 prochaines minutes !
											<div
												style={{ marginTop: 10 }}
											></div>
											<Button
												style={{
													color: "#001c40",
												}}
												onClick={() => {
													window.location.reload();
												}}
											>
												Actualiser la page
											</Button>
										</Typography>
									</div>
								)
							}

							{
								// Show loading spinner
								!increasedMiddleSize && isLoading && !isFailed && (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											justifyContent: "center",
											alignItems: "center",
											height: "50%",
										}}
									>
										<CircularProgress />
										<Typography style={{ marginTop: 10 }}>
											{loadingMsg}
										</Typography>
									</div>
								)
							}

							<div
								style={{ width: "100%" }}
								id="midscreencolorchangediv"
							>
								{!increasedMiddleSize && !isFailed && [
									// Pinned missions should be at the top
									// ...allMissions
									// 	.filter((mission) => mission.pinned)
									// 	.filter((m) => MissionFilter(m, search))
									// 	.map((mission) => (
									// 		<OneMission
									// 			key={mission.id}
									// 			mission={mission}
									// 			onMissionChange={(mission) => {
									// 				console.log(
									// 					"Mission changed"
									// 				);
									// 				updateOneMission(mission);
									// 			}}
									// 			index={mission.id}
									// 			exp={selected == mission.id}
									// 			onClicked={(_, mis) => {
									// 				if (selected == mis.id)
									// 					setSelected(-1);
									// 				else setSelected(mis.id);
									// 			}}
									// 		/>
									// 	)),

									// All other missions
									...incoming_missions										
										.map((mission) => (
											<OneMission
												key={mission.id}
												mission={mission}
												onMissionChange={(mission) => {
													console.log(
														"Mission changed"
													);
													// updateOneMission(mission);
												}}
												index={mission.id}
												exp={selected == mission.id}
												onClicked={(_, mis) => {
													if (selected == mis.id)
														setSelected(-1);
													else setSelected(mis.id);
												}}
											/>
										)),
								]}
							</div>

							<div style={{ marginBottom: 50 }}></div>

							{increasedMiddleSize && !isFailed && (
								<div
									style={{
										marginTop: 10,
										height: "calc(100% - 160px)",
										// overflowY: "auto",
									}}
								>
									<TableContainer component={Paper} style={{height: '100%'}}>
										<Table
											sx={{ minWidth: 650 }}
											aria-label="simple table"
											style={{ fontFamily: "EuclidCircularA-Regular" }}
										>
											<TableHead>
												<TableRow>
													<TableCell>
														<b>CLIENT</b>
													</TableCell>
													<TableCell align="right">
														<b>TIME</b>
													</TableCell>
													<TableCell align="right">
														<b>PICKUP</b>
													</TableCell>
													<TableCell align="right">
														<b>DROPOFF</b>
													</TableCell>
													<TableCell align="right">
														<b>DRIVER</b>
													</TableCell>
													<TableCell align="right">
														<b>STATUS</b>
													</TableCell>
													<TableCell align="right">
														<b>VEHICULE</b>
													</TableCell>
												</TableRow>
											</TableHead>

											<TableBody
												style={{
													height: "90%",
													overflow: 'auto'
												}}
											>
												{allMissions
													.filter(m => m != null)
													.filter(m => JSON.stringify(m).toLowerCase().indexOf(search.toLowerCase()) != -1)
													.sort((a, b) => {
														const a_date = new Date(new Date().toISOString().substring(0, 10) + "T" + a.arrival.estimated)
														const b_date = new Date(new Date().toISOString().substring(0, 10) + "T" + b.arrival.estimated)

														return a_date.getTime() - b_date.getTime()
													})
													.map((row, idx) => (
														<TableRow
															key={idx}
															sx={{
																"&:last-child td, &:last-child th":
																	{ border: 0 },
															}}
															style={{
																backgroundColor:
																	idx % 2 == 0
																		? "#f0f0f0"
																		: "white",
															}}
														>
															<TableCell
																component="th"
																scope="row"
															>
																{row.passenger}
															</TableCell>
															<TableCell align="right">
																{
																	row.arrival
																		.estimated
																}
															</TableCell>
															<TableCell align="right">
																{row.locations.from}
															</TableCell>
															<TableCell align="right">
																{row.locations.to}
															</TableCell>
															<TableCell align="right">
																{row.chauffeur_name}
															</TableCell>
															<TableCell align="right">
																{
																	row.arrival
																		.remaining
																}
															</TableCell>
															<TableCell align="right">
																{row.license_plate}
															</TableCell>
														</TableRow>
													))}
											</TableBody>
										</Table>
									</TableContainer>
								</div>
							)}
						</div>
						<div className="vertical-right" style={{ color: 'white' }}>
							<Wrapper
								apiKey={
									"AIzaSyC3xc8_oSX0dt2GENFpNnmzIFtn2IlfaCs"
								}
								libraries={["geometry", "core", "maps"]}
							>
								<MapEx>
									{
										incoming_missions
											.map((m, index) => (
												<CarLocEx
													showPath={m.id == selected}
													missionData={m}
													missionLastKnownPosition={null}
												/>
											))
									}
								</MapEx>
								{/* <OverMapInformations /> */}
							</Wrapper>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export type LastKnownPositionInfo = {
	lat: number;
	lng: number;
	date: Date;
} | null;

export default App;
