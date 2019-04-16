const isWsl: boolean = require('is-wsl');

/** Returns the current running platform or an exception if it is not suppoted. */
export const getPlatform = () => {
    return isWsl ? 'wsl' : process.platform;
};
