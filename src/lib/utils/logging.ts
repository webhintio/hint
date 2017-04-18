/**
 * @fileoverview Handle logging for Sonar (based on ESLint)
 */

/* eslint no-console: "off" */

/* istanbul ignore next */

/** Cover for console.error */
export const error = (message, ...optionalParams) => {
    console.error(message, ...optionalParams);
};

/** Cover for console.log */
export const log = (message, ...optionalParams) => {
    console.log(message, ...optionalParams);
};
