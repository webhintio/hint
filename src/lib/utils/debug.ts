import * as path from 'path';

import * as d from 'debug';

const debugEnabled = (process.argv.includes('--debug'));

// must do this initialization *before* other requires in order to work
if (debugEnabled) {
    d.enable('sonar:*');
}

export const debug = (filePath: string) => {

    let output = path.basename(filePath, path.extname(filePath));
    let dirPath = path.dirname(filePath);
    let currentDir = path.basename(dirPath);

    // The debug message is generated from the file path, e.g.:
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

    return d(`sonar:${output}`);

};
