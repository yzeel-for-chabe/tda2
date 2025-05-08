import { MissionInfo } from "./types";
import { ExtrapolFromLocAndTime } from "../CarLocationExtrapol";
import { mstohuman } from "./utils";

export class MissionProcessor {
    static async updateGeolocationInformation(mission: MissionInfo, locations: any[], lastReceivedLocation: any[]) {
        if(mission.do_not_compute) {
            mission.debug = "do_not_compute";
            return;
        }

        if(mission.acc) {
            mission.information = "Accueil";
            return;
        }

        // ...existing _update_geolocation_information code...
    }

    static cleanMissions(missions: MissionInfo[]): MissionInfo[] {
        // ...existing _cleanMissions code...
        return missions;
    }

    static async getMissions(clients: any[]): Promise<MissionInfo[]> {
        // ...existing _getMissions code...
    }

    static mergeMissions(newMissions: MissionInfo[], oldMissions: MissionInfo[]): MissionInfo[] {
        // ...existing _mergeMissions code...
        return newMissions;
    }
}
