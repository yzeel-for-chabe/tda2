
export function children_flattener<T extends {children?: T[]}>(
	o: T[]
): T[] {
	let result: T[] = []

	o.forEach((obj) => {
		if(obj.children && Array.isArray(obj.children)) {
			result.push(obj)
			result = result.concat(children_flattener(obj.children))
		}
	})

	return result
}
