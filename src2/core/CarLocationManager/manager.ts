import { ExtrapolFromLocAndTime } from "../CarLocationExtrapol";
import { Root, WGetFirstLastLoc } from "../waynium";
import { ClientInfo, LastReceivedLocationInfo, LocationInfo, MissionInfo } from "./types";
import { mstohuman } from "./utils";
import I18 from '../..//i18n'
import { Geo } from "../Geoloc";
import { isWMissionMeetGreet, isWMissionTimeBased } from "../../business/missionWCategories";

const t = I18.t.bind(I18)

export class CarLocationManagerC {
	public first_dispatch: string = ""
	private clients: ClientInfo[] = [];
	public missions: MissionInfo[] = [];
	public allmissions: MissionInfo[] = [];
	public locations: LocationInfo[] = [];
	public lastReceivedLocation: LastReceivedLocationInfo[] = [];
	public lastRefresh = new Date();
	private stop = true;

	public start() {
		this.stop = false;
		this.startNoStack.bind(this)();
	}

	public destroy() {
		this.stop = true;
	}

	private startNoStack() {
		if (this.stop) return;
		setTimeout(() => {
			this.Refresh.bind(this)().then(() => {
				this.startNoStack.bind(this)();
			});
		}, 1000);
	}

	public async Initialize(clients: ClientInfo[]) {
		if (clients.length !== 0) {
			this.clients = clients;
		} else {
			console.error("CarLocationManager: No clients provided");
		}

		this.Refresh(true);
	}

	public GetLocation(missionId: string) {
		const location = this.locations.find(l => l.missionId === missionId);
		if (location) {
			return location.location;
		} else {
			return null;
		}
	}

	public GetLastReceivedLocation(missionId: string) {
		const location = this.lastReceivedLocation.find(l => l.missionId === missionId);
		if (location) {
			return location;
		} else {
			return null;
		}
	}

	// TODO LOL ?

	public async Refresh(force = false) {
		if (!force && new Date().getTime() - this.lastRefresh.getTime() < 1000 * 10) {
			console.log("CarLocationManager: Refreshing too fast, skipping");
			return;
		}

		this.lastRefresh = new Date();

		let ms: MissionInfo[] = []

		try {
			ms = await this._getMissions()
		} catch (e) {
			return
		}

		if (ms.length == 0) { return; }

		this._mergeMissions(ms)
		this._cleanMissions();

		console.log("CarLocationManager =======================================")
		console.log("Total missions", this.missions.length);
		console.log("CarLocationManager =======================================")


		console.log("Remaining missions", this.missions.length);

		for (const mission of this.missions) {
			try {
				mission.debug = "yoX"

				if (mission.w.MIS_DATE_DEBUT == null || mission.w.MIS_HEURE_DEBUT == null) {
					mission.information = t('missingDate');
					continue;
				}

				const startdate = new Date(mission.w.MIS_DATE_DEBUT + "T" + mission.w.MIS_HEURE_DEBUT);
				const now = new Date();

				const start_in_minutes = Math.floor((startdate.getTime() - now.getTime()) / 1000 / 60);

				if (start_in_minutes >= 0) {
					mission.information = t('comingMission');
					continue;
				}

				console.log("Processing mission", mission.w.MIS_ID, "in", start_in_minutes, "minutes");
				console.log("Chauffeur=" + (mission.w.C_Gen_Chauffeur?.CHU_NOM || "N/A"))

				const { startLoc, endLoc } = WGetFirstLastLoc(mission.w);

				if (JSON.stringify(endLoc).indexOf("DIC_LIEU_A_DEFINIR") !== -1) {
					mission.information = t('arrivalPlaceUndefined');
				}

				await this._update_geolocation_information(mission);
			} catch (e) {
				console.error("CarLocationManager: Error while processing mission", mission.w.MIS_ID);
			}
		}
	}

