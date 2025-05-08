
import { test } from 'bun:test'
import * as fs from 'fs'
import s from "./servicetypes.csv"
import { CsvCategorizer } from './csv_categorizer'

type ServiceTypesT = {
	// ID;Code ERP;Libelle ERP;Group;Group 2;Show Dispatch Column Actions
	ID: string
	CodeERP: string
	LibelleERP: string
	Group: string
	Group2: string
	Dispatch: string
}

test('csv_categorizer', async () => {

	// Read the file
	const data = await fs.promises.readFile(s, 'utf-8')

	// Parse the CSV
	const c = new CsvCategorizer<ServiceTypesT>(data, {colSeparator:';', rowSeparator:'\r\n'})

	// Create a parametric function that will query the data later
	const isTimeBased = c.factory(
		// First filter the data to get the desired row
		(obj, code, erp) => obj.ID === code && obj.Dispatch === erp,
		// Then transform the data to extract the information
		obj => obj && obj.length == 1 && obj[0].Group2 == 'Time Based'
	)

	// :)
	console.log(
		isTimeBased('22', 'chabe')
	)

})
