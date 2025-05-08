import { useEffect, useRef, useState } from "react"
import { paths } from "../../generated/openapi_geolocation"
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { GoogleRouteV2Result } from "../core/googleUtils";
import * as fns from "date-fns";

window.allPolyline = []

export const usePolylineForMission = (
    geolocation: paths["/v1/geolocation/missions/tda"]["post"]["responses"]["200"]["content"]["application/json"][number]['mission'],
    enabled: boolean
) => {


    // We decided to disable the polyline draw due to the uncertainty of the position that could
    //  move the location outside of the predicted path hence confusing the users.
    // return false;

    const allpoints = useRef<google.maps.LatLng[]>([])

    const geometryLibrary = useMapsLibrary('geometry')
    const map = useMap()

    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null)
    const [itv, setItv] = useState<NodeJS.Timeout | null>(null)

    const [marker, setMarker] = useState<google.maps.Marker | null>(null)

    const missionDef = geolocation.last_google_path_result;

    const clearAll = () => {
        polyline?.setMap(null)

        if (polyline) polyline.setMap(null)
        if (itv) clearInterval(itv)
    }

    useEffect(() => {
        polyline?.setMap(null)

        // window.allPolyline.forEach((pl) => {
        //     pl.setMap(null)
        // })

        console.log("Something changed, should redraw line !")

        if (enabled)
            console.log("redraw")

        if (!geometryLibrary) return;
        if (!map) return;

        let obj = {} as unknown as GoogleRouteV2Result;

        polyline?.setMap(null)

        if(!enabled) return;

        try {
            obj = JSON.parse(missionDef);
        } catch {
            // alert("Error parsing missionDef")
            // console.log({missionDef})
            obj = {} as unknown as GoogleRouteV2Result;
            return;
        }

        if (!missionDef || !obj || Object.keys(obj).length == 0) return;

        if (!enabled) {
            clearAll()
            return;
        }

        if (geolocation.has_chauffeur_reached_end) {
            return;
        }

        if (fns.isBefore(geolocation.eta, new Date())) {
            return
        }

        const latlngs = geometryLibrary.encoding.decodePath(obj.routes[0].polyline.encodedPolyline)
        allpoints.current = latlngs

        // Jira-177
        map?.data.forEach((feature) => {
            if(feature.getGeometry()?.getType() == "LineString") {
                map.data.remove(feature);
            }
        })

        const pl = new google.maps.Polyline({
            path: latlngs, // Decode the polyline
            geodesic: true,
            strokeColor: "#001535",
            strokeOpacity: 1.0,
            strokeWeight: 4,
            map
        })

        setPolyline(pl)
        window.allPolyline.push(pl)


        return () => {
            clearAll()
        }

    }, [geometryLibrary, map, enabled, geolocation, geolocation.last_google_path_result])

    useEffect(() => {
        return () => {
            clearAll()
        }
    }, [])

    return [allpoints.current, polyline] as const
}