	private async _getMissions(): Promise<MissionInfo[]> {

		let data: Root[] = [];

		try {
			const req = this?.clients.map(c => `${c.limo}_${c.name}`).join(",");
			const res = await fetch(`https://rct.tda2.chabe.com/api/missions/clients/${req}`)
			if (!res.ok) return []
			const r = await res.text()
			data = JSON.parse(r) as Root[];
			this.first_dispatch = this?.clients[0]?.limo || ""
		} catch (e) {
			console.warn("CarLocationManager: Error while fetching missions", e);
			return [];
		}


		// Transport (mad) for chabelimited
		// UK 2 10 19 9 14 11 12 6 20

		return data.map((d) => ({
			w: d,
			acc: isWMissionMeetGreet(d.MIS_TSE_ID, this.first_dispatch),
			// (this.first_dispatch == 'chabe' && (d.MIS_TSE_ID == "12" || d.MIS_TSE_ID == "51"))
			// || (this.first_dispatch == 'chabelimited' && (d.MIS_TSE_ID == ""))
			// ,
			mad: isWMissionTimeBased(d.MIS_TSE_ID, this.first_dispatch),
			// ((this.first_dispatch == 'chabe') && (d.MIS_TSE_ID == "3" || d.MIS_TSE_ID == "22" || d.MIS_TSE_ID == "54" || d.MIS_TSE_ID == "4"))
			// ||((this.first_dispatch == 'chabelimited' && (d.MIS_TSE_ID == "2" || d.MIS_TSE_ID == "10" || d.MIS_TSE_ID == "19" || d.MIS_TSE_ID == "9" || d.MIS_TSE_ID == "14" || d.MIS_TSE_ID == "11" || d.MIS_TSE_ID == "12" || d.MIS_TSE_ID == "6" || d.MIS_TSE_ID == "20"))),
		} as MissionInfo));
	}

	private async _mergeMissions(missions: MissionInfo[]) {
		const newlist = missions;
		const oldlist = this.missions;

		const newlist2 = newlist.map(m => {
			const old = oldlist.find(o => o.w.MIS_ID === m.w.MIS_ID);

			if (!old) return m;

			return {
				...m,
				information: old.information,
				refresh_after: old.refresh_after,
				cache_polylines: old.cache_polylines,
				debug: old.debug,
				do_not_compute: old.do_not_compute || false,
				remainingStr: old.remainingStr,
				acc: old.acc,
				mad: old.mad
			}
		})

		this.missions = newlist2;
	}

