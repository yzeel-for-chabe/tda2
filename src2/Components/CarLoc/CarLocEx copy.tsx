import { useMap, useMapsLibrary, Marker } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import { LastKnownPositionInfo } from "../../App";
import { GeolocExtrapolationComputer } from "../../core/utils/maps/maps";
import { CarAlgorithms } from "../../CarAlgorithms";
import { polyline_and_percent_to_latlng, polyline_and_percent_to_subpolyline } from "../../core/utils/maps/polyline";
import { CarLocationManager } from "../../core/CarLocationManager";

function calculateRotation(lat1, lon1, lat2, lon2) {
    const toRadians = (degrees) => degrees * Math.PI / 180;
    const toDegrees = (radians) => radians * 180 / Math.PI;
    
    const dLon = toRadians(lon2 - lon1);
    
    const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
              Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
    
    let angle = toDegrees(Math.atan2(y, x));
    return (angle + 360) % 360;  // to ensure the angle is between 0 and 360
}

// Example usage:
const rotationAngle = calculateRotation(48.8566, 2.3522, 51.5074, -0.1278);
console.log(rotationAngle);


export const CarLocEx = (props: {
    missionData: any,
    missionLastKnownPosition: LastKnownPositionInfo | null,
    showPath?: boolean
}) => {

    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
    const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
    
    const [savedDirectionServices, setSavedDirectionServices] = useState<google.maps.DirectionsResult | null>(null);
    const savedGeolocExtrapolationComputed = useRef<{data:GeolocExtrapolationComputer | null}>({data: null});
    const [carMarkerLocation, setCarMarkerLocation] = useState<google.maps.LatLngLiteral | null>(null);

    // Initialize
    useEffect(() => {

        if(!routesLibrary || !map) return;

        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));

    }, [routesLibrary, map])

    // Use direction services
    useEffect(() => {

        if(!directionsService || !directionsRenderer) return;

        const start_pos_lat = parseFloat(props.missionData.w.C_Gen_EtapePresence[0].C_Geo_Lieu.LIE_LAT)
        const start_pos_lng = parseFloat(props.missionData.w.C_Gen_EtapePresence[0].C_Geo_Lieu.LIE_LNG)
        const end_pos_lat = parseFloat(props.missionData.w.C_Gen_EtapePresence[props.missionData.w.C_Gen_EtapePresence.length - 1].C_Geo_Lieu.LIE_LAT)
        const end_pos_lng = parseFloat(props.missionData.w.C_Gen_EtapePresence[props.missionData.w.C_Gen_EtapePresence.length - 1].C_Geo_Lieu.LIE_LNG)
                

        directionsService.route({
            origin: { lat: start_pos_lat, lng: start_pos_lng },
            destination: { lat: end_pos_lat, lng: end_pos_lng },
            travelMode: google.maps.TravelMode.DRIVING
        }).then( response => {

            console.log("saged:")
            setSavedDirectionServices(response);

            if(props.showPath)
            {
                directionsRenderer.setMap(map);
                directionsRenderer.setDirections(response);
                directionsRenderer.setOptions({
                    polylineOptions: {
                        strokeColor: '#061E3A',
                        strokeWeight: 4
                    }
                })
            }
            else
            {
                directionsRenderer.setMap(null);
            }
        })

    }, [directionsService, directionsRenderer, props.showPath])

    const [curPolyline, setCurPolyline] = useState<any>(null);
    const [curVector, setCurVector] = useState<any>(null);

    useEffect(() => {

        // 3 cases : 
        // - missionLastKnownPosition is null : we have no fucking idea about anything. We can show the expected path and
        //                                      extrapolate the shit out of it. Begin date = mission.MIS_DATE_DEBUT, then
        //                                      everything is based on google maps estimates.
        // - missionLastKnownPosition < 5 min : The geolocation is accurate, dont extrapolate anything.
        // - missionLastKnownPosition > 5 min : Ask the server again about the position, which becomes the new start location
        //                                      then consider missionLastKnownPosition.date as the mission start date. then
        //                                      extrapolate everything based on that.
            const iv = setInterval(async () => {

            if(props.missionLastKnownPosition == null) {
                // Case 1 we extrapolate from mission start loc, mission start time, mission end loc
                // const mission_start_loc = props.missionData.
                const start_time = new Date(props.missionData.w.MIS_DATE_DEBUT + "T" + props.missionData.w.MIS_HEURE_DEBUT)

                if(!savedGeolocExtrapolationComputed.current.data) {
                    
                    // console.log({GEC: savedDirectionServices})
                    const gec = new GeolocExtrapolationComputer(savedDirectionServices!, {compute_timeinfo_at_init: true});
                    
                    savedGeolocExtrapolationComputed.current.data = gec;
                }

                const elapsed_since_start = (new Date().getTime() - start_time.getTime()) / 1000;
                const data = savedGeolocExtrapolationComputed.current.data.info_at_time(elapsed_since_start);

                const position_polyline = data?.polylinepos; // The car is along this line
                setCurPolyline(position_polyline);
                const position_coords = CarAlgorithms.decodePolylineFlat(position_polyline || "");

                console.log({position_coords});

                const latlng = polyline_and_percent_to_latlng(position_polyline || "", data?.percent_of_current_path || 0);

                setCarMarkerLocation({lat: latlng.lat(), lng: latlng.lng()});
                setCurVector(polyline_and_percent_to_subpolyline(position_polyline || "", data?.percent_of_current_path || 0));
            }

        }, 1_000);

        return () => clearInterval(iv);

    }, [savedDirectionServices])

    const iconRef = useRef<google.maps.Marker>(null);

    useEffect(() => {
        if(!iconRef.current) return;

        // alert("Setting icon");   

        iconRef.current.setIcon({
            url: '/car-top-view.svg', 
            // size: new google.maps.Size(50, 50),
            scaledSize: new google.maps.Size(30, 30),
            fillColor: 'red',
            rotation: 90//calculateRotation(curVector.start.lat(), curVector.start.lng(), curVector.end.lat(), curVector.end.lng())
        })

        // iconRef.current.setTitle("Car");

    }, [curVector])

    return <Marker
        ref={iconRef}
        position={CarLocationManager.GetLocation(props.missionData.w.MIS_ID)}

    />;

}
