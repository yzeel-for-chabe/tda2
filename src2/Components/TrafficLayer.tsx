import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

export const TrafficLayer = () => {
    const map = useMap();
  
    useEffect(() => {
      if(!map) return;
  
    //   const trafficLayer = new google.maps.TrafficLayer({map, autoRefresh: true});
      return () => { 
        // trafficLayer.setMap(null);
      }; 
    }, [map]);
  
    return <></>;
  }