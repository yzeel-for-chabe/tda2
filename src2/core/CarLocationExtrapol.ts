import { getPositionFromElapsedTime, PolylineSegment } from "./GMapsQ";

export const ExtrapolFromLocAndTime = async (
    loc: { lat: number; lng: number },
    dest: { lat: number; lng: number },
    time: Date
) => {

    // Check if date is correct
    if (isNaN(time.getTime())) {
        return new Error("Invalid date");
    }

    const t = time.toISOString() 
    const req = "https://rct.tda2.chabe.com/api/gmapsbypass/from/"
            +`${loc.lat},${loc.lng}`
            +"/to/"
            +`${dest.lat},${dest.lng}`
            +"/starttime/"
            +t


        const polylinest = await (await fetch(req)).text()
        const polylines = JSON.parse(polylinest) as PolylineSegment[]
    
        const loc_within_poly = getPositionFromElapsedTime(
            polylines,
            (new Date().getTime() - time.getTime()) / 1000
        )

		let tottime = 0
		let remtime = 0
		try {
			tottime = new Date(polylines[polylines.length - 1].endTime).getTime() - new Date(polylines[0].startTime).getTime()
			remtime = tottime - (new Date().getTime() - time.getTime())
		} catch {
			tottime = -1
		}
    
        return {
            polylines,
            loc_within_poly,
			totalTime: tottime / 1000 /60,
			remainingTime: remtime
		}

}
