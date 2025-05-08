import { useState } from "react"
import { LeftBarSmall } from "./LeftBarSmall"
import { LeftBarBig } from "./LeftBarBig"
import { MidTitle } from "./SmallMidTitle"
import { paths } from "../../../../generated/openapi"
import { paths as geolocpaths } from "../../../../generated/openapi_geolocation"

export const LeftBar = (props: {
    missions: paths["/v1/missions/filter"]["post"]["responses"]["200"]["content"]["application/json"],
    geolocations: geolocpaths['/v1/geolocation/missions/tda']['post']['responses']['200']['content']['application/json']
}) => {

    const [increasedMiddleSize, setIncreasedMiddleSize] = useState(false)

    return (
        <div
            className="vertical-middle"
            style={{
                width: increasedMiddleSize
                    ? "100%"
                    : undefined,
                transition: "width 0.5s",
            }}
        >

            <MidTitle
                increasedMiddleSize={increasedMiddleSize}
                setIncreasedMiddleSize={setIncreasedMiddleSize}
            />

            {increasedMiddleSize && <LeftBarBig missions={props.missions} />}
            {!increasedMiddleSize && <LeftBarSmall missions={props.missions.filter(m => (m.status < 8) && (m.status > 4))} geolocations={props.geolocations} />}

        </div>
    )
}
