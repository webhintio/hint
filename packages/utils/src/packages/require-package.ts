// If we are using bundling with webpack we need to "hide" all the requires

export const requirePackage = (modulePath: string): any => {
    let pkg;

    /* istanbul ignore if */
    if (process.env.webpack) { // eslint-disable-line no-process-env
        // @ts-ignore
        pkg = __non_webpack_require__(modulePath);
    } else {
        pkg = require(modulePath);
    }

    return pkg;
};
