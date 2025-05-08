import { ArrowForward } from "@mui/icons-material";
import {
	Accordion,
	AccordionSummary,
	Typography,
	AccordionDetails,
	Skeleton,
} from "@mui/material";
import { DriverName } from "./MissionPanel/DriverName";
import { LicencePlate } from "./MissionPanel/LicencePlate";
import { MissionT } from "../App";
import I18 from "../i18n";

import arrowDown from "../../public/arrowBottom.svg";
import { CarLocationManager } from "../core/CarLocationManager";
import { isWMissionTimeBased } from "../business/missionWCategories";
import { WGetFirstLastLoc } from "../core/waynium";
import { haversineDistance } from "../core/utils/maps/harvesine";
import { parseStatusFromRequest } from "../core/bluesoft";
const t = I18.t.bind(I18)


const shortName = (name: string, maxLen = 20) => {

	if (!name) return "";

	if (name.length <= maxLen) {
		return name;
	}

	return name.slice(0, maxLen) + "...";
};

export const OneMission = (props: {
	mission: MissionT;
	onMissionChange: (mission: MissionT) => void;
	exp: boolean;
	index: number;
	onClicked: (index: number, mission: MissionT) => void;
	isSelected: boolean; // New prop
}) => {

	try {
		if(!props) return null;
		if(!props.mission.w.MIS_HEURE_DEBUT) return null;
	
		const exp = props.exp || props.isSelected; // Use the new prop
	
		const additionalcss = props.exp ? { filter: "none" } : {};
	
		const arrival_estimated = props.mission.w.MIS_DATE_DEBUT + 'T' + props.mission.w.MIS_HEURE_FIN;
		const date_ae = new Date(arrival_estimated);
		const date_now = new Date();
	
	
		if (props.mission.debug == 'do_not_compute') {
			return null;
		}
	
		const isTimeBasedMission = isWMissionTimeBased(props.mission.w.MIS_TSE_ID, CarLocationManager.first_dispatch);
	
		const arrivalDefault = new Date(props.mission.w.MIS_DATE_DEBUT + 'T' + props.mission.w.MIS_HEURE_FIN);
		const arrivalEstimation = CarLocationManager.missions.find(m => m.w.MIS_ID == props.mission.w.MIS_ID)?.remainingStr
	
	
		let str = t('plannedArrivalAt') + " " + arrivalDefault.toLocaleTimeString().substring(0, 5);
		let color = 'black'
	
		if (arrivalEstimation && !isNaN(parseInt(arrivalEstimation)) && !isTimeBasedMission) {
	
			const v = Math.ceil(parseInt(arrivalEstimation) * 1.1); //Fix :)
	
			if (v < 5) {
				color = 'red'
			}
	
			if (v <= 0) {
				str = t('driverArrived');
			} else {
				str = t('estimatedArrivalIn') + " " + v + " " + t('minutesSuffix');
			}
	
		}
	
		
	
		// If the driver is less than 30m away from the arrival location, we display "arrived" too
		const curloc = CarLocationManager.GetLocation(props.mission.id + "");
		const endpoint = WGetFirstLastLoc(props.mission.w).endLoc;
	
		if (curloc && endpoint) {
			const distance_in_km = haversineDistance(curloc.lat, curloc.lng, parseFloat(endpoint.LIE_LAT), parseFloat(endpoint.LIE_LNG));
			if (distance_in_km < .05) { // 50m
				str = t('driverArrived');
				const x = CarLocationManager.missions.find(m => m.w.MIS_ID == props.mission.w.MIS_ID)
				// if(x != undefined) x.do_not_compute = true
			}
		}
	
		try {
			const is_mad = isWMissionTimeBased(props.mission.w.MIS_TSE_ID, CarLocationManager.first_dispatch);
		if(is_mad) {
	
			str = t('missionEndsAt') + " " + arrivalDefault.toLocaleTimeString().substring(0, 5);
	
		}
	
		const date = arrivalDefault.toLocaleTimeString().substring(0, 5);
		if(date.indexOf("Inval") != -1) {
			str = t('endOfMissionNotAvailable')
		}
		} catch (e) {
			console.error(e)
		}
	
		if(parseStatusFromRequest(props.mission.w) =='closed') return null;
	
		return (
			<>
				<Accordion
					onChange={() => {
						props.onClicked(props.index, props.mission);
					}}
					expanded={exp}
					style={{
						backgroundColor: exp ? "" : "#f5f5f5",
						borderRadius: exp ? 10 : 0,
						...additionalcss,
					}}
				>
					<AccordionSummary>
						<div style={{ width: "100%" }} id={"OneMission-" + props.mission.id}>
							<div
								style={{
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									marginBottom: 0,
									width: "100%",
								}}
							>
								<div style={{ flex: 1 }} title={props.mission.w.MIS_ID}>
									
									<p>
										{/* {props.mission.w.MIS_ID + " "} */}
	
										<div style={{ color: color }}>
											{
												// ARRIVEE PREVUE
												str
											}
										</div>
	
										{
											props.mission.acc &&
											<div style={{ backgroundColor: "purple", color: "white", borderRadius: 5, padding: 1, display: "inline-block", marginLeft: 5, fontSize: "small" }}>
												{t('greeting')}
											</div>
	
										}
									</p>
									{/* <p>Dans {props.mission.arrival.remaining}</p> */}
									{props.mission.info == "" ? <span style={{fontSize:'small'}}>{t('loading')}</span> : null}
									{props.mission.info && props.mission.info[0] != '?' && props.mission.info[0] != 'V' && <p style={{ color: "orange", fontSize: "small" }}>{props.mission.info}</p>}
									{props.mission.info && props.mission.info[0] == '?' && <p style={{ color: "darkblue", fontSize: "small" }}>{props.mission.info.substring(1)}</p>}
									{props.mission.info && props.mission.info[0] == 'V' && <p style={{ color: "green", fontSize: "small" }}>{props.mission.info.substring(1)}</p>}
									{/* #endregion */}
									{
										document.location.origin.indexOf("localhost") != -1 && props.mission.debug &&
										<p style={{ color: "lime", backgroundColor: 'black', padding: 5, width: '200px' }} dangerouslySetInnerHTML={{ __html: props.mission.debug }} />
									}
								</div>
	
								{
									props.mission.passenger == "??" &&
									<div style={{ fontSize: "smaller", opacity: '.8' }}>
										{t('unknownPassenger')}
									</div>
								}
								{
									props.mission.passenger != "??" &&
									<div style={{ flex: 1 }}>
										<p
											style={{
												textAlign: "right",
												maxWidth: "100%",
												overflow: "hidden",
												textOverflow: "ellipsis",
												fontSize: "1em",
												fontWeight: "50",
											}}
	
											title={props.mission.passenger.split(" ")[1] + " " + props.mission.passenger.split(" ")[0]}
										>
											{" "}
											{props.mission.passenger &&
												shortName(
													props.mission.passenger
														.split(" ")
														.slice(1)
														.join(" ")
														.toUpperCase(),
													20
												)
											}{" "}
											<span style={{ textTransform: "capitalize" }}>
												{props.mission.passenger &&
													shortName(
														props.mission.passenger.split(
															" "
														)[0],
														25
													)}
											</span>
										</p>
	
									</div>
								}
								<div>
									<img
										title={t('showImminentArrivals')}
										src={arrowDown}
										style={{
											marginLeft: 10,
											rotate: props.exp ? "180deg" : "0deg",
										}}
									/>
								</div>
							</div>
	
							
						</div>
					</AccordionSummary>
	
					<AccordionDetails>
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-evenly",
	
								backgroundColor: "#f5f5f5",
								padding: 10,
								borderRadius: 10,
	
								// Very slight shadow
								boxShadow: "0 0 5px 0 rgba(0,0,0,0.2)",
							}}
						>
							<div
								style={{
									textAlign: "center",
								}}
							>
								<Typography>{props.mission.locations.from}</Typography>
								<Typography variant="subtitle2">{(props.mission.w.MIS_HEURE_DEBUT || "").substring(0, 5)}</Typography>
							</div>
	
							<div>
								<ArrowForward />
							</div>
	
							<div
								style={{
									textAlign: "center",
								}}
							>
								<Typography>
									{
										props.mission.locations.to.indexOf("%") != -1
											? t('arrivalPlaceUndefined')
											: props.mission.locations.to
									}
								</Typography>
								<Typography variant="subtitle2">
									{(props.mission.w.MIS_HEURE_FIN || "").substring(0, 5)}
								</Typography>
							</div>
						</div>
	
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-evenly",
								marginTop: 10,
	
								backgroundColor: "#f5f5f5",
								padding: 10,
								borderRadius: 10,
								boxShadow: "0 0 5px 0 rgba(10,10,10,0.2)",
							}}
						>
							<div
								style={{
									flex: 1,
									textAlign: "center",
								}}
							>
								{props.mission.car_brand}<br />
								<LicencePlate platenum={props.mission.license_plate} />
							</div>
							<div style={{ flex: 1, textAlign: 'center' }}>
								<DriverName name={props.mission.chauffeur_name} phone={props.mission.chauffeur_phone} />
	
							</div>
						</div>
	
					</AccordionDetails>
				</Accordion>
			</>
		);
	} catch (e) {
		return null
	}
};
