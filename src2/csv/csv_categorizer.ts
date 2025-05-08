
export type CsvCategorizerCtorOptions = {
	colSeparator: string;
	rowSeparator: string;
	hasHeader?: boolean;
}
const CsvCategorizerDefaultOptions: CsvCategorizerCtorOptions = {
	colSeparator: ',',
	rowSeparator: '\n',
	hasHeader: true
}

export class CsvCategorizer<T> {

	private data: T[];

	get length(): number {
		return this.data.length;
	}
	
	get top(): T[] {
		return this.data.slice(0, 10);
	}

	public constructor(csvdata: string, options: CsvCategorizerCtorOptions = CsvCategorizerDefaultOptions) {

		const lines = csvdata.split(options.rowSeparator);
		
		const header = lines.shift();

		const columns = header ? header.split(options.colSeparator) : [];
		const data: T[] = [];

		for (const line of lines) {
			const values = line.split(options.colSeparator);
			const obj: any = {};
			for (let i = 0; i < columns.length; i++) {
				obj[columns[i].replace(/\s/, '')] = (values[i] || "").replace('\r', '');
			}
			data.push(obj);
		}

		this.data = data;
	}

	public factory<O extends any[], X = T[]>(
		predicate: (obj: T, ...params: O) => boolean,
		transform: (obj: T[]) => X = (obj: T[]) => obj as unknown as X
	): (...params: O) => X {
		return (...params: O) => {
			const filtered = this.data.filter(obj => predicate(obj, ...params));
			const transformed = transform(filtered);
			return transformed;
		}
	}

}
