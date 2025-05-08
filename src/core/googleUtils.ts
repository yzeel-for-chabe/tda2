export interface GoogleRouteV2Result {
  routes: Route[]
  geocodingResults: GeocodingResults
}

export interface Route {
  legs: Leg[]
  distanceMeters: number
  duration: string
  staticDuration: string
  polyline: Polyline3
  description: string
  warnings: string[]
  viewport: Viewport
  travelAdvisory: TravelAdvisory
  localizedValues: LocalizedValues3
  routeToken: string
  routeLabels: string[]
  polylineDetails: PolylineDetails
}

export interface Leg {
  distanceMeters: number
  duration: string
  staticDuration: string
  polyline: Polyline
  startLocation: StartLocation
  endLocation: EndLocation
  steps: Step[]
  localizedValues: LocalizedValues2
}

export interface Polyline {
  encodedPolyline: string
}

export interface StartLocation {
  latLng: LatLng
}

export interface LatLng {
  latitude: number
  longitude: number
}

export interface EndLocation {
  latLng: LatLng2
}

export interface LatLng2 {
  latitude: number
  longitude: number
}

export interface Step {
  distanceMeters: number
  staticDuration: string
  polyline: Polyline2
  startLocation: StartLocation2
  endLocation: EndLocation2
  navigationInstruction: NavigationInstruction
  localizedValues: LocalizedValues
  travelMode: string
}

export interface Polyline2 {
  encodedPolyline: string
}

export interface StartLocation2 {
  latLng: LatLng3
}

export interface LatLng3 {
  latitude: number
  longitude: number
}

export interface EndLocation2 {
  latLng: LatLng4
}

export interface LatLng4 {
  latitude: number
  longitude: number
}

export interface NavigationInstruction {
  maneuver: string
  instructions: string
}

export interface LocalizedValues {
  distance: Distance
  staticDuration: StaticDuration
}

export interface Distance {
  text: string
}

export interface StaticDuration {
  text: string
}

export interface LocalizedValues2 {
  distance: Distance2
  duration: Duration
  staticDuration: StaticDuration2
}

export interface Distance2 {
  text: string
}

export interface Duration {
  text: string
}

export interface StaticDuration2 {
  text: string
}

export interface Polyline3 {
  encodedPolyline: string
}

export interface Viewport {
  low: Low
  high: High
}

export interface Low {
  latitude: number
  longitude: number
}

export interface High {
  latitude: number
  longitude: number
}

export interface TravelAdvisory {}

export interface LocalizedValues3 {
  distance: Distance3
  duration: Duration2
  staticDuration: StaticDuration3
}

export interface Distance3 {
  text: string
}

export interface Duration2 {
  text: string
}

export interface StaticDuration3 {
  text: string
}

export interface PolylineDetails {}

export interface GeocodingResults {}
