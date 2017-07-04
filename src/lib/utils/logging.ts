/**
 * @fileoverview Handle logging for Sonar (based on ESLint)
 */

import * as path from 'path';
import * as d from 'debug';

const debugEnabled: boolean = (process.argv.includes('--debug'));

// must do this initialization *before* other requires in order to work
if (debugEnabled) {
    d.enable('sonar:*');
}

const getModuleInfo = (filePath: string) => {
    let output: string = path.basename(filePath, path.extname(filePath));
    let dirPath: string = path.dirname(filePath);
    let currentDir: string = path.basename(dirPath);

    // The logger message is generated from the file path, e.g.:
    //
    //  * src/lib/collectors/cdp/cdp-launcher.ts => sonar:collectors:cdp:cdp-launcher
    //  * src/lib/collectors/cdp/cdp.ts => sonar:collectors:cdp

    while (currentDir && currentDir !== 'lib') {

        // If the file is in a directory with the same name, do not add
        // its parent directory (this is the case for collectors & rules).

        if (currentDir !== output) {
            output = `${currentDir}:${output}`;
        }

        dirPath = path.join(dirPath, '..');
        currentDir = path.basename(dirPath);
    }

    // For `/src/lib/sonar.ts`, use 'sonar:engine' instead of 'sonar:sonar'.
    if (output === 'sonar') {
        output = 'engine';
    }

    return `sonar:${output}`;
};

export const loggerInitiator = (filePath: string, includesModuleInfo: boolean = true) => {
    const moduleInfo = getModuleInfo(filePath);

    const error = (message: any, ...optionalParams: Array<any>) => {
        const finalMessage = (includesModuleInfo && message) ? `${moduleInfo} ${message}` : message;

        return console.error(finalMessage, ...optionalParams);
    };

    const log = (message: any, ...optionalParams: Array<any>) => {
        const finalMessage = (includesModuleInfo && message) ? `${moduleInfo} ${message}` : message;

        return console.log(finalMessage, ...optionalParams);
    };

    const debug = (message: any, ...optionalParams: Array<any>) => {
        return d(moduleInfo)(message, ...optionalParams);
    };

    return {
        debug,
        error,
        log
    };
};
