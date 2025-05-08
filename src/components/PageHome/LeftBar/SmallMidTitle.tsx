import { FormControlLabel, FormGroup, Input, Switch, ToggleButton } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useUserSelectionContext } from "../RightMap/UserSelectionContext"

const MidTitleWithSearch = (props: {
	includeToggles: boolean
}) => {

	const { t } = useTranslation()
	const userSelection = useUserSelectionContext()

	if (!userSelection) return null;

	return (
		<>
			<FormGroup>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						marginBottom: 10,
					}}
				>
					<Input
						style={{ flex: 1 }}
						placeholder={t("search")}
						value={userSelection.textfilter}
						onChange={(e) => {
							userSelection.setTextFilter(e.target.value)
						}}
					/>

					{
						props.includeToggles &&
						<>
							<FormControlLabel
								control={
									<Switch
										checked={userSelection.onlyShowMeetGreets}
										onChange={(e) =>
											userSelection.setOnlyShowMeetGreets(
												e.target.checked
											)
										}
									/>
								}
								label={t("showGreetings")}
							/>
							<FormControlLabel
								control={
									<Switch
										checked={userSelection.onlyShowCancelled}
										onChange={(e) =>
											userSelection.setOnlyShowCancelled(
												e.target.checked
											)
										}
									/>
								}
								label={t("showCompletedMissions")}
							/>
						</>
					}

				</div>
			</FormGroup>

		</>
	)
}

export const MidTitle = (props: {
	increasedMiddleSize: boolean,
	setIncreasedMiddleSize: (increasedMiddleSize: boolean) => void,
}) => {

	const userSelection = useUserSelectionContext()
	const { t } = useTranslation()

	return (
		<div className="midtitle">
			<div style={{ marginBottom: 10 }}>
				<ToggleButton
					className="toggle-button"
					value="check"
					title={props.increasedMiddleSize
						? t("showImminentArrivals")
						: t("showAllMissions")}
					selected={props.increasedMiddleSize}
					onChange={() =>
						props.setIncreasedMiddleSize(
							!props.increasedMiddleSize
						)
					}
					style={{
						marginTop: 10,
						transition: "* 0.5s",
						fontFamily: "EuclidCircularA-Semibold",

						borderRadius: 0,
						backgroundColor: "#001c40",
						color: 'white'
					}}
				>
					{props.increasedMiddleSize
						? t("showImminentArrivals")
						: t("showAllMissions")}
				</ToggleButton>
			</div>
			<h1
				style={{
					whiteSpace: "nowrap",
					overflow: props.increasedMiddleSize
						? "hidden"
						: undefined,
					fontFamily:
						"EuclidCircularA-Semibold,-apple-system,BlinkMacSystemFont,sans-serif",
				}}
			>
				{props.increasedMiddleSize
					? t("allMissions")
					: t("imminentArrivals")}
				<br />

				<MidTitleWithSearch includeToggles={props.increasedMiddleSize} />

			</h1>
		</div>
	)
}