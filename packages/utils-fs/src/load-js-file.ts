/* eslint-disable no-process-env */
/** Loads a JavaScript file. */
export const loadJSFile = (filePath: string): any => {
    let file;

    /* istanbul ignore if */
    if (process.env.webpack) {
        // @ts-ignore
        file = __non_webpack_require__(filePath);
    } else {
        file = require(filePath);
    }

    return file;
};