	private async _update_geolocation_information(mission: MissionInfo) {
		if (mission.do_not_compute) {
			mission.debug = "do_not_compute";
			return;
		}

		if (mission.acc) {
			mission.information = t('greeting');
			return;
		}

		console.log("CLM - Update geoloc for mission", mission.w.MIS_ID);

		const mission_id = mission.w.MIS_ID;
		const location = this.locations.find(l => l.missionId === mission_id);

		mission.debug = "yo"

		if (mission.information == "") {
			mission.information = t('noGeolocationData');
		}

		const { startLoc, endLoc } = WGetFirstLastLoc(mission.w);

		if (JSON.stringify(endLoc).indexOf("DIC_LIEU_A_DEFINIR") !== -1) {
			mission.information = t('arrivalPlaceUndefined');
		}

		if (mission.refresh_after && new Date() < mission.refresh_after) {
			mission.information += "!"
			return;
		}

		const res = await fetch(`https://rct.tda2.chabe.com/api/getProbableLocationForMission/${mission.w.MIS_ID}/date/a`);
		const data = await res.json() as Geo;

		mission.debug = "testX"

		if (data.result.length == 0) {

			if (mission.mad) {
				mission.information = t('transportNoGeolocation');
				return;
			}

			const startplace = startLoc;
			const endplace = endLoc;

			if (!startplace || !endplace || !startplace.LIE_LAT || !startplace.LIE_LNG || !endplace.LIE_LAT || !endplace.LIE_LNG) {
				mission.information = t('notEnoughData');
				mission.debug = "notenoughdata";
				return;
			}

			this.missions.find(m => m.w.MIS_ID === mission.w.MIS_ID)!.information = t('noDataYet');
			const startdate = new Date(mission.w.MIS_DATE_DEBUT + "T" + mission.w.MIS_HEURE_DEBUT);

			try {
				const extp = await ExtrapolFromLocAndTime(
					{ lat: Number.parseFloat(startplace.LIE_LAT), lng: Number.parseFloat(startplace.LIE_LNG) },
					{ lat: Number.parseFloat(endplace.LIE_LAT), lng: Number.parseFloat(endplace.LIE_LNG) },
					startdate
				)

				mission.remainingStr = extp.remainingTime / 1000 / 60

				mission.information = extp.polylines.length > 1
					? t('fullExtrapolation')
					: t('unknown')

				const error_zero = JSON.stringify(extp).includes("ZERO_RESULTS");
				if (error_zero) {
					mission.information = t('impossiblePath');
					return;
				}

				mission.cache_polylines = extp.polylines;
				mission.debug = "extrapolated<br />";

				this.locations = this.locations.filter(l => l.missionId !== mission.w.MIS_ID);
				this.locations.push({
					missionId: mission.w.MIS_ID,
					lastRefresh: new Date(),
					location: {
						lng: extp.loc_within_poly.pos.lng,
						lat: extp.loc_within_poly.pos.lat
					}
				});

			} catch (e) {
				console.error("CarLocationManager: Error while extrapolating", e);
				mission.information = t('unknownRouteToDestination');
				mission.debug = "err^=" + e.message;
			}
		} else {
			// Mission probable location not empty

			this.lastReceivedLocation = this.lastReceivedLocation.filter(l => l.missionId !== mission.w.MIS_ID);
			this.lastReceivedLocation.push({
				missionId: mission.w.MIS_ID,
				lng: data.probable_location.location.lon,
				lat: data.probable_location.location.lat,
				time: new Date(data.probable_location.candidates[0].date)
			})

			if (mission.mad) {
				mission.information = t('transportLastGeolocation') + " " + new Date(data.probable_location.candidates[0].date).toLocaleTimeString().substring(0, 5).replace(":", 'h');
				this.locations = this.locations.filter(l => l.missionId !== mission.w.MIS_ID);
				this.locations.push({
					missionId: mission.w.MIS_ID,
					lastRefresh: new Date(),
					location: {
						lng: data.probable_location.location.lon,
						lat: data.probable_location.location.lat
					}
				});
				return;
			}

			mission.debug += "data from elastic<br />"

			const p = data.probable_location.location;
			const time = new Date(data.probable_location.candidates[0].date);
			const now = new Date();

			mission.debug = mission.w.MIS_ID + " elastic last date time: " + time.toLocaleTimeString() + "<br />";

			const startplace = startLoc;
			const endplace = endLoc;
			if (startplace.LIE_LAT == endplace.LIE_LAT && startplace.LIE_LNG == endplace.LIE_LNG) {
				this.locations = this.locations.filter(l => l.missionId !== mission.w.MIS_ID);
				this.locations.push({
					missionId: mission.w.MIS_ID,
					lastRefresh: new Date(),
					lastRealData: time,
					location: {
						lng: p.lon,
						lat: p.lat
					}
				});

				mission.information = t('unknownRouteToDestination')

				return;
			};

			const young_enough_no_need_extrapolate = (now.getTime() - time.getTime()) < 5 * 60 * 1000;

			if (!young_enough_no_need_extrapolate) {
				mission.information = t('calculatingExtrapolatedPosition');

				const last_known_location = data.probable_location.location;
				const last_known_time = new Date(data.probable_location.candidates[0].date);

				const arr = endLoc;
				const arr_loc = {
					lat: parseFloat(arr.LIE_LAT),
					lng: parseFloat(arr.LIE_LNG)
				}

				const lines = await ExtrapolFromLocAndTime(
					{ lat: last_known_location.lat, lng: last_known_location.lon },
					arr_loc,
					last_known_time
				)

				if (lines instanceof Error) {
					mission.information = t('unknownRouteToDestination');
					return;
				}

				mission.remainingStr = (lines.remainingTime / 60 / 1000) + ""

				const error_zero = JSON.stringify(lines).includes("ZERO_RESULTS");
				if (error_zero) {
					mission.information = t('impossiblePath');
					return;
				}

				// mission.cache_polylines = lines.polylines;
				mission.information = t('extrapolatedLastPosition') + " " + last_known_time.toLocaleTimeString().substring(0, 5);
				mission.debug = "geoloc time=" + last_known_time.toLocaleTimeString() + "<br />";
				mission.debug += "T=" + lines.totalTime + "<br />";
				mission.debug += "R=" + lines.remainingTime + "<br />";

				const loc_within_poly = lines.loc_within_poly;

				this.locations = this.locations.filter(l => l.missionId !== mission.w.MIS_ID);
				this.locations.push({
					missionId: mission.w.MIS_ID,
					lastRefresh: new Date(),
					location: {
						lng: loc_within_poly.pos.lng,
						lat: loc_within_poly.pos.lat
					}
				});

			} else {
				console.log("good")
				mission.information = t('upToDatePosition') + " (" + time.toLocaleTimeString().substring(0, 5).replace(':', 'h') + ")";

				// Still extrapol to get time

				const startplace = p;
				const endplace = endLoc;
				const startdate = time;

				const extp = await ExtrapolFromLocAndTime(
					{ lat: startplace.lat, lng: startplace.lon },
					{ lat: parseFloat(endplace.LIE_LAT), lng: parseFloat(endplace.LIE_LNG) },
					startdate
				)

				if (extp instanceof Error) {
					mission.information = "Impossible de charger les informations";
					return;
				}

				mission.remainingStr = ((extp.remainingTime) / 60 / 1000) + ""

				this.locations = this.locations.filter(l => l.missionId !== mission.w.MIS_ID);
				this.locations.push({
					missionId: mission.w.MIS_ID,
					lastRefresh: new Date(),
					lastRealData: new Date(time),
					location: {
						lng: p.lon,
						lat: p.lat
					}
				});
			}
		}
	}

