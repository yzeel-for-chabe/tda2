import { paths } from "../../../../generated/openapi"
import { paths as geolocpaths } from "../../../../generated/openapi_geolocation"
import { Wrapper } from "@googlemaps/react-wrapper";
import { APIProvider, ControlPosition, Map, MapControl } from '@vis.gl/react-google-maps';
import { MissionMapDisplay } from "./MissionMapDisplay";
import { useUserSelectionContext } from "./UserSelectionContext";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { Traffic } from "./Traffic";
import { useTranslation } from "react-i18next";


export const RightMap = (props: {
    missions: paths["/v1/missions/filter"]["post"]["responses"]["200"]["content"]["application/json"]
    geolocations: geolocpaths['/v1/geolocation/missions/tda']['post']['responses']['200']['content']['application/json']
}) => {

    const { t } = useTranslation();
    const userselection = useUserSelectionContext();

    // if (props.missions.length == 0) {
    //     return "Chargement de la carte..."
    // }

    const missions_to_show = props.missions.filter(m => m.type == "A_TO_B" && m.status < 8 && m.status > 4)

    return (
        <div className="vertical-right" style={{ color: 'white', height: '200', overflow: 'hidden' }}>

            <Map
                mapId={'f375369fdfba970b'}
                defaultZoom={12}
                defaultCenter={{ lat: 48.8566, lng: 2.3522 }}

                onDrag={() => userselection.setHasUserMovedMap(true)}
                disableDefaultUI={true}
            >

                <MapControl position={ControlPosition.TOP_LEFT}>

                    <div
                        style={{
                            backgroundColor: 'white',
                            margin: '10px',
                            padding: '0 10px',
                            boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <FormGroup>
                            <FormControlLabel style={{ color: 'black' }} control={<Checkbox checked={userselection.showTraffic} />} label={t("showTraffic")} onChange={(_, c) => userselection.setShowTraffic(c)} />
                        </FormGroup>
                    </div>

                </MapControl>

                <Traffic />

                {
                    props.geolocations.map(g => {
                        const mis = missions_to_show.find(m => m.wayniumid === g.mission.wayniumid);
                        if (!mis) return null;
                        return <MissionMapDisplay key={g.mission.id} mission={mis} geolocations={g} />
                    })
                }

            </Map>
        </div >
    )
}
