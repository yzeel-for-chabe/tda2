import "./App.css";

import { Wrapper } from "@googlemaps/react-wrapper";
import { Map } from "./Components/Map";
import { CarLoc } from "./Components/CarLoc/CarLoc";
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
import { useEffect, useState } from "react";
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
			return accessTokenResponse.accessToken;
		});
}

export type MissionT = {
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

function waynium_to_missiont(w: any): MissionT {

	console.log({w})

	return {
		id: w.MIS_ID,
		passenger: "",
		tags: [],
		arrival: {
			estimated: "",
			remaining: "",
		},
		pinned: false,
		locations: {
			from: "",
			to: "",
		},
		chauffeur_name: "a",
		chauffeur_phone: "",
		car_brand: "",
		license_plate: "",
	}
}

function MissionFilter(mission: MissionT, search: string) {
	if (search === "") {
		return true;
	}

	const fulltext = JSON.stringify(mission).toLowerCase();
	return fulltext.includes(search.toLowerCase());
}

const fake_missions = true
	// && (process.env.DISABLE_AUTH_FOR_NONLOCAL == 'true')
	&& (window.location.hostname.indexOf('localhost') == -1) // If NOT localhost

	const base_api_url = (window.location.hostname.indexOf('localhost') != -1) ? "http://localhost:3001/api/" : '/api/'


export function App() {
	const [search, setSearch] = useState<string>("");


	// const [tab, setTab] = useUrlState<string>('tab', 'tab_missions_to_hotel', validate_url_tab)
	const [increasedMiddleSize, setIncreasedMiddleSize] = useUrlState<boolean>(
		"all_missions",
		false,
		validate_url_size
	);


	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [loadingMsg, setLoadingMsg] = useState<string>("Authentification ...");
	const reload_countdown = useCountdown(60 * 60, 1000, ()=>{ window.location.reload() }); // Reload the page after 1 hour ?

	const [selected, setSelected] = useState(-1)

	const [allMissions, setAllMissions] = useState<MissionT[]>(
		Array.from({ length: (fake_missions ? 10 : 0) }, (_, i) => ({
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

	const calculate_increased_middle_size = () => {
		const viewport_width = Math.max(
			document.documentElement.clientWidth || 0,
			window.innerWidth || 0
		);
		if (viewport_width < 800) {
			return "100%";
		}

		return "calc(100% - 500px)";
	};

	const { instance } = useMsal();

	useEffect(() => {

		reload_countdown.start()

		if (fake_missions) return;

		(async () => {
			const baseurl =
				"https://chabe-int-ca-api-habilitations.orangepond-bbd114b2.francecentral.azurecontainerapps.io";

			const accessToken = await getAccessToken(instance);
			const response = await fetch(baseurl + "/api/v1/auth/me/adb2c", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}).then(e => e.text())

			setLoadingMsg("Checking authorizations")

			const hab = Habilitation.parseHabilitationResponse(response);
			let client_ids = [hab.cliId, hab.subAccounts.map(a => a.cliId)]

			setLoadingMsg("Retrieving mission informations");

			const client_ids_string = client_ids.join(',').substring(1, client_ids.join(',').length - 1)
			console.log(client_ids_string)

			setLoadingMsg("Retrieving mission informations for clients " + client_ids_string);

			const url = 'missions/clients/' + client_ids_string;
			const missions = await (fetch(base_api_url + url).then((e) => e.json()));

			setAllMissions(missions.map(waynium_to_missiont));
			setLoadingMsg("Done");
			setIsLoading(false);

		})();

		return () => {
			reload_countdown.pause()
			reload_countdown.reset()
		}

	}, [instance]);

	const [showAcc, setShowAcc] = useState(false)

	return (
		<>
			<div className="page">
				<nav id="navbar" className="navbar-chabe">
					<menu>
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
						<li>
							<a
								id="nav-passenger"
								className="nav-link"
								href="/passenger"
							>
								<img
									src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/passenger-icon.c910ce52b2c01a277e279004e67c770e.svg"
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
							<li>
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
							</li>
							<li>
								<div
									className="account-menu"
									data-testid="account-menu"
								>
									<div
										className="MuiAvatar-root MuiAvatar-circular MuiAvatar-colorDefault account-avatar css-7yrfzp"
										id="btn-account-menu"
										data-testid="btn-account-menu"
									>
										MV
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
												marginBottom: 10
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
													<Switch checked={showAcc} onChange={(_, v) => setShowAcc(v)} />
												}
												label="Afficher les accueils"
											/>
										</div>
									</FormGroup>
								</h1>
								
							</div>

							{
								// No mission
								!increasedMiddleSize && allMissions.length == 0 && (
									<div style={{
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
										alignItems: "center",
										height: "50%",
									}}>
										<Typography style={{ marginTop: 10, textAlign: 'center' }}>
											Aucune mission prévue pour les 45 prochaines minutes
											<div style={{marginTop: 10}}></div>
											<Button
											variant='contained'
											onClick={() => {
												setIncreasedMiddleSize(true)
											}}>
												Afficher toutes les missions
											</Button>

											<Button
											
											onClick={() => {
												window.location.reload()
											}}>
												Actualiser la page ({reload_countdown.value}s)
											</Button>
										</Typography>
									</div>
								)
							}
							
							{
								// Show loading spinner
								!increasedMiddleSize && isLoading && (
									<div style={{
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
										alignItems: "center",
										height: "50%",
									}}>
										<CircularProgress />
										<Typography style={{ marginTop: 10 }}>
											{loadingMsg}
										</Typography>
									</div>
								)
							}


<div style={{width: '100%'}} id={showAcc ? 'midscreencolorchangediv' : ''}>
							{!increasedMiddleSize && [
								// Pinned missions should be at the top
								...allMissions
									.filter((mission) => mission.pinned)
									.filter((m) => MissionFilter(m, search))
									.map((mission) => (
										<OneMission
											key={mission.id}
											mission={mission}
											onMissionChange={(mission) => {
												console.log("Mission changed");
												updateOneMission(mission);
											}}
											index={mission.id}
											exp={selected == mission.id}
											onClicked={(_, mis) => {
												if (selected == mis.id) setSelected(-1)
												else setSelected(mis.id)
											}}
										/>
									)),

								// All other missions
								...allMissions
									.filter((mission) => !mission.pinned)
									.filter((m) => MissionFilter(m, search))
									.map((mission) => (
										<OneMission
											key={mission.id}
											mission={mission}
											onMissionChange={(mission) => {
												console.log("Mission changed");
												updateOneMission(mission);
											}}
											index={mission.id}
											exp={selected == mission.id}
											onClicked={(_, mis) => {
												if (selected == mis.id) setSelected(-1)
												else setSelected(mis.id)
											}}
										/>
									)),
							]}
							</div>

							<div style={{ marginBottom: 50 }}></div>

							{increasedMiddleSize && (
								<div
									style={{
										marginTop: 10,
										height: "calc(100% - 10px)",
										overflowY: "scroll",
									}}
								>
									<TableContainer component={Paper}>
										<Table
											stickyHeader
											sx={{ minWidth: 650 }}
											aria-label="simple table"
										>
											<TableHead>
												<TableRow>
													<TableCell>
														Client
													</TableCell>
													<TableCell align="right">
														Time
													</TableCell>
													<TableCell align="right">
														Pickup
													</TableCell>
													<TableCell align="right">
														Dropoff
													</TableCell>
													<TableCell align="right">
														Driver
													</TableCell>
													<TableCell align="right">
														Status
													</TableCell>
													<TableCell align="right">
														Km
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{allMissions.map((row) => (
													<TableRow
														key={row.passenger}
														sx={{
															"&:last-child td, &:last-child th":
																{ border: 0 },
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
						<div className="vertical-right">
							<Wrapper
								apiKey={
									"AIzaSyC3xc8_oSX0dt2GENFpNnmzIFtn2IlfaCs"
								}
								libraries={["geometry", "core", "maps"]}
							>
								<Map>
									<CarLoc
										position={{ lat: 48.8534, lng: 2.3488 }}
									/>
								</Map>
								{/* <OverMapInformations /> */}
							</Wrapper>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default App;
