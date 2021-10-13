import * as axeCore from 'axe-core';

export const axeCoreVersion = axeCore.version
    .split('.')
    .slice(0, 2)
    .join('.');
