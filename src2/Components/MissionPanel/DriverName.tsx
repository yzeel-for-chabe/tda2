import { Alert, Backdrop, Link, Snackbar, Typography } from "@mui/material"
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import React from "react";

export const DriverName = (props: { name: string, phone: string }) => {

    const [open, setOpen] = React.useState(false);
    const callTimeout = React.useRef<any>(null);

    const handleClick = () => {
        setOpen(true);

        callTimeout.current = setTimeout(() => {
            // Make phone call
            window.open('tel:' + props.phone, '_blank');
        }, 2000);
    };

    const handleClose = (_event: Event | React.SyntheticEvent<any, Event>, _reason?: string) => {
        setOpen(false);
        clearTimeout(callTimeout.current);
    };

    return (<>

        <Typography variant="body1" component="b">
            {props.name} <br />
            {props.phone}
            <Link href="#" onClick={handleClick}>
                <PhoneEnabledIcon fontSize={"small"}
                    style={{ transform: "translateY(3px)", marginLeft: 5 }}
                />
            </Link>
        </Typography>

        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={open}
            onClick={handleClose}
        >
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
            >
                <Alert
                    onClose={handleClose}
                    severity="info"
                    sx={{ width: '100%' }}
                >
                    
                    <Typography variant="h6" component="div">
                        Calling {props.name}
                    </Typography>

                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Please note that the driver may not be able to answer the phone while driving.
                    </Typography>

                    <Typography variant="body2" style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                    }}>
                        If your browser doesnt support calling, please call
                        <br />
                        <PhoneEnabledIcon fontSize={"small"} />
                        <a href="tel:+33 6 12 34 56 78">+33 6 12 34 56 78</a>
                    </Typography>

                </Alert>
            </Snackbar>
        </Backdrop>
    </>)
}