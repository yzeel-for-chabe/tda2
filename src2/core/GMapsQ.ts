import axios from "axios";

export async function getPolylinesWithTimes(
  apiKey: string,
  origin: string,
  destination: string,
  startTime: Date
): Promise<PolylineSegment[]> {
  const endpoint = "https://maps.googleapis.com/maps/api/directions/json";

    // If starttime is in the past, set it to 24h later (same time the next day)
    //  because the API will return an error if the starttime is in the past
    const addedTime = startTime.getTime() < Date.now() ? 24 * 60 * 60 * 1000 : 0;
    startTime = new Date(startTime.getTime() + addedTime);

  // Convert startTime to UNIX timestamp
  const departureTime = Math.floor(startTime.getTime() / 1000);

  // API request parameters
  const params = {
    origin,
    destination,
    key: apiKey,
    departure_time: departureTime,
    mode: "driving",
  };

  try {
    // Make the API call
    const response = await axios.get(endpoint, { params });
    const data = response.data;

    // Check for API errors
    if (data.status !== "OK") {
      console.warn(`GMapsQ:getPolylinesWithTimes(from: ${origin}, to: ${destination}, at: ${startTime})`, data);
      throw new Error(`API Error: ${data.status} - ${data.error_message || ""}`);
    }

    // Parse the response
    const route = data.routes[0]; // First route
    const steps = route.legs[0].steps; // Steps within the first leg

    let currentTime = startTime;
    const segments: PolylineSegment[] = [];

    for (const step of steps) {
      const polyline = step.polyline.points; // Encoded polyline
      const durationSeconds = step.duration.value; // Duration in seconds

      const endTime = new Date(currentTime.getTime() + durationSeconds * 1000); // Calculate end time

      // Add the segment to the result
      segments.push({
        polyline,
        startTime: new Date(currentTime),
        endTime,
      });

      // Update currentTime for the next step
      currentTime = endTime;
    }

    return segments;
  } catch (error: any) {
    console.error("Error fetching directions:", error.message);
    throw error;
  }
}

import polyline from "@mapbox/polyline"; // To decode polylines. Install with `npm install @mapbox/polyline`

export type PolylineSegment = {
  polyline: string;
  startTime: Date;
  endTime: Date;
}

interface Position {
  polylineNumber: number;
  pos: { lat: number; lng: number };
}

export function getPositionFromElapsedTime(
  polylinesWithTimes: PolylineSegment[],
  elapsedSeconds: number
): Position | null {
  let cumulativeTime = 0;


  for (let i = 0; i < polylinesWithTimes.length; i++) {
    const segment = polylinesWithTimes[i];
    const segmentStartTime = new Date(segment.startTime).getTime() / 1000; // Convert to seconds
    const segmentEndTime = new Date(segment.endTime).getTime() / 1000; // Convert to seconds
    const segmentDuration = segmentEndTime - segmentStartTime;

    // Check if the elapsed time is within this segment
    if (elapsedSeconds >= cumulativeTime && elapsedSeconds < cumulativeTime + segmentDuration) {
      // Decode the polyline to get coordinates
      const decodedPoints = polyline.decode(segment.polyline);

      // Calculate fraction of the time spent in this segment
      const timeInSegment = elapsedSeconds - cumulativeTime;
      const fraction = timeInSegment / segmentDuration;

      // Find the approximate position based on the fraction
      const totalPoints = decodedPoints.length;
      const pointIndex = Math.floor(fraction * (totalPoints - 1));
      const nextPointIndex = Math.min(pointIndex + 1, totalPoints - 1);

      const currentPoint = decodedPoints[pointIndex];
      const nextPoint = decodedPoints[nextPointIndex];

      // Interpolate between the two points
      const lat =
        currentPoint[0] + (nextPoint[0] - currentPoint[0]) * (fraction * (totalPoints - 1) - pointIndex);
      const lng =
        currentPoint[1] + (nextPoint[1] - currentPoint[1]) * (fraction * (totalPoints - 1) - pointIndex);

      return {
        polylineNumber: i,
        pos: { lat, lng },
      };
    }

    // Add the duration of this segment to the cumulative time
    cumulativeTime += segmentDuration;
  }

  // If elapsed time exceeds the total duration
  // Return the last point of the last polyline
  const lastSegment = polylinesWithTimes[polylinesWithTimes.length - 1];
  const lastDecodedPoints = polyline.decode(lastSegment.polyline);
  const lastPoint = lastDecodedPoints[lastDecodedPoints.length - 1];

  return {
    polylineNumber: polylinesWithTimes.length - 1,
    pos: { lat: lastPoint[0], lng: lastPoint[1] },
  };
}

// Example usage
const polylinesWithTimes: PolylineSegment[] = [
  {
    polyline: "as{~Fhgc|UPCd@qBl@wB",
    startTime: new Date("2024-11-27T10:00:00"),
    endTime: new Date("2024-11-27T10:03:00"),
  },
  {
    polyline: "ulr~Flmc|VQb@gC",
    startTime: new Date("2024-11-27T10:03:00"),
    endTime: new Date("2024-11-27T10:07:00"),
  },
];

// const elapsedSeconds = 180; // Example: 180 seconds after the journey started

// const position = getPositionFromElapsedTime(polylinesWithTimes, elapsedSeconds);

// if (position) {
//   console.log(`Car is on polyline ${position.polylineNumber}`);
//   console.log(`Position: Latitude = ${position.pos.lat}, Longitude = ${position.pos.lng}`);
// } else {
//   console.log("Elapsed time exceeds the total journey time.");
// }

// // Example usage
// (async () => {
//   const API_KEY = "AIzaSyDy00hN3E5T624ncCFNvbzAqROGoXcpmuk";
//   const origin = "Paris, France";
//   const destination = "Lyon, France";
//   const startTime = new Date(); // Start time is now

//   try {
//     const segments = await getPolylinesWithTimes(API_KEY, origin, destination, startTime);

//     segments.forEach((segment, index) => {
//       console.log(`Segment ${index + 1}`);
//       console.log(`Polyline: ${segment.polyline}`);
//       console.log(`Start Time: ${segment.startTime}`);
//       console.log(`End Time: ${segment.endTime}`);
//       console.log("-".repeat(30));
//     });
//   } catch (error) {
//     console.error("Failed to calculate segments:", error.message);
//   }
// })();
