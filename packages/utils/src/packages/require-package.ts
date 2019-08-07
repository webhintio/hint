// If we are using bundling with webpack we need to "hide" all the requires

export const requirePackage = (modulePath: string): any => {
    let pkg;

    /* istanbul ignore if */
    if (process.env.webpack) { // eslint-disable-line no-process-env
        pkg = eval(`require("${modulePath}")`); // eslint-disable-line no-eval
    } else {
        pkg = require(modulePath);
    }

    return pkg;
};
