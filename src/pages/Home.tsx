
import { useEffect, useState } from "react"
import { LeftBar } from "../components/PageHome/LeftBar/LeftBar"
import { RightMap } from "../components/PageHome/RightMap/RightMap"
import { useMsal } from "@azure/msal-react"
import { useMsalToken } from "../hooks/useMsalToken"
import { useBsHabilitations } from "../hooks/useBsHabilitations"
import { useMissions } from "../hooks/useMissions"
import { useGeolocationInfo } from "../hooks/useGeolocationInfo"
import UserSelectionContext from "../components/PageHome/RightMap/UserSelectionContext"
import { useMissionFilter } from "../hooks/useMissionFilter"
import { Wrapper } from "@googlemaps/react-wrapper"
import { APIProvider, useMap } from "@vis.gl/react-google-maps"

// TODO : Wrap this to clean up the code

export const PageHome = () => {

    const { instance } = useMsal()
    const { msalToken } = useMsalToken(instance)
    const { data: habilitation } = useBsHabilitations(msalToken)
    const { data: missions } = useMissions(habilitation?.subAccounts.map(a => a.dispatch + "_" + a.cliId) || [])
    const filteredMissions = useMissionFilter({ data: missions || [] })
    const { data: geoloc } = useGeolocationInfo(filteredMissions?.map(m => m.wayniumid) || [])

    const map = useMap();
    useEffect(() => {

        if(!map) return;
        if(!habilitation) return;

        const dispatch = habilitation.subAccounts[0].dispatch;

        switch(dispatch) {
            case "chabe":
                map.setCenter({ lat: 48.8566, lng: 2.3522 })
                map.setZoom(12)
                break;
            case "chabelimited": // London
                map.setCenter({ lat: 51.5074, lng: -0.1278 })
                map.setZoom(10)
                break;
            case "chabese": // Nice/Cannes
                map.setCenter({ lat: 43.7102, lng: 7.2620 })
                map.setZoom(11)
                break;
        }

    }, [map, habilitation])

    const [userSelectionContext, setUserSelectionContext] = useState<any>({
        hasUserMovedMap: false,
        selectedMission: null,
        textfilter: "",
        showTraffic: false,
    });
    const setHasUserMovedMap = (hasUserMovedMap: boolean) => { setUserSelectionContext({ ...userSelectionContext, hasUserMovedMap: hasUserMovedMap }) }
    const setTextFilter = (textfilter: string) => { setUserSelectionContext({ ...userSelectionContext, textfilter: textfilter }) }
    const setOnlyShowCancelled = (onlyShowCancelled: boolean) => { setUserSelectionContext({ ...userSelectionContext, onlyShowCancelled: onlyShowCancelled }) }
    const setOnlyShowMeetGreets = (onlyShowMeetGreets: boolean) => { setUserSelectionContext({ ...userSelectionContext, onlyShowMeetGreets: onlyShowMeetGreets }) }
    const setShowTraffic = (showTraffic: boolean) => { setUserSelectionContext({ ...userSelectionContext, showTraffic: showTraffic }) }
    const setSelectedMission = (missionId: number) => {
        // Scroll to the mission
        document.getElementById("OneMission-" + missionId)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
        // Update the state with the newly selected item and reset the map move flag
        setUserSelectionContext({ ...userSelectionContext, selectedMission: missionId, hasUserMovedMap: false })
    }

    return (

        <UserSelectionContext.Provider value={{ ...userSelectionContext, setSelectedMission, setHasUserMovedMap, setTextFilter, setOnlyShowCancelled, setOnlyShowMeetGreets, setShowTraffic }}>
            <LeftBar missions={filteredMissions || []} geolocations={geoloc || []} />
            <RightMap missions={filteredMissions || []} geolocations={geoloc || []} />
        </UserSelectionContext.Provider>
    )
}
