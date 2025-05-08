import { Card, CardContent, Chip, Avatar, Typography } from "@mui/material"
import { LicencePlate } from "./LicencePlate"
import { DriverName } from "./DriverName"
import { GeolocLostIcon } from "../GeolocLostIcon"

export type MissionLeftPanelProps = {
    isVip?: boolean
    isPmr?: boolean
    luggageCount?: number
    noLocation?: boolean
}

export const MissionLeftPanel = (props: MissionLeftPanelProps) => {
    return (<>

        <Card sx={{ minWidth: 275 }} style={{ marginTop: 5 }}>
            
            <CardContent style={{position: "relative"}}>
                
                {
                    props.noLocation && (
                        <div
                            style={{
                                position: "absolute",
                                top: 55,
                                right: 0,
                            }}
                        >
                            <GeolocLostIcon />
                        </div>
                    )
                }

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                        
                        // 5px space between chips
                        gap: 5,
                    }}
                >
                    {
                        props.isVip && (
                            <Chip
                                avatar={<Avatar>VIP</Avatar>}
                                label="M. DUPONT Jean"
                                style={{ border: 'solid gold 2px' }}
                                size='small'
                            />
                        )
                    }

                    <Chip
                        label="PMR"
                        size='small'
                    />

                    <Chip
                        label="5 bagages"
                        size='small'
                    />
                </div>

                <Typography variant="h5" component="div">
                    Arrivée à 15h00
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Dans 2h 30min
                </Typography>

                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 10,
                }}>

                    <Typography variant="body2">
                        <LicencePlate platenum="AA-000-FF" />
                        <DriverName name="" /><br />
                    </Typography>
                </div>


            </CardContent>
        </Card>

    </>)
}
