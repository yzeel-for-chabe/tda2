import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { paths } from "../../../../generated/openapi"
import { useTranslation } from "react-i18next";
import { useUserSelectionContext } from "../RightMap/UserSelectionContext";
import { searchValueInObject } from "../../../core/searchValueInObject";

export const LeftBarBig = (props: {
    missions: paths["/v1/missions/filter"]["post"]["responses"]["200"]["content"]["application/json"]
}) => {

    const { t } = useTranslation()
    const userSelection = useUserSelectionContext()

    return (
        <>
            <TableContainer component={Paper} style={{ overflowY: 'visible' }}>
                <Table
                    sx={{ minWidth: 650 }}
                    aria-label="simple table"
                    style={{ fontFamily: "EuclidCircularA-Regular" }}
                >
                    <TableHead
                        style={{
                            boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.1)",
                        }}
                    >
                        <TableRow>
                            <TableCell style={{ width: "15%" }} align="left">
                                <b>{t("passenger")}</b>
                            </TableCell>
                            <TableCell style={{ width: "10%" }} align="left">
                                <b>{t("time")}</b>
                            </TableCell>
                            <TableCell style={{ width: "15%" }} align="right">
                                <b>{t("pickup")}</b>
                            </TableCell>
                            <TableCell style={{ width: "15%" }} align="right">
                                <b>{t("dropoff")}</b>
                            </TableCell>
                            <TableCell style={{ width: "10%" }} align="right">
                                <b>{t("vehicle")}</b>
                            </TableCell>
                            <TableCell style={{ width: "10%" }} align="right">
                                <b>{t("chauffeur")}</b>
                            </TableCell>
                            <TableCell style={{ width: "10%" }} align="right">
                                <b>{t("status")}</b>
                            </TableCell>

                        </TableRow>
                    </TableHead>

                    <TableBody
                        style={{
                            maxHeight: "60vh",
                            overflow: 'auto'
                        }}
                    >
                        {
                            props.missions
                                .filter(m => {

                                    // We dont immediately return to allow for stacking filters
                                    let shouldShow = true;

                                    // Status filter rules
                                    if (userSelection.onlyShowCancelled && (m.status != 8 && m.status != 20)) {
                                        // If we only want to show cancelled missions, we should not show any other status
                                        shouldShow = false;
                                    } else if (!userSelection.onlyShowCancelled && (m.status == 8 || m.status == 20)) {
                                        // If we don't want to show cancelled missions, we should not show any cancelled mission
                                        shouldShow = false;
                                    }

                                    // Meet & Greet filter rules
                                    if (userSelection.onlyShowMeetGreets && m.type != 'MEET_GREET') {
                                        shouldShow = false;
                                    } else if (!userSelection.onlyShowMeetGreets && m.type == 'MEET_GREET') {
                                        shouldShow = false;
                                    }

                                    // Text filter rules
                                    const matching = (searchValueInObject(m, userSelection.textfilter || ""))
                                    if (!matching) {
                                        shouldShow = false;
                                    }

                                    return shouldShow;
                                })
                                .sort((a, b) => {
                                    if (a.startTime < b.startTime) return -1
                                    if (a.startTime > b.startTime) return 1
                                    return 0
                                })
                                .map((row, idx) => (
                                    <TableRow
                                        key={idx}
                                        sx={{
                                            "&:last-child td, &:last-child th":
                                                { border: 0 },
                                        }}
                                        style={{
                                            backgroundColor:
                                                idx % 2 == 0
                                                    ? "#f0f0f0"
                                                    : "white",
                                        }}
                                    >
                                        <TableCell
                                            title={row.wayniumid}
                                            component="th"
                                            scope="row"
                                        >
                                            { /* Passengers */}
                                            {row.passengers[0]?.name || t("unknownPassenger")}
                                        </TableCell>
                                        <TableCell align="left">
                                            <div>
												{
													new Date(row.date.substring(0,10) + "T" + row.startTime + ":00").toLocaleTimeString().substring(0,5)
												}
                                                {/* {(row.startTime || "")?.substring(0, 5)} */}
                                            </div>
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.locations[0]?.name}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.locations[row.locations.length - 1]?.name}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.vehicle.plate} <br /> {row.vehicle.brand}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.chauffeur.firstname}{" "}
                                            {row.chauffeur.lastname}
                                            <br />
                                            {row.chauffeur.phone}
                                        </TableCell>
                                        <TableCell align="right">
                                            {/* {row.w.MIS_SMI_ID == "7" ? "Passager à bord" : "/"} */}
                                            {/* {t(parseStatusFromRequest(row.w))} */}
                                            {t("status." + row.status)}
                                        </TableCell>

                                    </TableRow>
                                ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}
