
import { paths } from "../../generated/openapi"
type Mission = paths["/v1/missions/filter"]["post"]["responses"]["200"]["content"]["application/json"][number]

// Finally this thing is not that useful
// Since this applies to all (both imminent and not imminent) missions
// And there's not too many missions we want to hide besides the ones already hidden serverside
// It could be useful so i keep it here but probably never gonna be used

export const useMissionFilter = ( { data }: { data: Mission[] } ) => {

    return data
        // .filter(m => (m.status < 8) && (m.status > 4)) // 8 = mission completed, 0 = mission canceled or no information
}
