import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useRef, useState } from 'react';
import { TrafficLayer } from './TrafficLayer';
import { CarLocationManager } from '../core/CarLocationManager/manager';
import React from 'react';

const getCenter = () => {
    switch (CarLocationManager.first_dispatch) {
        case 'chabe':
            return { lat: 48.8566, lng: 2.3522 }; // Paris
        case 'chabelimited':
            return { lat: 51.5074, lng: -0.1278 }; // London
        default:
            return { lat: 48.8566, lng: 2.3522 }; // Default to Paris
    }
};

export const MapEx = (props: {
    center: { lat: number, lng: number },
    children: JSX.Element | JSX.Element[],
    ondragstart: () => void,
}) => {
    const children = Array.isArray(props.children) ? props.children : [props.children];
    const tiltRef = useRef<NodeJS.Timeout | null>(null);
    const [selectedMission, setSelectedMission] = useState<number | null>(null); // New state

    const handleMissionClick = (index: number, mission: MissionT) => {
        setSelectedMission(mission.id);
    };

    return (
        <APIProvider apiKey={'AIzaSyDp4CFGl9RpEloPpG7A-i2o_RRfGeCpVN8'}>
            <Map
                mapId={'f375369fdfba970b'}
                defaultZoom={10}
                defaultCenter={getCenter()}
                onCameraChanged={(event: MapCameraChangedEvent) => {
                    console.log('Camera changed:', event);
                }}
                onCenterChanged={() => {
                    console.log("Center changed");
                }}
                onDragstart={() => {
                    props.ondragstart();
                }}
            >
                <TrafficLayer />
                {children.map((Child) => 
                    React.cloneElement(Child, {
                        onClicked: handleMissionClick,
                        isSelected: Child.props.mission && selectedMission === Child.props.mission.MIS_ID,
                    })
                )}
            </Map>
        </APIProvider>
    );
};
