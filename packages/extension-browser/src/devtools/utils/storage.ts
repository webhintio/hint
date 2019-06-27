/* istanbul ignore next*/
export const getItem = (key: string): any => {
    const value = localStorage.getItem(key);

    try {
        return value ? JSON.parse(value) : undefined;
    } catch (e) {
        console.warn(`Ignoring malformed value: ${value}`);

        return undefined;
    }
};

/* istanbul ignore next*/
export const setItem = (key: string, value: any): void => {
    localStorage.setItem(key, JSON.stringify(value));
};
