import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material"
import { paths } from "../../../../../generated/openapi"
import { paths as geolocpaths } from "../../../../../generated/openapi_geolocation"
import { useTranslation } from "react-i18next"
import { useUserSelectionContext } from "../../RightMap/UserSelectionContext"
import { ArrowForward } from "@mui/icons-material";


// @ts-expect-error somehow it doesnt find this file ?
import arrowDown from "../../../../../public/arrowBottom.svg"

import { Eta } from "./Eta"
import { useEffect } from "react"
import { ExplanationMission } from "./ExplanationMission"
import { ExplanationEta } from "./ExplanationEta"

export const OneMission = (props: {
    mission: paths["/v1/missions/filter"]["post"]["responses"]["200"]["content"]["application/json"][number],
    geolocation?: geolocpaths['/v1/geolocation/missions/tda']['post']['responses']['200']['content']['application/json'][number]
}) => {

    const userselection = useUserSelectionContext();
    const { t } = useTranslation()

    const passenger_text = props.mission.passengers[0]?.firstname
        ? <p>{props.mission.passengers[0]?.lastname?.toUpperCase()} {props.mission.passengers[0]?.firstname}</p>
        : props.mission.passengers[0]?.name
            ? <p>{props.mission.passengers[0]?.name}</p>
            : <p>{t('noPassenger')}</p>

    const selected = userselection.selectedMission == props.mission.id

    useEffect(() => {
        if (selected)
            console.log({ m: props.mission, g: props.geolocation })
    }, [selected])

    return (
        <Accordion
            expanded={userselection.selectedMission == props.mission.id}
            onChange={(_, expanded) => { if (expanded) userselection.setSelectedMission(props.mission.id); else userselection.setSelectedMission(0) }}
            style={{ width: "100%" }}
        >
            <AccordionSummary>
                <div style={{ width: "100%" }} id={"OneMission-" + props.mission.id}> { /* the ID is used for the scrollTo when clicking on a car on the map */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 0,
                            width: "100%",
                        }}
                    >

                        <div style={{ flex: 1 }}>
                            <span
                                style={{
                                    textAlign: "left",
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontSize: "1em",
                                    fontWeight: "50",
                                }}

                            >
                                {passenger_text}
                            </span>

                        </div>


                        <div style={{ flex: 1, textAlign: 'right' }}>
                            <Eta geolocation={props.geolocation} />
                        </div>

                        <div>
                            <img
                                title={t('showImminentArrivals')}
                                src={arrowDown}
                                style={{
                                    marginLeft: 10,
                                    rotate: selected ? "180deg" : "0deg",
                                }}
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <ExplanationMission mission={props.mission} geolocation={props.geolocation} />
                        <ExplanationEta mission={props.mission} geolocation={props.geolocation} />
                    </div>


                </div>
            </AccordionSummary>
            <AccordionDetails>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-evenly",

                        backgroundColor: "#f5f5f5",
                        padding: 10,
                        borderRadius: 10,

                        // Very slight shadow
                        boxShadow: "0 0 5px 0 rgba(0,0,0,0.2)",
                    }}
                >
                    <div
                        style={{
                            textAlign: "center",
                        }}
                    >
                        <Typography>{props.mission.locations[0].name}</Typography>
                        <Typography variant="subtitle2">{new Date(new Date().toISOString().substring(0, 10) + 'T' + props.mission.startTime + ':00').toLocaleTimeString().substring(0, 5)}</Typography>
                    </div>

                    <div>
                        <ArrowForward />
                    </div>

                    <div
                        style={{
                            textAlign: "center",
                        }}
                    >
                        <Typography>
                            {props.mission.locations[props.mission.locations.length - 1].name}
                        </Typography>
                        <Typography variant="subtitle2">
                            {/* {(props.mission.w.MIS_HEURE_FIN || "").substring(0, 5)} */}
                        </Typography>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                        marginTop: 10,

                        backgroundColor: "#f5f5f5",
                        padding: 10,
                        borderRadius: 10,
                        boxShadow: "0 0 5px 0 rgba(10,10,10,0.2)",
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            textAlign: "center",
                        }}
                    >
                        {props.mission.vehicle.brand}<br />
                        {props.mission.vehicle.plate}
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        {props.mission.chauffeur.lastname} {props.mission.chauffeur.firstname}
                        <br />
                        {props.mission.chauffeur.phone}
                    </div>
                </div>

            </AccordionDetails>
        </Accordion>
    )

}
