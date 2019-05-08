const pptr = require('puppeteer-core');
const chromiumFinder = require('@hint/utils').chromiumFinder;

const stores = [
    'https://addons.mozilla.org/en-US/developers/addons',
    'https://chrome.google.com/webstore/developer/dashboard'
];

/**
 * Returns the user data dir for Chrome in the current platform.
 * It assumes that:
 *
 * * Chrome is installed
 * * It is in the default installation path
 *
 * https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md
 */
const getUserDataDir = () => {
    const dirs = {
        darwin: '~/Library/Application Support/Google/Chrome',
        linux: '~/.config/google-chrome',
        win32: '%LOCALAPPDATA%\\Google\\Chrome\\User Data'
    };

    const dir = dirs[process.platform];

    if (!dir) {
        throw new Error('Unsupported platform');
    }

    return dir;
};

const startBrowser = async () => {

    const userDataDir = getUserDataDir();
    const browserName = chromiumFinder.Browser.Chrome;
    const executablePath = chromiumFinder.getInstallationPath({ browser: browserName });

    const browser = await pptr.launch({
        defaultViewport: null,
        executablePath,
        headless: false,
        userDataDir
    });

    return browser;
};

const start = async () => {

    const browser = await startBrowser();

    for (const store of stores) {
        const page = await browser.newPage();

        await page.goto(store, { waitUntil: 'networkidle0' });
    }
};

start();
