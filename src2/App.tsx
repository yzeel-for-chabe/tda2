import "./App.css";

import I18 from './i18n'

import { CarTwoTone } from "@ant-design/icons";
import {
	Button,
	CircularProgress,
	FormControlLabel,
	FormGroup,
	Input,
	Menu,
	MenuItem,
	Paper,
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
import { IPublicClientApplication } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { Habilitation } from "./Habilitation";
import * as authconfig from "./authConfig";
import { CarLocationManager, CarLocationManagerC, MissionInfo } from "./core/CarLocationManager/manager";
import { Wrapper } from "@googlemaps/react-wrapper";
import { CarLocEx } from "./Components/CarLoc/CarLocEx";
import { MapEx } from "./Components/MapEx";
import { InfoMissionsDialog } from "./Components/InfoMissionsDialog";
import { parseStatusFromRequest } from "./core/bluesoft";
import { OverMapInformations } from "./Components/OverMapInformations";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import MenuDivider from "antd/es/menu/MenuDivider";
import useConfig from "antd/es/config-provider/hooks/useConfig";
import { Switch } from "antd"
import { useBusinessSearch } from "./Hooks/useBusinessSearch";
import { WGetFirstLastLoc } from "./core/waynium";
import { t } from "i18next";

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
	info: string;
	debug: string;
	passenger: string;
	acc: boolean; // Is accueil
	tags: string[];
	arrival: {
		estimated: string;
		remaining: string;
	};
	pinned: boolean;
	locations: {
		from: string;
		to: string;
		cur: { lat: number; lng: number } | null;
	};
	chauffeur_name: string;
	chauffeur_phone: string;
	car_brand: string;
	license_plate: string;
};

