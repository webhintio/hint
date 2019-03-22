import * as isCI from 'is-ci';

export const ignoredConnectors = isCI ?
    ['chrome'] :
    [];
