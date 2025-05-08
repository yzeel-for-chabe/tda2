import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

export const OverMapInformations = (props: {
	dispatch: string
}) => {

	const map = useMap();

	useEffect(() => {
		switch(props.dispatch) {
			case "chabe": // Paris
				map?.setCenter({ lat: 48.8534, lng: 2.3488 })
				break;
			case "chabelimited": // Londres
				map?.setCenter({ lat: 51.5074, lng: -0.1278 })
				break;
		}
	}, [map, props.dispatch])

    return (null)
}