function waynium_to_missiont(w: any, m: CarLocationManagerC, e: MissionInfo): MissionT | null {
	// console.log({ w });

	const get_name = (w: any) => {
		const p1 = w.C_Gen_Presence[0]?.C_Gen_Passager || { PAS_PRENOM: '', PAS_NOM: '' };

		const fname = ((p1.PAS_PRENOM || "") as string).trim()
		const lname = ((p1.PAS_NOM || "") as string).trim()

		if (fname == "" && lname == "") {
			return '??';
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

		return `${hours}h ${mins}min`;
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

		const mis_to_text = (wmis: any): string => {
			return wmis.LIE_LIBELLE || wmis.LIE_FORMATED
		}

		const wlocs = WGetFirstLastLoc(w)


		return {

			w: w,

			id: w.MIS_ID,
			passenger: get_name(w),
			tags: [],
			info: m.missions.find(m => m.w.MIS_ID == w.MIS_ID)?.information || "",
			debug: m.missions.find(m => m.w.MIS_ID == w.MIS_ID)?.debug || "",
			arrival: {
				estimated: eastr,
				remaining: "LOL",//ms_to_hm(ea.getTime() - new Date().getTime()).toString(),
			},
			pinned: false,
			locations: {
				cur: m.GetLocation(w.MIS_ID),
				from: mis_to_text(wlocs.startLoc),
				to: mis_to_text(wlocs.endLoc),
			},
			chauffeur_name: cgenchu.CHU_PRENOM + " " + cgenchu.CHU_NOM.toUpperCase(),
			chauffeur_phone: cgenchu.CHU_TEL_MOBILE_1,
			car_brand: cgenvoi.VOI_MODELE,
			license_plate: cgenvoi.VOI_LIBELLE,

			acc: e.acc
		};
	} catch (e) {

		return null;
	}
}

export function App() {

	const t = I18.t;
	const cfg = useConfig();

	const [disconnectOpen, setDisconnectOpen] = useState(false);
	const disconnectBtnRef = useRef<HTMLDivElement>(null);

	// const [tab, setTab] = useUrlState<string>('tab', 'tab_missions_to_hotel', validate_url_tab)
	const [increasedMiddleSize, setIncreasedMiddleSize] = useUrlState<boolean>(
		"all_missions",
		false,
		validate_url_size
	);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [loadingMsg, setLoadingMsg] = useState<string>(
		t("loading")
	);

	const [isFailed, setIsFailed] = useState<boolean>(false);

	const [selected, setSelected] = useState(-1);

	const { instance } = useMsal();
	const token = useRef<any>(null)

	useEffect(() => {
		CarLocationManager.start();
		return () => CarLocationManager.destroy()
	}, [])

	const [allMissions, setAllMissions] = useState<MissionT[]>([]);

	const { search, setSearch, filteredData } = useBusinessSearch(allMissions);

	const Refresh = async () => {

		setAllMissions(CarLocationManager.missions.map(e => waynium_to_missiont(
			e.w, CarLocationManager, e
		)).filter(e => e != null))

		console.log("RM - Refreshing missions");
		await CarLocationManager.Refresh()
		console.log("RM - Refreshed missions");

		setAllMissions(CarLocationManager.missions.map(e => waynium_to_missiont(
			e.w, CarLocationManager, e
		)).filter(e => e != null))

		console.log("RM - Miscount=", CarLocationManager.missions.length)
		console.log("RM - Locations=", CarLocationManager.locations)

		setIsLoading(false);
	}

	useEffect(() => {
		(async () => {
			const baseurl =
				"https://chabe-int-ca-api-habilitations.orangepond-bbd114b2.francecentral.azurecontainerapps.io";

			setLoadingMsg(t("loadingClients"));

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
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}).then((e) => e.text());

			setLoadingMsg(t("checkingAuth"));

			const hab = Habilitation.parseHabilitationResponse(response);

			setLoadingMsg(t("initializing"));

			const lang = hab.subAccounts[0].dispatch == "chabe" ? "fr" : "en";
			i18next.changeLanguage(lang);

			await CarLocationManager.Initialize(hab.subAccounts.map(e => ({
				limo: e.dispatch,
				name: "" + e.cliId
			})))

			setLoadingMsg("Done !");
			Refresh();

			setIsLoading(false);

			setTimeout(() => {
				CarLocationManager.Refresh(true).then(() => {
					setAllMissions(CarLocationManager.missions.map(e => waynium_to_missiont(
						e.w, CarLocationManager, e
					)).filter(e => e != null))
				})
			}, 4000)

		})();

	}, [instance, t]);

	useEffect(() => {
		const interval = setInterval(() => {
			setAllMissions(CarLocationManager.missions.map(e => waynium_to_missiont(
				e.w, CarLocationManager, e
			)).filter(e => e != null))
		}, 10_000);

		return () => clearInterval(interval);
	}, [])

	const [showAcc, setShowAcc] = useState(false);
	const [showClosed, setShowClosed] = useState(false);

	const incoming_missions = allMissions
		.filter(m => (showAcc && m.acc) || !m.acc)
	// .filter(m => m != null)
	// .filter((mission) => !mission.pinned)
	// .filter((m) => MissionFilter(m, search))
	// .filter((m) => showAcc ? true : m.w.MIS_SMI_ID != "7")
	// .filter(e => (
	// 	remaining_str_to_minutes(e.arrival.remaining) < 45
	// 	&& remaining_str_to_minutes(e.arrival.remaining) > 0
	// ))

	const [isFollowing, setIsFollowing] = useState(true);

	return (
		<>
			<div className="page">
				<nav id="navbar" className="navbar-chabe">
					<menu>
						<li style={{ display: "none" }}>
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
						<li style={{ display: "none" }}>
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
								id="nav-tda"
								className="nav-link is-active"
								href="/"
								aria-current="page"
								style={{
									backgroundColor: "#001c40",
									color: "white",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<CarTwoTone size={40} />
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
									onMouseOver={() => setDisconnectOpen(true)}
									style={{
										cursor: 'pointer', padding: 5, aspectRatio: '1/1',
										display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%',
										color: 'white'
									}}
								>
									<div
										ref={disconnectBtnRef}
										className="MuiAvatar-root MuiAvatar-circular MuiAvatar-colorDefault account-avatar css-7yrfzp"
										id="btn-account-menu"
										data-testid="btn-account-menu"
										title={token?.current?.account?.name || "Aucun nom"}
									>
										{token?.current?.account?.idTokenClaims?.given_name?.[0] || ""}
										{token?.current?.account?.idTokenClaims?.family_name?.[0] || ""}
									</div>
								</div>
								<Menu
									open={disconnectOpen}
									anchorEl={disconnectBtnRef.current}
									onClose={() => setDisconnectOpen(false)}
								>
									<MenuItem
										onClick={() => {
											i18next.changeLanguage("fr");
											document.title = "Chabé | Tableau des arrivées";
											setDisconnectOpen(false);
										}}
									>
										FR
									</MenuItem>
									<MenuItem
										onClick={() => {
											i18next.changeLanguage("en");
											document.title = "Chabé | Arrival Board";
											setDisconnectOpen(false);
										}}
									>
										EN
									</MenuItem>
									{/* <MenuDivider /> */}
									<MenuItem onClick={() => {
										instance.logout({
											postLogoutRedirectUri: "/",
											account: null,
										})
										// document.location.href = "/"
									}}>{t("logout")}</MenuItem>
								</Menu>
							</li>
						</div>
					</div>
					{/* End of Header */}

					<div
						style={{
							display: "flex",
							// height: "100%",
							// width: "100%",
							position: "absolute",
							left: 56,
							right: 0,
							top: 80,
							bottom: 0
						}}
					>
						<div
							className="vertical-middle"
							style={{
								width: increasedMiddleSize
									? "100%"
									: undefined,
								transition: "width 0.5s",
							}}
						>
							<div className="midtitle">
								<div style={{ marginBottom: 10 }}>
									<ToggleButton
										className="toggle-button"
										value="check"
										title={increasedMiddleSize
											? t("showImminentArrivals")
											: t("showAllMissions")}
										selected={increasedMiddleSize}
										onChange={() =>
											setIncreasedMiddleSize(
												!increasedMiddleSize
											)
										}
										style={{
											marginTop: 10,
											transition: "* 0.5s",
											fontFamily: "EuclidCircularA-Semibold",

											borderRadius: 0,
											backgroundColor: "#001c40",
											color: 'white'
										}}
									>
										{increasedMiddleSize
											? t("showImminentArrivals")
											: t("showAllMissions")}
									</ToggleButton>
								</div>
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
										? t("allMissions")
										: t("imminentArrivals")}
									<br />
									<FormGroup>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												marginBottom: 10,
											}}
										>

											{
												increasedMiddleSize && (
													<>
														<Input
															style={{ flex: 1 }}
															placeholder={t("search")}
															value={search}
															onChange={(e) =>
																setSearch(e.target.value)
															}
														/>
														<FormControlLabel
															control={
																<Switch
																	defaultChecked={showAcc}
																	onChange={(e) =>
																		setShowAcc(e)
																	}
																/>
															}
															label={t("showGreetings")}
														/>
														<FormControlLabel
															control={
																<Switch
																	checked={showClosed}
																	onChange={(e, v) =>
																		setShowClosed(e)
																	}
																/>
															}
															label={t("showCompletedMissions")}
														/>
													</>
												)
											}
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
										{t("connectionError")}
										<br />
										<br />
										{t("apologize")}
										<br />
										<div style={{ marginTop: 10 }}></div>
										<Button
											variant="contained"
											onClick={() => {
												window.location.reload();
											}}
										>
											{t("refreshPage")}
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
											{t("loadingMissions")}
											<InfoMissionsDialog />

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
												{t("refreshPage")}
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
												}} isSelected={false} />
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
									<TableContainer component={Paper} style={{ overflowY: 'visible' }}>
										<Table
											sx={{ minWidth: 650 }}
											aria-label="simple table"
											style={{ fontFamily: "EuclidCircularA-Regular" }}
										>
											<TableHead
												style={{
													boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.1)",
												}}
											>
												<TableRow>
													<TableCell>
														<b>{t("passenger")}</b>
													</TableCell>
													<TableCell align="left">
														<b>{t("time")}</b>
													</TableCell>
													<TableCell align="right">
														<b>{t("pickup")}</b>
													</TableCell>
													<TableCell align="right">
														<b>{t("dropoff")}</b>
													</TableCell>
													<TableCell align="right">
														<b>{t("vehicle")}</b>
													</TableCell>
													<TableCell align="right">
														<b>{t("driver")}</b>
													</TableCell>
													<TableCell align="right">
														<b>{t("status")}</b>
													</TableCell>

												</TableRow>
											</TableHead>

											<TableBody
												style={{
													maxHeight: "60vh",
													overflow: 'auto'
												}}
											>
												{filteredData
													.filter(m => {
														if (!showAcc && m.acc) return false;

														// If show closed is false, hide closed missions
														if (!showClosed && parseStatusFromRequest(m.w) == "closed") return false;

														// If show closed is true, hide open missions
														if (showClosed && parseStatusFromRequest(m.w) != "closed") return false;

														return true;
													})
													.sort((a, b) => {

														// If mission status is closed, put it at the end
														if (parseStatusFromRequest(a.w) == "closed") return 1;

														if (a.w.MIS_HEURE_DEBUT < b.w.MIS_HEURE_DEBUT) {
															return -1;
														}
														if (a.w.MIS_HEURE_DEBUT > b.w.MIS_HEURE_DEBUT) {
															return 1;
														}
														return 0;
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
																{row.passenger == "??" && t("unknownPassenger")}
																{row.passenger != "??" && row.passenger}
															</TableCell>
															<TableCell align="left">
																<div>
																	{(row.w.MIS_HEURE_DEBUT || "")?.substring(0, 5)}
																	-
																	{(row.w.MIS_HEURE_FIN || "")?.substring(0, 5)}
																</div>
															</TableCell>
															<TableCell align="right">
																{row.locations.from}
															</TableCell>
															<TableCell align="right">
																{row.locations.to}
															</TableCell>
															<TableCell align="right">

																{
																	row.acc ? "Accueil" : null
																}

																<div style={{ display: 'flex', flexDirection: 'column' }}>
																	<div>{row.car_brand}</div>
																	<div style={{ color: "gray" }}>{row.license_plate}</div>
																</div>
															</TableCell>
															<TableCell align="right">
																{row.chauffeur_name}
															</TableCell>
															<TableCell align="right">
																{/* {row.w.MIS_SMI_ID == "7" ? "Passager à bord" : "/"} */}
																{t(parseStatusFromRequest(row.w))}
															</TableCell>

														</TableRow>
													))}
											</TableBody>
										</Table>
									</TableContainer>
									<div style={{ height: 50 }}></div>
								</div>
							)}
						</div>
						<div className="vertical-right" style={{ color: 'white', height: '200', overflow: 'hidden' }}>
							<Wrapper
								apiKey={
									"AIzaSyDMZQ3-mM6E1c95TXCnuVmqB9xXwD-M_iY"
								}
								libraries={["geometry", "core", "maps"]}
							>
								{CarLocationManager.missions.length != 0 &&
									<MapEx
										center={{ lat: 48.8534, lng: 2.3488 }}
										ondragstart={() => {
											setIsFollowing(false);
										}}
									>
										{
											incoming_missions
												.map((m, index) => {

													const mis = CarLocationManager.missions.find(e => e.w.MIS_ID == m.id)
													const loc = CarLocationManager.GetLocation(mis?.w.MIS_ID || -1)

													return (
														<CarLocEx
															showPath={
																m.id == selected
															}
															missionData={m}
															missionLastKnownPosition={null}
															onCarClicked={() => {
																setSelected(m.id);
																setIsFollowing(true);
															}}
															following={isFollowing}
														/>
													)
												})
										}
									</MapEx>
								}
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
