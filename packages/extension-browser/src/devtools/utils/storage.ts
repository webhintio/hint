let storage: Pick<Storage, 'getItem' | 'setItem'>;

try {
    storage = {
        getItem: localStorage.getItem.bind(localStorage),
        setItem: localStorage.setItem.bind(localStorage)
    };
} catch (error) {
    console.warn(`LocalStorage not available, falling back to in-memory storage: ${error}`);
    const cache = new Map<string, string>();

    storage = {
        getItem (key) {
            return cache.get(key) || null;
        },
        setItem (key, value) {
            cache.set(key, value);
        }
    };
}

/* istanbul ignore next*/
export const getItem = (key: string): any => {
    const value = storage.getItem(key);

    try {
        return value ? JSON.parse(value) : undefined;
    } catch (e) {
        console.warn(`Ignoring malformed value: ${value}`);

        return undefined;
    }
};

/* istanbul ignore next*/
export const setItem = (key: string, value: any): void => {
    storage.setItem(key, JSON.stringify(value));
};
