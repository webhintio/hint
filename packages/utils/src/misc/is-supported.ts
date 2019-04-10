import { isSupported as supported } from 'caniuse-api';

const isSupported = (feature: string, browsers: string): boolean => {
    return supported(feature, browsers);
};

export { isSupported };
