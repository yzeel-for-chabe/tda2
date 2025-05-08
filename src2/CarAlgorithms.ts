
export class CarAlgorithms {

    public static decodePolyline(polyline: string): google.maps.LatLng[] {
        return google.maps.geometry.encoding.decodePath(polyline);
    }

    public static decodePolylineFlat(polyline: string): {lat:number,lng:number}[] {
        const r = google.maps.geometry.encoding.decodePath(polyline);
        return r.map((p) => ({lat: p.lat(), lng: p.lng()}));
    }

    public static flat(data: google.maps.LatLng[]): {lat:number,lng:number}[] {
        return data.map((p) => ({lat: p.lat(), lng: p.lng()}));
    }

    public static async getPath(
        origin: string,
        destination: string
    ) {
	    const directionsService = new google.maps.DirectionsService();
        const route = await directionsService.route({
            origin : origin,
            destination : destination,
            travelMode : google.maps.TravelMode.DRIVING
        })

        return route
    }
}