	public _cleanMissions() {
		const num_missions = this.missions.length + 0;

		// this.missions = this.missions
		// 	.filter(m => {
		// 		const startdate = new Date(m.w.MIS_DATE_DEBUT + "T" + m.w.MIS_HEURE_DEBUT);
		// 		const now = new Date();
		// 		return Math.floor((startdate.getTime() - now.getTime()) / 1000 / 60) < 20;
		// 	});

		this.missions.forEach(m => {
			if (m.w.MIS_DATE_DEBUT == null || m.w.MIS_HEURE_DEBUT == null) {
				m.do_not_compute = true;
			}
		});

		this.allmissions = [...this.missions];


		this.missions.forEach(m => {
			const enddate = new Date(m.w.MIS_DATE_DEBUT + "T" + m.w.MIS_HEURE_FIN);
			const now = new Date();
			if (Math.floor((now.getTime() - enddate.getTime()) / 1000 / 60) > 60) {
				m.debug = "ended";
				m.do_not_compute = true;
			}
		})

		// this.missions = this.missions
		// 	.filter(m => m.w.MIS_SMI_ID !== "7")
		// 	.filter(m => m.w.MIS_SMI_ID !== "13")
		// 	.filter(m => m.w.MIS_SMI_ID !== "21")

		for (let i = 0; i < this.missions.length; i++) {
			if (
				this.missions[i].w.MIS_SMI_ID == "7"
				|| this.missions[i].w.MIS_SMI_ID == "13"
				|| this.missions[i].w.MIS_SMI_ID == "21"
			) {
				this.missions[i].do_not_compute = true;
			}
		}

		console.log("Removing missions with MIS_ETAT != 1", this.missions.filter(m => m.w.MIS_ETAT != "1").length)
		this.missions = this.missions.filter(m => m.w.MIS_ETAT == "1");

		// this.missions.forEach(m => {
		// 	if (m.w.MIS_HEURE_REEL_FIN != null) {
		// 		m.do_not_compute = true;
		// 	}
		// });

		this.missions.forEach(m => {
			m.w.C_Gen_EtapePresence = m.w.C_Gen_EtapePresence.sort((a, b) => a.EPR_TRI - b.EPR_TRI);
		})

		console.log("CarLocationManager: Cleaned", num_missions - this.missions.length, "missions");
	}
}

export const CarLocationManager = new CarLocationManagerC();
