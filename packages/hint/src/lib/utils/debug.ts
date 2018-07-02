import * as path from 'path';

import * as d from 'debug';

const debugEnabled: boolean = (process.argv.includes('--debug'));

// must do this initialization *before* other requires in order to work
if (debugEnabled) {
    d.enable('hint:*');
}

export const debug = (filePath: string): d.IDebugger => {

    let output: string = path.basename(filePath, path.extname(filePath));
    let dirPath: string = path.dirname(filePath);
    let currentDir: string = path.basename(dirPath);

    /*
     * The debug message is generated from the file path, e.g.:
     *
     *  * src/lib/connectors/chrome/chrome-launcher.ts => hint:connectors:chrome:chrome-launcher
     *  * src/lib/connectors/chrome/chrome.ts => hint:connectors:chrome
     */

    while (currentDir && currentDir !== 'lib') {

        /*
         * If the file is in a directory with the same name, do not add
         * its parent directory (this is the case for connectors & hints).
         */

        if (currentDir !== output) {
            output = `${currentDir}:${output}`;
        }

        dirPath = path.join(dirPath, '..');
        currentDir = path.basename(dirPath);
    }

    // For `/src/lib/engine.ts`, use 'hint:engine' instead of 'hint:hint'
    if (output === 'hint') {
        output = 'engine';
    }

    return d(`hint:${output}`);

};
