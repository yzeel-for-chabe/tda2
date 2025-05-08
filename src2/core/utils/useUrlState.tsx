import { useEffect, useState } from "react";

function useUrlState<T> (name: string, defaultValue: T, validate: (value: string) => boolean = () => true) {
    const [value, setValue] = useState<T>(defaultValue);
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlValue = urlParams.get(name);
        if (urlValue) {

            // Validate the value
            if(!validate(urlValue)) {
                setValue(defaultValue);
                return;
            }

            // Do not parse strings and numbers
            if(typeof defaultValue === 'string' || typeof defaultValue === 'number') {
                setValue(urlValue as unknown as T);
                return;
            }

            // Complex cases must be parsed
            setValue(JSON.parse(urlValue));
        }
    }, [name]);
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        // Remove the parameter from the URL if the value is the default value
        if(value === defaultValue) {
            urlParams.delete(name);
            window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);
            return;
        }

        // Do not stringify strings and numbers
        if(typeof value === 'string' || typeof value === 'number') {
            urlParams.set(name, value.toString());
            window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);
            return;
        }

        // Complex cases must be stringified
        urlParams.set(name, JSON.stringify(value));
        window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);
        
    }, [name, value]);
    
    return [value, setValue] as const;
};

    
export default useUrlState;
