/* eslint-disable no-eval, no-process-env */
/** Loads a JavaScript file. */
export default (filePath: string): any => {
    let file;

    if (process.env.webpack) {
        file = eval(`require("${filePath}")`);
    } else {
        file = require(filePath);
    }

    return file;
};
