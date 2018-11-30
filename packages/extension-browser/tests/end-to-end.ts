import * as isCI from 'is-ci';
import { launch, Browser, Page } from 'puppeteer';
import test from 'ava';

import { createServer } from '@hint/utils-create-server';

import { Events, Results } from '../src/shared/types';

import { readFixture } from './utils/helpers';

const pathToExtension = `${__dirname}/../bundle`;

/**
 * Find the Puppeteer `Page` associated with the background script
 * for the webhint browser extension.
 *
 * Needed because Chromium has a built-in extension with a background
 * script that runs even when all other extensions are disabled. The
 * order in which the background scripts are returned varies randomly
 * between runs, so clear identification is necessary.
 *
 * @param browser The Puppeteer `Browser` instance to search.
 * @returns The found page for the background script.
 */
const findBackgroundScriptPage = async (browser: Browser): Promise<Page> => {
    const targets = await browser.targets();
    const bgTargets = targets.filter((t) => {
        return t.type() === 'background_page';
    });

    const matches = await Promise.all(bgTargets.map(async (t) => {
        const page = await t.page();

        // TODO: Rename `background-script.js` to make the ID more unique.
        return await page.$('script[src="background-script.js"]');
    }));

    const bgTarget = bgTargets.filter((t, i) => {
        return matches[i];
    })[0];

    return await bgTarget.page();
};

test.serial('It runs end-to-end', async (t) => {
    if (isCI) {
        /*
         * TODO: Get this working in CI (at least for Linux).
         * https://docs.travis-ci.com/user/gui-and-headless-browsers/#using-xvfb-to-run-tests-that-require-a-gui
         */
        return;
    }

    const server = createServer();

    server.configure(await readFixture('missing-lang.html'));

    await server.start();

    const url = `http://localhost:${server.port}/`;

    const browser = await launch({
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`
        ],
        headless: false
    });

    const pages = await browser.pages();
    const backgroundPage = await findBackgroundScriptPage(browser);

    await pages[0].goto(url);

    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    const results: Results = await backgroundPage.evaluate(() => {
        return new Promise<Results>((resolve) => {
            chrome.runtime.onMessage.addListener((message: Events) => {
                if (message.results) {
                    resolve(message.results);
                }
            });
            chrome.tabs.executeScript({ code: `chrome.runtime.sendMessage({enable: {}})` });
        });
    });

    t.true(results.categories.length > 0, 'Returned results');
    t.true(results.categories.some((category) => {
        return category.hints.some((hint) => {
            return hint.problems.some((problem) => {
                return problem.message === '<html> element must have a lang attribute';
            });
        });
    }), 'Reported missing `lang` attribute');

    await browser.close();
    server.stop();
});
