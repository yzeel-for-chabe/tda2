import { useEffect, useState } from "react"
import { paths } from "../../generated/openapi_geolocation"
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { GoogleRouteV2Result } from "../core/googleUtils";
import * as turf from "@turf/turf";

export const useExtrapol = (
    geolocation: paths["/v1/geolocation/missions/tda"]["post"]["responses"]["200"]["content"]["application/json"][number]['mission'],
    enabled: boolean
) => {

    // We decided to disable the polyline draw due to the uncertainty of the position that could
    //  move the location outside of the predicted path hence confusing the users.
    // return false;

    const geometryLibrary = useMapsLibrary('geometry')
    const map = useMap()

    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null)
    const [itv, setItv] = useState<NodeJS.Timeout | null>(null)

    const [posExtrapol, setPosExtrapol] = useState<[number, number] | null>(null)

    const missionDef = geolocation.last_google_path_result;

    const clearAll = () => {
        if (polyline) polyline.setMap(null)
        if (itv) clearInterval(itv)
    }

    useEffect(() => {
        if (!geometryLibrary) return;
        if (!map) return;

        let obj = {} as unknown as GoogleRouteV2Result;

        try {
            obj = JSON.parse(missionDef);
        } catch {
            obj = {} as unknown as GoogleRouteV2Result;
        }

        if (!missionDef || !obj || Object.keys(obj).length == 0) return;

        if (!enabled) {
            clearAll()
            return;
        }

        const computePos = () => {
            const calculated_from_time = new Date(geolocation.google_path_result_age);
            const seconds_elapsed = (new Date().getTime() - calculated_from_time.getTime()) / 1000;
    
            let remaining_seconds = seconds_elapsed;
    
            for (let i = 0; i != obj.routes[0].legs[0].steps.length; i++) {
    
                const step = obj.routes[0].legs[0].steps[i];
                const duration_in_seconds = parseInt(step.staticDuration.substring(0, step.staticDuration.length - 1));
    
                // console.log({remaining_seconds, duration_in_seconds, staticDuration: step.staticDuration})
    
                if (remaining_seconds < duration_in_seconds) {
    
                    const time_in_this_segment = remaining_seconds;
                    const total_segment_time = duration_in_seconds;
    
                    const percent_of_this_segment = time_in_this_segment / total_segment_time;
                    const distance_in_this_segment = step.distanceMeters * percent_of_this_segment;
					if(!distance_in_this_segment) {
						console.error("No distance found for mission", geolocation)
						return;
					}

                    const line = turf.lineString(geometryLibrary.encoding.decodePath(step.polyline.encodedPolyline).map(latLng => [latLng.lng(), latLng.lat()]))
                    if(!line) {
						console.error("No Line found for mission", geolocation)
						return;
					}
					
					let loc;
					try {
						loc = turf.along(line, distance_in_this_segment, { units: 'meters' })
						loc = loc.geometry
						loc = loc.coordinates as [number, number];
    
					} catch (e) {
						debugger;
					}

                    setPosExtrapol(loc)
    
                    break;
    
                } else {
                    remaining_seconds -= duration_in_seconds
                }
            }
        }

        computePos();
        setItv(setInterval(() => {
            computePos()
        }, 60000))

        // setPolyline(new google.maps.Polyline({
        //     path: geometryLibrary.encoding.decodePath(obj.routes[0].polyline.encodedPolyline), // Decode the polyline
        //     geodesic: true,
        //     strokeColor: "#00007F",
        //     strokeOpacity: 1.0,
        //     strokeWeight: 4,
        //     map
        // }))

        return () => {
            clearAll()
        }

    }, [geometryLibrary, map, enabled])


    return posExtrapol;
}
