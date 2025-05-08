import { useState } from "react";
import { MissionT } from "../App";

export function useBusinessSearch(initialItems: MissionT[]) {
	// ...existing code (if any)...
	const [search, setSearch] = useState("");

	if(search === "") return { search, setSearch, filteredData: initialItems };

	const filteredData = initialItems.filter((item) => {
		const searchTerm = search.toLowerCase();
		const fields = [
			item.chauffeur_name,
			item.license_plate,
			item.locations.from,
			item.locations.to,
			item.w.MIS_HEURE_DEBUT,
			item.w.MIS_HEURE_FIN,
			item.car_brand,
			item.w.MIS_STATUT,
			item.passenger
		];
		return fields.some((field) => field?.toLowerCase().includes(searchTerm));
	});

	return { search, setSearch, filteredData };
}