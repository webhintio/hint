/**
 * @fileoverview Handle logging for Sonar (based on ESLint)
 */

/* eslint no-console: "off" */

/* istanbul ignore next */

/** Cover for console.error */
export const error = (message: any, ...optionalParams: Array<any>) => {
    console.error(message, ...optionalParams);
};

/** Cover for console.log */
export const log = (message: any, ...optionalParams: Array<any>) => {
    console.log(message, ...optionalParams);
};
