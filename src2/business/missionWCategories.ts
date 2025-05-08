
import { CsvCategorizer } from "../csv/csv_categorizer"

type ServiceTypesT = {
	// ID;Code ERP;Libelle ERP;Group;Group 2;Show Dispatch Column Actions
	ID: string
	CodeERP: string
	LibelleERP: string
	Group: string
	Group2: string
	Dispatch: string
}

const text = await (await fetch('/public/servicetypes.csv')).text()
const c = new CsvCategorizer<ServiceTypesT>(text, {colSeparator:';', rowSeparator:'\n'})

// alert(c.top)

export const isWMissionTimeBased = c.factory(
	// First filter the data to get the desired row
	(obj, code, erp) => {
		const r = obj.ID === code && obj.Dispatch === erp
		return r
	},
	// Then transform the data to extract the information
	obj => {
		return obj && obj.length == 1 && obj[0].Group2 == 'Time Based'
	}
)

export const isWMissionMeetGreet = c.factory(
	// First filter the data to get the desired row
	(obj, code, erp) => obj.ID === code && obj.Dispatch === erp,
	// Then transform the data to extract the information
	obj => obj && obj.length == 1 && obj[0].Group2 == 'Meet & Greet'
)
