
export const polyline_and_percent_to_subpolyline = (
    polyline: string,
    percent: number, // 0 <= percent <= 100
): { start: google.maps.LatLng, end: google.maps.LatLng } => {
    const decoded_polyline = google.maps.geometry.encoding.decodePath(polyline);

    // Search for the segment at the given percent, among all the segments of the polyline.

    percent=percent/100;

    let total_length = 0;
    for (let i = 0; i < decoded_polyline.length - 1; i++) {
        const p1 = decoded_polyline[i];
        const p2 = decoded_polyline[i + 1];
        total_length += google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
    }

    let current_length = 0;
    for (let i = 0; i < decoded_polyline.length - 1; i++) {
        const p1 = decoded_polyline[i];
        const p2 = decoded_polyline[i + 1];
        const segment_length = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
        const segment_percent = segment_length / total_length;
        if (current_length + segment_percent >= percent) {
            const remaining_percent = percent - current_length;
            const remaining_length = remaining_percent * total_length;
            const heading = google.maps.geometry.spherical.computeHeading(p1, p2);
            const start = p1;
            const end = google.maps.geometry.spherical.computeOffset(p1, remaining_length, heading);
            return { start, end };
        }
        current_length += segment_percent;
    }

    // If we reach this point, it means that the percent is 100%.
    // Return the last segment of the polyline.
    const start = decoded_polyline[decoded_polyline.length - 2];
    const end = decoded_polyline[decoded_polyline.length - 1];
    return { start, end };
}

export const polyline_and_percent_to_latlng = (
    polyline: string,
    percent: number, // 0 <= percent <= 100
): google.maps.LatLng => {
    const decoded_polyline = google.maps.geometry.encoding.decodePath(polyline);

    // Search for the point at the given percent, among all the points in any of the
    // segments of the polyline.

    percent=percent/100;

    let total_length = 0;
    for (let i = 0; i < decoded_polyline.length - 1; i++) {
        const p1 = decoded_polyline[i];
        const p2 = decoded_polyline[i + 1];
        total_length += google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
    }

    let current_length = 0;
    for (let i = 0; i < decoded_polyline.length - 1; i++) {
        const p1 = decoded_polyline[i];
        const p2 = decoded_polyline[i + 1];
        const segment_length = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
        const segment_percent = segment_length / total_length;
        if (current_length + segment_percent >= percent) {
            const remaining_percent = percent - current_length;
            const remaining_length = remaining_percent * total_length;
            const heading = google.maps.geometry.spherical.computeHeading(p1, p2);
            const result = google.maps.geometry.spherical.computeOffset(p1, remaining_length, heading);
            return result;
        }
        current_length += segment_percent;
    }

    // If we reach this point, it means that the percent is 100%.
    // Return the last point of the polyline.
    return decoded_polyline[decoded_polyline.length - 1];


    
}

