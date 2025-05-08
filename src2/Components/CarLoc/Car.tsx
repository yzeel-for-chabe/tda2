import { CarLoc } from "./CarLoc"

export const Car = (props: {

    map?: google.maps.Map

}) => {
    return <CarLoc position={{ lat: 48.8534, lng: 2.3488 }} map={props.map} />
}
