
// Namespace GeoHelpers


export interface GoogleResponse {
    geocoded_waypoints: GeocodedWaypoint[]
    routes: Route[]
    status: string
    request: Request
  }
  
  export interface GeocodedWaypoint {
    geocoder_status: string
    place_id: string
    types: string[]
  }
  
  export interface Route {
    bounds: Bounds
    copyrights: string
    legs: Leg[]
    overview_polyline: string
    summary: string
    warnings: any[]
    waypoint_order: any[]
    overview_path: OverviewPath[]
  }
  
  export interface Bounds {
    south: number
    west: number
    north: number
    east: number
  }
  
  export interface Leg {
    distance: Distance
    duration: Duration
    end_address: string
    end_location: EndLocation
    start_address: string
    start_location: StartLocation
    steps: Step[]
    traffic_speed_entry: any[]
    via_waypoint: any[]
    via_waypoints: any[]
  }
  
  export interface Distance {
    text: string
    value: number
  }
  
  export interface Duration {
    text: string
    value: number
  }
  
  export interface EndLocation {
    lat: number
    lng: number
  }
  
  export interface StartLocation {
    lat: number
    lng: number
  }
  
  export interface Step {
    distance: Distance2
    duration: Duration2
    end_location: EndLocation2
    polyline: Polyline
    start_location: StartLocation2
    travel_mode: string
    encoded_lat_lngs: string
    path: Path[]
    lat_lngs: LatLng[]
    instructions: string
    maneuver: string
    start_point: StartPoint
    end_point: EndPoint
  }
  
  export interface Distance2 {
    text: string
    value: number
  }
  
  export interface Duration2 {
    text: string
    value: number
  }
  
  export interface EndLocation2 {
    lat: number
    lng: number
  }
  
  export interface Polyline {
    points: string
  }
  
  export interface StartLocation2 {
    lat: number
    lng: number
  }
  
  export interface Path {
    lat: number
    lng: number
  }
  
  export interface LatLng {
    lat: number
    lng: number
  }
  
  export interface StartPoint {
    lat: number
    lng: number
  }
  
  export interface EndPoint {
    lat: number
    lng: number
  }
  
  export interface OverviewPath {
    lat: number
    lng: number
  }
  
  export interface Request {
    origin: Origin
    destination: Destination
    travelMode: string
  }
  
  export interface Origin {
    location: Location
  }
  
  export interface Location {
    lat: number
    lng: number
  }
  
  export interface Destination {
    location: Location2
  }
  
  export interface Location2 {
    lat: number
    lng: number
  }
  