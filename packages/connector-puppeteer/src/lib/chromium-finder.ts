/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import * as path from 'path';

import { isDirectory, isFile } from '@hint/utils-fs';
import { getVariable, getPlatform } from '@hint/utils';

import { execSync, execFileSync } from 'child_process';

const newLineRegex = /\r?\n/;

export enum Browser {
    Chrome = 'Chrome',
    Chromium = 'Chromium',
    Edge = 'Edge'
}

const ERRORS = {
    InvalidPath: (strings: TemplateStringsArray, p: string) => {
        return `The provided path is not accessible: "${p}"`;
    },
    NoInstallationFound: (strings: TemplateStringsArray, browser: string) => {
        return `No installation found for: "${browser}"`;
    },
    NotSupportedBrowser: (strings: TemplateStringsArray, browser: string) => {
        return `The provided browser ("${browser}") is not supported in this platform`;
    },
    UnsupportedPlatform: (strings: TemplateStringsArray, platform: string) => {
        return `Unsupported platform: "${platform}"`;
    }
};

/**
 * Variables used to find installers sorted by priority:
 * - Chrome: Canary, Stable
 * - Chromium: Only one install
 * - Edge: Canary, Stable
 */
const browserVariables = new Map([
    ['darwin', new Map([
        [
            Browser.Chrome, [
                '/Contents/MacOS/Google Chrome Canary',
                '/Contents/MacOS/Google Chrome'
            ]
        ],
        [
            Browser.Chromium, [
                '/Contents/MacOS/Chromium'
            ]
        ],
        [
            Browser.Edge, [
                '/Contents/MacOS/Microsoft Edge Canary',
                '/Contents/MacOS/Microsoft Edge'
            ]
        ]
    ])],
    ['linux', new Map([
        [
            Browser.Chrome, [
                // TODO: Chrome Canary? Chrome Dev?
                '(google-chrome|chrome)', // regex for desktop
                'google-chrome-stable', // used with `which`
                'google-chrome' // used with `which`
            ]
        ],
        [
            Browser.Chromium, [
                '(chromium)', // regex for desktop
                'chromium-browser', // used with `which`
                'chromium' // used with `which`
            ]
        ]
    ])],
    ['win32', new Map([
        [
            Browser.Chrome, [
                `${path.sep}Google${path.sep}Chrome SxS${path.sep}Application${path.sep}chrome.exe`,
                `${path.sep}Google${path.sep}Chrome${path.sep}Application${path.sep}chrome.exe`
            ]
        ],
        [
            // TODO: It seems like there's no official installer for chromium?
            Browser.Chromium, [
                `${path.sep}Chromium${path.sep}Application${path.sep}chromium.exe`
            ]
        ],
        [
            // TODO: Not sure how to identify the browser correctly, I believe it depends on which one you install first?
            Browser.Edge, [
                // Canary suffix path
                `${path.sep}Microsoft${path.sep}Edge SxS${path.sep}Application${path.sep}msedge.exe`,
                `${path.sep}Microsoft${path.sep}Edge${path.sep}Application${path.sep}msedge.exe`,
                // Dev suffix path
                `${path.sep}Microsoft${path.sep}Edge Dev SxS${path.sep}Application${path.sep}msedge.exe`,
                `${path.sep}Microsoft${path.sep}Edge Dev${path.sep}Application${path.sep}msedge.exe`
            ]
        ]
    ])]
]);


