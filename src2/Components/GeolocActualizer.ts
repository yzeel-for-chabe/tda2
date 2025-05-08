
class CGeolocActualizer {

    interval: any;

    hi() {
        console .log('hi');
    }

    constructor() {
        this.interval = setInterval(() => {
            this.actualize();
        }, 1000);
    }

    actualize() {
        window.postMessage({
            type: 'geolocation',
            target: {
                missionId: 1,
            },
            payload: {
                latitude: 48.8566,
                longitude: 2.3522
            }
        })
    }

}

export const GeolocActualizer = new CGeolocActualizer();
