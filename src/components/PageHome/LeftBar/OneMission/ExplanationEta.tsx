
import { paths } from "../../../../../generated/openapi"
import { paths as geolocpaths } from "../../../../../generated/openapi_geolocation"
import * as fns from "date-fns"
import { useTranslation } from "react-i18next"
type missionT = paths["/v1/missions/filter"]["post"]["responses"]["200"]["content"]["application/json"][number]
type geolocationT = geolocpaths['/v1/geolocation/missions/tda']['post']['responses']['200']['content']['application/json'][number]

export const ExplanationEta = (props: {
    mission: missionT,
    geolocation?: geolocationT
}) => {

    const { t } = useTranslation()

    // If not started yet
    if(fns.isAfter(new Date(props.mission.date.substring(0,10) + "T" + props.mission.startTime + ':00'), new Date()) && props.mission.status == 6) {
        return <p style={{ fontSize:'smaller', color: 'green', marginRight: 30  }}>
            {t("driverWaitingForPickUp")}
        </p>
        
    }

    const eta = new Date(props.geolocation?.mission.eta as unknown as string);
    if (isNaN(eta.getTime()) || eta.getTime() == 0) {
        return <p style={{ fontSize:'smaller', color: 'red', marginRight: 30 }}>
            {t("noPositionForThisMission")}
        </p>
    }

    // If ETA is in the past, we display the vehicle is in position for drop-offs
    if (fns.isBefore(eta, new Date())) {
        return <p style={{ fontSize:'smaller', color: 'green', marginRight: 30  }}>
            {t("vehicleInPositionForDropOff")}
        </p>
    }

    // Else we simply display the last geolocation time
    if (fns.isAfter(eta, new Date())) {
        try {
            const lastgeo = new Date(props.geolocation?.geolocation?.timestamp as unknown as string);
            const minutes_since_last_geo = fns.differenceInMinutes(new Date(), lastgeo);

            // Format "x minutes" to "x hours x minutes"
            const formatted_time_last_geo = minutes_since_last_geo < 60
                ? minutes_since_last_geo
                : `${Math.floor(minutes_since_last_geo / 60)}h ${minutes_since_last_geo % 60}`


            //  If  no geolocation at all
            if(!props.geolocation || !props.geolocation.geolocation) {
                return <p style={{ fontSize:'smaller', color: 'red', marginRight: 30 }}>
                    {t("noPositionForThisMission")}
                </p>
            }

            if(isNaN(minutes_since_last_geo)) {
                return <p style={{ fontSize:'smaller',color: 'red', marginRight: 30 }}>
                    {t("noPositionForThisMission")}
                </p>
            }
            if(minutes_since_last_geo > 30) {
                return <p style={{ fontSize:'smaller', color: 'orange', marginRight: 30 }}>
                    {t("lastKnownPositionOfTheVehicle")} {t("minutesPrefix")} {formatted_time_last_geo} {t("minutesSuffix")}
                </p>
            } else if(minutes_since_last_geo > 5) {
                return <p style={{ fontSize:'smaller', color: 'orange', marginRight: 30 }}>
                    {t("lastKnownPositionOfTheVehicle")} {t("minutesPrefix")} {minutes_since_last_geo} {t("minutesSuffix")}
                </p>
            } else
            if (minutes_since_last_geo < 2) {
                return <p style={{ fontSize:'smaller', color: 'black', marginRight: 30 }}>
                    {t("lastKnownPositionOfTheVehicle")} {t("now")}
                </p>
            } else
            {
                return <p style={{ fontSize:'smaller', color: 'black', marginRight: 30 }}>
                    {t("lastKnownPositionOfTheVehicle")} {t("minutesPrefix")} {formatted_time_last_geo} {t("minutesSuffix")}
                </p>
            }

        } catch {
            return "no geo"
        }
    }

}