/** Find chromium executables on macOS */
const darwin = (browser: Browser) => {
    const platformBrowserInfo = browserVariables.get('darwin')!;
    const suffixes = platformBrowserInfo.get(browser);

    /* istanbul ignore next */
    if (!suffixes) {
        throw new Error(ERRORS.NotSupportedBrowser`${browser}`);
    }

    /**
     * The following generates a list of all the installed applications in macOS.
     * The `grep` command makes sure we only get the lines that contain `.app`
     * because `-dump` generates more information than the one needed.
     * The `awk` commands makes sure we remove the suffix and prefix part of the line so we
     * only get the path.
     *
     * Turns -> path: /Applications/Google Chrome.app (0x2134)
     * into  -> /Applications/Google Chrome.app
     *
     * More info in:
     * http://krypted.com/mac-security/lsregister-associating-file-types-in-mac-os-x/
     */
    const LSREGISTER = '/System/Library/Frameworks/CoreServices.framework' +
        '/Versions/A/Frameworks/LaunchServices.framework' +
        '/Versions/A/Support/lsregister';

    const lines = execSync(
        `${LSREGISTER} -dump` +
        ` | grep -i '\.app'` + // eslint-disable-line
        ` | awk '{print $2,$3}'`)
        .toString()
        .split(newLineRegex);

    /**
     * Because `suffixes` are already prioritized, we iterate them first to make
     * sure that priorization is respected
     */
    for (const suffix of suffixes) {
        for (const inst of lines) {

            const execPath = path.join(inst.trim(), suffix);

            /**
             * An example of valid path for Chrome would be:
             * `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
             */
            if (isFile(execPath)) {
                return execPath;
            }
        }
    }

    return '';
};

/** Find chromium executables on Linux. */
const findChromeExecutable = (folder: string, regExes: string[]) => {
    const argumentsRegex = /(^[^ ]+).*/; // Take everything up to the first space

    for (const browserRegex of regExes) {

        const chromeExecRegex = `^Exec=/.*/${browserRegex}-.*`;

        /* istanbul ignore else */
        if (isDirectory(folder)) {
            /*
             * Output of the grep & print looks like:
             *    /opt/google/chrome/google-chrome --profile-directory
             *    /home/user/Downloads/chrome-linux/chrome-wrapper %U
             */
            let execPaths;

            /*
             * Some systems do not support grep -R so fallback to -r.
             * See https://github.com/GoogleChrome/chrome-launcher/issues/46 for more context.
             */
            try {
                execPaths = execSync(`grep -ER "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`);
            } catch (e) /* istanbul ignore next */ {
                execPaths = execSync(`grep -Er "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`);
            }

            execPaths = execPaths.toString()
                .split(newLineRegex)
                .map((execPath: string) => {
                    return execPath.replace(argumentsRegex, '$1');
                });

            for (const execPath of execPaths) {
                /* istanbul ignore next */
                if (isFile(execPath)) {
                    return execPath;
                }
            }
        }
    }

    return '';
};

/**
 * Look for linux executables in 2 ways
 * 1. Look into the directories where .desktop are saved on gnome based distro's
 * 2. Look for google-chrome-stable & google-chrome executables by using the which command
 */
const linux = (browser: Browser) => {

    // 1. Look into the directories where .desktop are saved on gnome based distro's
    const desktopInstallationFolders = [
        path.join(require('os').homedir(), '.local/share/applications/'),
        '/usr/share/applications/'
    ];

    const browserPartsInfo = browserVariables.get('linux')!;
    const executables = browserPartsInfo.get(browser);

    if (!executables) {
        throw new Error(ERRORS.NotSupportedBrowser`${browser}`);
    }

    for (const folder of desktopInstallationFolders) {
        const executable = findChromeExecutable(folder, executables);

        /* istanbul ignore if */
        if (executable) {
            return executable;
        }
    }

    // 2. Look for executables by using the which command
    for (const executable of executables) {
        try {
            const chromePath =
                execFileSync('which', [executable], { stdio: 'pipe' }).toString()
                    .split(newLineRegex)[0];

            /* istanbul ignore else */
            if (chromePath && isFile(chromePath)) {
                return chromePath;
            }
        } catch (e) {
            // Not installed.
        }
    }

    return '';
};

/**
 * Searches for installation paths for the given `browser` on a Windows platform.
 * @param browser The type of browser to search for
 */
