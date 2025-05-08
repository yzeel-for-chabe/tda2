
import * as turf from '@turf/turf'

export const polyline_to_turflinestring = (polyline: google.maps.Polyline) => {
    return turf.lineString(polyline.getPath().getArray().map(latLng => [latLng.lat(), latLng.lng()]))
}
