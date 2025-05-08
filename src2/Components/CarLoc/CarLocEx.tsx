import { useMap, Marker, useMapsLibrary, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

import { useEffect, useRef, useState } from "react";
import { LastKnownPositionInfo, MissionT } from "../../App";
import { CarLocationManager } from "../../core/CarLocationManager/manager";
import { Alert, Snackbar } from "@mui/material";
import { t } from "i18next";
import { isWMissionTimeBased } from "../../business/missionWCategories";
import { WGetFirstLastLoc } from "../../core/waynium";

function calculateRotation(lat1, lon1, lat2, lon2) {
	const toRadians = (degrees) => degrees * Math.PI / 180;
	const toDegrees = (radians) => degrees * 180 / Math.PI;

	const dLon = toRadians(lon2 - lon1);

	const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
	const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
		Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);

	let angle = toDegrees(Math.atan2(y, x));
	return (angle + 360) % 360;  // to ensure the angle is between 0 and 360
}


export const CarLocEx = (props: {
	missionData: MissionT,
	missionLastKnownPosition: LastKnownPositionInfo | null,
	showPath?: boolean,
	onCarClicked?: () => void,
	following: boolean,
}) => {

	const map = useMap();
	const routesLibrary = useMapsLibrary('routes')!;
	const iconRef = useRef<google.maps.Marker>(null);
	const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
	const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

	useEffect(() => {
		if (!routesLibrary || !map) return;
		setDirectionsService(new routesLibrary.DirectionsService());
		setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
	}, [routesLibrary, map])

	useEffect(() => {
		if (props.showPath) {
			const loc = CarLocationManager.GetLocation(props.missionData.w.MIS_ID)

			if (!loc || !loc.lat || !loc.lng) return;

			map?.setHeadingInteractionEnabled(true);
			// map?.setTilt(45);
			// map?.setZoom(1);
			// map?.setCenter(loc);



			// map?.setHeading(90);

			directionsRenderer?.setMap(map);
			directionsRenderer?.setOptions({
				polylineOptions: {
					strokeColor: '#061E3A',
					strokeWeight: 3
				},
				preserveViewport: true,
				suppressMarkers: true,
			})

		}
	}, [props.showPath])

	useEffect(() => {

		if (!directionsService || !directionsRenderer) return;

		const { startLoc, endLoc } = WGetFirstLastLoc(props.missionData.w);
		const start_pos_lat = parseFloat(startLoc.LIE_LAT);
		const start_pos_lng = parseFloat(startLoc.LIE_LNG);
		const end_pos_lat = parseFloat(endLoc.LIE_LAT);
		const end_pos_lng = parseFloat(endLoc.LIE_LNG);

		const loc = CarLocationManager.GetLocation(props.missionData.w.MIS_ID)
		let last_known: { lat: number, lng: number } | null = CarLocationManager.GetLastReceivedLocation(props.missionData.w.MIS_ID);

		if (!last_known || !last_known.lat || !last_known.lng) {
			last_known = { lat: start_pos_lat, lng: start_pos_lng }
		}

		directionsService.route({
			origin: last_known,
			destination: { lat: end_pos_lat, lng: end_pos_lng },
			travelMode: google.maps.TravelMode.DRIVING,
		}).then(response => {

			console.log("saged:")
			// setSavedDirectionServices(response);


			if (props.showPath) {

				const mission = CarLocationManager.missions.find(m => m.w.MIS_ID === props.missionData.w.MIS_ID);


				directionsRenderer.setMap(map);
				directionsRenderer.setOptions({
					polylineOptions: {
						strokeColor: '#061E3A',
						strokeWeight: 3
					},
					preserveViewport: true,
					suppressMarkers: true,
				})

				const loc = CarLocationManager.GetLocation(props.missionData.w.MIS_ID)

				if (!mission?.mad) {
					// ne pas afficher les trajets dans les mises à dispo
					directionsRenderer.setDirections(response);


					// map?.fitBounds([
					// 	{ lat: start_pos_lat, lng: start_pos_lng },
					// 	{ lat: end_pos_lat, lng: end_pos_lng },
					// 	{ lat: loc.lat, lng: loc.lng }
					// ])

				} else {
					// Is MaD
					// if (loc) map?.setCenter(loc);
					// map?.setZoom(15);
				}


			}
			else {
				directionsRenderer.setMap(null);
			}
		})

	}, [directionsService, directionsRenderer, props.showPath])

	useEffect(() => {

		if (props.showPath && props.following) {
			const loc = CarLocationManager.GetLocation(props.missionData.w.MIS_ID)
			// map?.setCenter(loc);
		}

	}, [props.showPath, props.missionData, props.missionLastKnownPosition, props.following])

	useEffect(() => {
		if (!iconRef.current) return;

		// alert("Setting icon");   

		iconRef.current.setIcon({
			url: '/car-top-view.svg',
			scaledSize: new google.maps.Size(30, 30),
			fillColor: 'red',
			rotation: calculateRotation(curVector.start.lat(), curVector.start.lng(), curVector.end.lat(), curVector.end.lng())
		})


	}, [])

	const lrl = CarLocationManager.GetLastReceivedLocation(props.missionData.w.MIS_ID);
	const cur = CarLocationManager.GetLocation(props.missionData.w.MIS_ID);

	let lrl_diff_from_cur = 0;
	try {
		lrl_diff_from_cur = lrl ? Math.abs(lrl.lat - cur.lat) + Math.abs(lrl.lng - cur.lng) : 0;
	} catch (e) {
		console.log("Error while calculating lrl_diff_from_cur", e);
	}

	// THIS IS A MISE A DISPO
	useEffect(() => {
		if (!props.showPath) return;

		const m = CarLocationManager.missions.find(m => m.w.MIS_ID === props.missionData.w.MIS_ID);
		if (!m?.mad) return;

		let marker_start: google.maps.Marker;
		let line_from_start_to_car: google.maps.Polyline;

		if (cur && cur.lat && cur.lng && (cur?.lat != 0) && (cur?.lng != 0)) {

			const { startLoc, endLoc } = WGetFirstLastLoc(props.missionData.w);

			if (parseFloat(startLoc.LIE_LAT) != 0 && parseFloat(startLoc.LIE_LNG) != 0) {

				marker_start = new google.maps.Marker({
					position: {
						lat: parseFloat(endLoc.LIE_LAT) || parseFloat(startLoc.LIE_LAT),
						lng: parseFloat(endLoc.LIE_LNG) || parseFloat(startLoc.LIE_LNG)
					},
					map: map,
					title: 'Départ / Arrivée',
					label: {
						text: 'B',
						color: 'white',
						fontSize: '12px',
						fontWeight: 'bold',
					},
				})

				line_from_start_to_car = new google.maps.Polyline({
					path: [
						{
							lat: parseFloat(endLoc.LIE_LAT) || parseFloat(startLoc.LIE_LAT),
							lng: parseFloat(endLoc.LIE_LNG) || parseFloat(startLoc.LIE_LNG)
						},
						{ lat: cur?.lat, lng: cur?.lng }
					],
					icons: [{ icon: { path: "M 0,0 0,1 Z", strokeOpacity: 1, scale: 2, }, offset: "0", repeat: "10px", },],
					geodesic: true,
					strokeColor: "#000070",
					strokeOpacity: 0,
					strokeWeight: 2,
					map: map
				});
			}

		} else {
			setNoPosAlert(true);
		}



		return () => {
			marker_start?.setMap(null);
			line_from_start_to_car?.setMap(null);
		}
	}, [props.showPath, cur]);

	// Center MaD only when clicking on the mission (ignore car movement)
	useEffect(() => {
		const { startLoc } = WGetFirstLastLoc(props.missionData.w);

		const bounds = new google.maps.LatLngBounds();
		const loc_start = { lat: parseFloat(startLoc.LIE_LAT), lng: parseFloat(startLoc.LIE_LNG) }
		bounds.extend(loc_start);
		bounds.extend({ lat: cur?.lat || 0, lng: cur?.lng || 0 });
		if (cur?.lat && cur?.lng && cur.lat != 0 && cur.lng != 0)
			map?.fitBounds(bounds, 150);
	}, [props.showPath])


	// THIS IS A NORMAL MISSION
	const already_selected_before = useRef(false);
	useEffect(() => {
		if (!props.showPath) {
			already_selected_before.current = false;
			directionsRenderer?.setMap(null);
			return;
		}

		const m = CarLocationManager.missions.find(m => m.w.MIS_ID === props.missionData.w.MIS_ID);
		if (m?.mad) return;

		let last_known: { lat: number, lng: number } | null = CarLocationManager.GetLastReceivedLocation(props.missionData.w.MIS_ID);
		if (!last_known || !last_known.lat || !last_known.lng) {
			// Set the last position to the first position
			const { startLoc } = WGetFirstLastLoc(props.missionData.w);
			last_known = { lat: parseFloat(startLoc.LIE_LAT), lng: parseFloat(startLoc.LIE_LNG) }
		}

		const locs = WGetFirstLastLoc(props.missionData.w);


		const line_from_start_to_car = new google.maps.Polyline({
			path: [
				{ lat: parseFloat(locs.startLoc.LIE_LAT), lng: parseFloat(locs.startLoc.LIE_LNG) },
				last_known
			],
			icons: [{ icon: { path: "M 0,-1 1,0 0,-1 -1,0 0,-1 Z", strokeOpacity: 1, scale: 2, }, offset: "0", repeat: "10px", },],
			geodesic: true,
			strokeColor: "#000070",
			strokeOpacity: 0,
			map: map
		});

		const { startLoc, endLoc } = WGetFirstLastLoc(props.missionData.w);

		const marker_start = new google.maps.Marker({
			position: { lat: parseFloat(startLoc.LIE_LAT), lng: parseFloat(startLoc.LIE_LNG) },
			map: map,
			title: startLoc.LIE_LIBELLE || startLoc.LIE_FORMATED,
			label: {
				text: 'A',
				color: 'white',
				fontSize: '12px',
				fontWeight: 'bold',
			},
		})

		const marker_end = new google.maps.Marker({
			position: { lat: parseFloat(endLoc.LIE_LAT), lng: parseFloat(endLoc.LIE_LNG) },
			map: map,
			title: endLoc.LIE_LIBELLE || endLoc.LIE_FORMATED,
			label: {
				text: 'B',
				color: 'white',
				fontSize: '12px',
				fontWeight: 'bold',
			},
		})

		const loc_start = { lat: parseFloat(startLoc.LIE_LAT), lng: parseFloat(startLoc.LIE_LNG) }
		const loc_end = { lat: parseFloat(endLoc.LIE_LAT), lng: parseFloat(endLoc.LIE_LNG) }


		const bounds = new google.maps.LatLngBounds();
		// bounds.extend(loc_start);
		bounds.extend(loc_end);
		if (cur?.lat && cur?.lng && cur.lat != 0 && cur.lng != 0)
			bounds.extend(cur);
		if (last_known) bounds.extend(last_known);

		if (!already_selected_before.current) {
			map?.fitBounds(bounds, 150);
		}

		already_selected_before.current = true;

		return () => {
			line_from_start_to_car.setMap(null);
			marker_start.setMap(null);
			marker_end.setMap(null);
		}

	}, [props.showPath, cur])

	const [noPosAlert, setNoPosAlert] = useState(false);

	const last_received_geoloc = CarLocationManager.GetLastReceivedLocation(props.missionData.w.MIS_ID);
	const is_being_extrapolated =
		!isWMissionTimeBased(props.missionData.w.MIS_TSE_ID, CarLocationManager.first_dispatch)
		&& (
			last_received_geoloc && ((new Date().getTime() - last_received_geoloc.time.getTime()) > 1000 * 60 * 5)
			|| !last_received_geoloc
		)

	return [
		<Snackbar
			style={{ zIndex: 9999, position: 'fixed', left: '65%', top: 0 }}
			open={noPosAlert} autoHideDuration={5000} onClose={() => setNoPosAlert(false)}
		>
			<Alert
				severity="info"
				variant="filled"
				sx={{ width: '100%' }}
				onClose={() => setNoPosAlert(false)}
			>
				{/* Aucune position pour cette mission */}
				{t("no_position_for_this_mission")}
			</Alert>
		</Snackbar>,
		<Marker
			ref={iconRef}
			position={CarLocationManager.GetLocation(props.missionData.w.MIS_ID)}
			title={"Mission " + props.missionData.w.MIS_ID}
			clickable={true}
			opacity={
				// Any mission is selected and this is not the selected mission, .5
				// This is the selected mission, 1
				props.showPath ? 1 : .5
			}
			icon={{
				url: props.showPath
					? is_being_extrapolated
						? '/public/logocarorange.svg'
						: '/public/logocar.svg'
					: '/public/logocargrey.svg',
				scaledSize: new google.maps.Size(30, 30),
			}}
			onClick={() => {
				document.querySelector('#OneMission-' + props.missionData.w.MIS_ID)?.scrollIntoView({ behavior: 'smooth' });
				props.onCarClicked?.();
			}}

		/>,

		((lrl && props.showPath && lrl_diff_from_cur) ? <AdvancedMarker
			// ref={iconRef}
			position={{ lat: lrl.lat, lng: lrl.lng }}
			// title={"Dernière position connue du véhicule"}
			title={t("last_known_position_of_the_vehicle")}
			onClick={() => {
				props.onCarClicked?.();
			}}

		>
			<Pin
				glyphColor={'green'}
				background={'green'}
				borderColor={'green'}
				scale={1}
			/>
		</AdvancedMarker> : null)

	];

}
