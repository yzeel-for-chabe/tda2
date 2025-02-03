import { Marker } from "@vis.gl/react-google-maps"
import { paths } from "../../../../generated/openapi"
import { paths as geolocpaths } from "../../../../generated/openapi_geolocation"
import { useUserSelectionContext } from "./UserSelectionContext"

export const MissionMapDisplay = (props: {
    mission: paths["/v1/missions/filter"]["post"]["responses"]["200"]["content"]["application/json"][number] | undefined,
    geolocations: geolocpaths['/v1/geolocation/missions/tda']['post']['responses']['200']['content']['application/json'][number]
}) => {

    if(!props.mission || !props.geolocations) return null;

    const userselection = useUserSelectionContext();
    const is_geolocation_old = new Date(props.geolocations.geolocation.timestamp as unknown as string).getTime() < Date.now() - 1000 * 60 * 5;

    const directionsResult = JSON.stringify(props.geolocations.mission.last_google_path_result) as unknown as google.maps.DirectionsResult;
    const last_position = directionsResult.routes?.[0]?.legs?.[0]?.end_location;

    return (
        <>

            {
                userselection.selectedMission == props.mission.id && directionsResult && last_position && (
                    <Marker
                        position={{ lat: last_position.lat(), lng: last_position.lng() }}
                        icon={{
                            url: '/public/logocar.svg',
                            scaledSize: new google.maps.Size(30, 30),
                        }}
                        opacity={1}
                    />
                )
            }

            <Marker
                onClick={() => userselection.setSelectedMission(props.mission!.id)}
                position={{ lat: props.geolocations.geolocation.lat, lng: props.geolocations.geolocation.lng }}
                icon={{
                    url: userselection.selectedMission == props.mission.id ? '/public/logocar.svg' : '/public/logocargrey.svg',
                    scaledSize: new google.maps.Size(30, 30),
                }}
                opacity={userselection.selectedMission == props.mission.id ? 1 : 0.5}
                title={is_geolocation_old ? "Old geolocation" : ""}
            />
        </>
    )
}
