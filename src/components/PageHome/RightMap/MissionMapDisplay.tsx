import { useEffect, useState } from "react"
import { AdvancedMarker, Marker, Pin, useMap } from "@vis.gl/react-google-maps"
import { paths } from "../../../../generated/openapi"
import { paths as geolocpaths } from "../../../../generated/openapi_geolocation"
import { useUserSelectionContext } from "./UserSelectionContext"
import { usePolylineForMission } from "../../../hooks/usePolylineForMission"
import { useExtrapol } from "../../../hooks/useExtrapol"
import * as fns from "date-fns"
import './MissionMapDisplay.css';

export const MissionMapDisplay = (props: {
    mission: paths["/v1/missions/filter"]["post"]["responses"]["200"]["content"]["application/json"][number] | undefined,
    geolocations: geolocpaths['/v1/geolocation/missions/tda']['post']['responses']['200']['content']['application/json'][number]
}) => {

    const userselection = useUserSelectionContext();
    const [has_been_centered, setHasBeenCentered] = useState(false)

    const map = useMap()

    // usePolylineForMission(props.geolocations.mission, userselection.selectedMission === props.mission?.id)
    const extrapolPos = useExtrapol(props.geolocations.mission, true)// userselection.selectedMission === props.mission?.id)

    const [allpoints, polyline] = usePolylineForMission(props.geolocations.mission, userselection.selectedMission === props.mission?.id)

    // Can't happen
    // if (!props.mission || !props.geolocations) return null;

    useEffect(() => {
        return () => {
            if (polyline) {
                // alert("settiung map to null")
                polyline.setMap(null);
            }
        }
    }, [])

    useEffect(() => {
        setHasBeenCentered(false)
    }, [props.mission, userselection])

    const displayExtrapolation = !props.geolocations.geolocation || (fns.differenceInMinutes(new Date(), new Date(props.geolocations.geolocation.timestamp)) > 5)

    useEffect(() => {
        if (
            userselection.selectedMission == props.mission!.id
            && !userselection.hasUserMovedMap
            && props.geolocations.geolocation?.lat
            && !has_been_centered
        ) {
            setHasBeenCentered(true)

            const bounds = new google.maps.LatLngBounds()
            bounds.extend(new google.maps.LatLng(props.geolocations.geolocation.lat, props.geolocations.geolocation.lng))

            if (allpoints) {
                allpoints?.forEach?.((point) => {
                    bounds.extend(point)
                })
            }

            if (props?.geolocations?.mission?.locations?.length > 0) {
                bounds.extend(new google.maps.LatLng(props.geolocations.mission.locations.at(-1).lat, props.geolocations.mission.locations.at(-1).lng))
            }

            if (!displayExtrapolation) // No extrapolation, zoom on car
            {
                // alert("Zooming on car")
                bounds.extend(new google.maps.LatLng(props.geolocations.mission.locations.at(-1).lat, props.geolocations.mission.locations.at(-1).lng))
            }
            else {
                // alert("Zooming on extrapolation")
                if (extrapolPos && extrapolPos[0] && extrapolPos[1]) {
                    bounds.extend(new google.maps.LatLng({ lat: extrapolPos[1], lng: extrapolPos[0] }))
                }
            }

            map?.fitBounds(bounds, { top: 100, right: 100, bottom: 100, left: 100 })
            // map?.setCenter({ lat: props.geolocations.geolocation.lat, lng: props.geolocations.geolocation.lng })
        }
    }, [userselection])

    return (
        <>
            {
                // Show the arrival with a pin if the mission is selected
                userselection.selectedMission == props.mission.id
                && props.geolocations.mission.locations.length > 0
                && props.geolocations.mission.locations.at(-1).lat
                && props.geolocations.mission.locations.at(-1).lng
                &&
                <AdvancedMarker

                    position={new google.maps.LatLng(
                        props.geolocations.mission.locations.at(-1).lat,
                        props.geolocations.mission.locations.at(-1).lng
                    )}

                    title={"Destination"}
                >
                    <img src="/public/logoarrival.png" style={{
                        width: 40,
                        height: 40,
                    }}></img>
                </AdvancedMarker>
            }

            {extrapolPos && displayExtrapolation && extrapolPos[0] && extrapolPos[1] &&
                <>
                    <Marker
                        onClick={() => userselection.setSelectedMission(props.mission!.id)}
                        position={{ lat: extrapolPos[1], lng: extrapolPos[0] }}
                        // Hardcode for test
                        // position={{ lat: 48.8566, lng: 2.3522 }}
                        icon={{
                            url: '/public/logocarorange.svg',
                            scaledSize: new google.maps.Size(30, 30),
                            anchor: new google.maps.Point(15, 15),
                        }}
                        opacity={userselection.selectedMission == props.mission.id ? 1 : 0.5}
                    // title={new Date(props.geolocations.geolocation.timestamp).toLocaleString()}
                    />
                </>
            }

            {
                (!extrapolPos || !displayExtrapolation) && (props.geolocations.geolocation) &&
                <Marker
                    zIndex={100}
                    onClick={() => userselection.setSelectedMission(props.mission!.id)}
                    position={{ lat: props.geolocations.geolocation.lat, lng: props.geolocations.geolocation.lng }}
                    icon={{
                        url: userselection.selectedMission == props.mission.id ? '/public/logocar.svg' : '/public/logocargrey.svg',
                        scaledSize: new google.maps.Size(30, 30),
                        anchor: new google.maps.Point(15, 15),
                    }}
                    opacity={userselection.selectedMission == props.mission.id ? 1 : 0.5}
                // title={new Date(props.geolocations.geolocation.timestamp).toLocaleString()}
                />
            }

        </>
    )
}