const win32 = (browser: Browser) => {
    const info = browserVariables.get('win32')!;

    const suffixes = info.get(browser);

    /* istanbul ignore if */
    if (!suffixes) {
        throw new Error(ERRORS.NotSupportedBrowser`${browser}`);
    }

    const prefixes = [
        getVariable('LOCALAPPDATA'),
        getVariable('PROGRAMFILES'),
        getVariable('PROGRAMFILES(X86)')
    ].filter(Boolean);

    for (const suffix of suffixes) {
        for (const prefix of prefixes) {
            const browserPath = path.join(prefix!, suffix);

            /* istanbul ignore if */
            if (isFile(browserPath)) {
                return browserPath;
            }
        }
    }

    return '';
};

const finders = new Map([
    ['darwin', darwin],
    ['linux', linux],
    ['win32', win32],
    ['wsl', linux]
]);

/** For the given `browser`, finds the executable in the current platform. */
const findBrowserPath = (browser: Browser) => {
    const platform = getPlatform();
    const finder = finders.get(platform);

    if (!finder) {
        throw new Error(ERRORS.UnsupportedPlatform`${platform}`);
    }

    return finder(browser);
};

/**
 * List of environment variables to search for a chromium browser.
 */

/** Resolves a chromium path by using different well-known environment variables. */
const resolveChromiumPath = () => {
    const chromiumPaths = [
        getVariable('WEBHINT_CHROMIUM_PATH'),
        getVariable('CHROME_PATH')
    ];

    while (chromiumPaths.length > 0) {
        const browserPath = chromiumPaths.shift()!;

        if (isFile(browserPath)) {
            return browserPath;
        }
    }

    return '';
};

// PUBLIC INTERFACE

/**
 * 0. Check if any well-known property is set and verify it can be accessed
 * 1. Detect current running platform
 * 2. See if there's a preferred browser
 * 3. Find that browser based in heuristics for the current platform
 * 4. Return the path for the browser
 */

/**
 * Searchs for a valid Chromium browser from the ones supported. The current priority list is:
 * `Puppeteer`, `Chrome Canary`, `Chrome`, `Chromium`, `Edge Canary`, `Edge`.
 *
 * A user can also pass the browser to use (`Chrome`, `Chromium`, `Edge`) via the `options` parameter
 * or a `path` to the executable to use (`getInstallationPath` will only verify it exists, not if
 * it's actually a valid target).
 *
 * @param options The options to search an specific `browser` or use `browserPath` as the right one.
 */
export const getInstallationPath = (options?: { browser?: Browser; browserPath?: string }) => {
    if (options && options.browserPath) {
        if (isFile(options.browserPath)) {
            return options.browserPath;
        }

        // The provided path is not accessible
        throw new Error(ERRORS.InvalidPath`${options.browserPath}`);
    }

    const resolvedChromiumPath = resolveChromiumPath();

    if (resolvedChromiumPath) {
        return resolvedChromiumPath;
    }

    if (options && options.browser) {
        const browserPath = findBrowserPath(options.browser);

        if (browserPath) {
            return browserPath;
        }

        throw new Error(ERRORS.NoInstallationFound`${options.browser}`);
    }

    /**
     * When unspecified, prefer using the version of Chromium bundled
     * with puppeteer first (if available) as it is the most likely to
     * be compatible with the used version of puppeteer-core.
     */
    try {
        return require('puppeteer').executablePath();
    } catch (e) {
        // Fall back to searching for installed browsers.
    }

    /** The order in which to search for browsers in case none are provided. */
    const browsers = [Browser.Chrome, Browser.Chromium, Browser.Edge];
    let browserFound = '';

    while (browsers.length > 0 && !browserFound) {
        const br = browsers.shift()!;

        try {
            browserFound = findBrowserPath(br);
        } catch (e) {
            // keep searching
        }
    }

    if (!browserFound) {
        const message = 'Any supported browsers';

        throw new Error(ERRORS.NoInstallationFound`${message}`);
    }

    return browserFound;
};
