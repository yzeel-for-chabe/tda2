import { Dialog, DialogContent, DialogContentText, DialogTitle, Icon } from "@mui/material";
import {InfoOutlined} from "@mui/icons-material"
import { useState } from "react";

export const InfoMissionsDialog = () => {

    const [open, setOpen] = useState(false);

    return <>
        <Dialog open={open} onClose={() => setOpen(false)} style={{padding: 10}}>
            <DialogTitle>Quelles missions sont affichées</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Les missions du jour sont filtrées par date de début de mission, et sont affichées en fonction
                    de plusieurs critères.
                    <br />
                    <br />
                    Pour des raisons de lisibilité, sont masquées :
                    <ul>
                        <li>Les missions indiquées "terminées" par le chauffeur</li>
                        <li>Les missions dont l'heure de fin est dépassée de plus d'une heure</li>
                        <li>Les missions annulées</li>
                        <li>Les missions sans heure de début ou de fin</li>
                    </ul>
                </DialogContentText>
            </DialogContent>
        </Dialog>
        <InfoOutlined style={{cursor:"help", transform: 'translateY(7px) translateX(5px)'}} onClick={() => setOpen(true)} />
    </>

}
