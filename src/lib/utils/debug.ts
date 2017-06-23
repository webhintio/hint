import * as path from 'path';

import * as d from 'debug';

const debugEnabled: boolean = (process.argv.includes('--debug'));

// must do this initialization *before* other requires in order to work
if (debugEnabled) {
    d.enable('sonar:*');
}

export const debug = (filePath: string): d.IDebugger => {

    let output: string = path.basename(filePath, path.extname(filePath));
    let dirPath: string = path.dirname(filePath);
    let currentDir: string = path.basename(dirPath);

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
