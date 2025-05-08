
export type Vec2d = [number, number];

export type GglPathInfoAtTime_t = {
    roadname: string;
    polylinepos: string; // To be parsed by GeoHelpers.decode_polyline()
    expected_remaining_time?: number;
    percent_of_current_path?: number;
    ETA_in_seconds?: number;
}

export class GeolocExtrapolationComputer {

    // Data
    data: google.maps.DirectionsResult;
    is_ok: boolean;

    // Time information
    mTimeInfo: {time_end: number, data: GglPathInfoAtTime_t}[] = [];

    constructor(
        json: google.maps.DirectionsResult,
        options = {
            compute_timeinfo_at_init: true,
        },
    ) {

        try {
            this.data = json;
            this.is_ok = true;

            console.log("JSON^=", json)
        } catch (e: any) {
            this.is_ok = false;
            throw new Error(`GglPathResponse: ${e.message}`);
        }

        if(options.compute_timeinfo_at_init)
        {
            console.log("Will build time info")
            this._build_time_info();
        }
    }

    /**
     * Builds time information for the current route.
     * @private
     * @returns {void}
     */
    private _build_time_info(): void {

        console.log(this.data)

        const full_time = this.data.routes[0]?.legs[0]?.duration?.value || 0;

        let time = 0;
        for (const step of this.data.routes[0].legs[0].steps) {
            const duration = step.duration?.value || 0;
            time += duration;
            this.mTimeInfo.push({
                time_end: time,
                data: {
                    roadname: "",
                    polylinepos: step.encoded_lat_lngs || "",
                    expected_remaining_time: full_time - time,
                    percent_of_current_path: 0, // To be defined when a time is provided
                },
            });
        }
    }

    private _info_at_time_compute_percent_of_current_path(current_step_index: number, time: number): number {
        const time_of_this_step = time - this.mTimeInfo[current_step_index - 1].time_end;
        const time_of_next_step = this.mTimeInfo[current_step_index].time_end - this.mTimeInfo[current_step_index - 1].time_end;
        const percent_of_this_step = time_of_this_step / time_of_next_step;

        return percent_of_this_step * 100;
    }

    private _info_at_time_compute_ETA_full(_current_step_index: number, time: number): number {
        const total_time_in_seconds = this.data.routes[0].legs[0].duration?.value || 0;

        return total_time_in_seconds - time;
    }

    public info_at_time(time: number): GglPathInfoAtTime_t | undefined {

        if(!this.mTimeInfo.length)
        {
            console.warn(`GglPathResponse: No time information available. Did you set the option compute_timeinfo_at_init to true?`);
            console.log("Calculating time information now. You should set the option compute_timeinfo_at_init to true to save time.");
            this._build_time_info();
        }

        let current_step_index = this.mTimeInfo.findIndex((t) => t.time_end >= time);

        if(current_step_index === -1 || current_step_index >= this.mTimeInfo.length)
        {
            console.warn(`GglPathResponse: Time ${time} is out of bounds, biggest time is ${this.mTimeInfo[this.mTimeInfo.length - 1].time_end}`);
            current_step_index = this.mTimeInfo.length - 1;
        }

        console.log({mTimeInfo: this.mTimeInfo, current_step_index, time})
        const info = this.mTimeInfo[current_step_index].data;

        try {
            info.percent_of_current_path = this._info_at_time_compute_percent_of_current_path(current_step_index, time);
        } catch (e: any) { console.warn(`GglPathResponse: ${e.message}`); }

        try {
            info.ETA_in_seconds = this._info_at_time_compute_ETA_full(current_step_index, time);
        } catch (e: any) { console.warn(`GglPathResponse: ${e.message}`); }

        return info;
    }

}

