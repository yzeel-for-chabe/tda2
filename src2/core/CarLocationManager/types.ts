import { Root } from "../waynium";

export interface ClientInfo {
    limo: string;
    name: string;
}

export interface MissionInfo {
    w: Root;
    acc: boolean;
    mad: boolean;
    information?: string;
    refresh_after?: Date;
    cache_polylines?: any;
    debug?: string;
    do_not_compute?: boolean;

	remainingStr?: string;
}

export interface LocationInfo {
    missionId: string;
    lastRefresh: Date;
    lastRealData?: Date;
    location: { lng: number, lat: number };
}

export interface LastReceivedLocationInfo {
    missionId: string;
    lng: number;
    lat: number;
    time: Date;
}
