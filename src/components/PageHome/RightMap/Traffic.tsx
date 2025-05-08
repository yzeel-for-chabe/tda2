import { useMap } from "@vis.gl/react-google-maps"
import { useRef } from "react";
import { useUserSelectionContext } from "./UserSelectionContext";

export const Traffic = () => {

    const map = useMap();
    const userSelection = useUserSelectionContext();

    const shouldShowTraffic = userSelection.showTraffic;

    const trafficLayer = useRef<google.maps.TrafficLayer | null>(null);

    if (shouldShowTraffic && !trafficLayer.current) {
        trafficLayer.current = new google.maps.TrafficLayer();
        trafficLayer.current.setMap(map);
    } else if (!shouldShowTraffic && trafficLayer.current) {
        trafficLayer.current.setMap(null);
        trafficLayer.current = null;
    }

    return null;

}
