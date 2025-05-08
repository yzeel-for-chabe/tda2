export function searchValueInObject(obj: object, searchValue: string) {
    let found = false;
    const searchStr = String(searchValue).toLowerCase();

    function recursiveSearch(currentObj: object) {
        if (found) return; // Exit early if found
        for (let key in currentObj) {
            if (currentObj.hasOwnProperty(key)) {
                const value = currentObj[key];
                if (typeof value === 'string' && value.toLowerCase().includes(searchStr)) {
                    found = true;
                    return;
                }
                if (typeof value === 'object' && value !== null) {
                    recursiveSearch(value);
                    if (found) return; // Exit early if found
                }
                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        if (typeof value[i] === 'string' && value[i].toLowerCase().includes(searchStr)) {
                            found = true;
                            return;
                        }
                        if (typeof value[i] === 'object' && value[i] !== null) {
                            recursiveSearch(value[i]);
                            if (found) return; // Exit early if found
                        }
                    }
                }
            }
        }
    }

    recursiveSearch(obj);
    return found;
}