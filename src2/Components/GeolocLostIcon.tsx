
import { BlinkingInfo } from "./BlinkingInfo/BlinkingInfo"
import SensorsOffIcon from '@mui/icons-material/SensorsOff';

export const GeolocLostIcon = () => {
    return (<BlinkingInfo>
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",

                backgroundColor: "rgba(247,255,10, 0.2)",
                padding: 5,
                borderRadius: 5,
            }}
        >
            <SensorsOffIcon />
            Geolocation unavailable<br />
            Position is approximate
        </div>
    </BlinkingInfo>)
}
