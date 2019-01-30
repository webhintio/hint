import { localStorage } from '../../../../../shared/globals';

export const getItem = (key: string) => {
    return localStorage.getItem(key);
};

export const removeItem = (key: string) => {
    localStorage.removeItem(key);
};

export const setItem = (key: string, value: string) => {
    localStorage.setItem(key, value);
};
