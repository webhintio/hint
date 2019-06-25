import { useState } from 'react';

let nextId = 0;

export const uniqueId = () => {
    return `id${nextId++}`;
};

export const useUniqueId = () => {
    const [id] = useState(() => {
        return uniqueId();
    });

    return id;
};
