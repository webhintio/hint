import * as isCI from 'is-ci';
import { launch, Browser, Frame, Page, Target } from 'puppeteer-core';
import test from 'ava';

import { chromiumFinder, misc } from '@hint/utils';
import { Server } from '@hint/utils-create-server';

import { Events, Results } from '../src/shared/types';
import { readFixture } from './helpers/fixtures';

const { delay } = misc;

const executablePath = chromiumFinder.getInstallationPath();
const pathToExtension = `${__dirname}/../bundle`;

const getPageFromTarget = async (target: Target) => {
    /*
     * TODO: Replace this hack with something more stable.
     * See https://github.com/GoogleChrome/puppeteer/issues/4247
     */
    (target as any)._targetInfo.type = 'page';

    return await target.page();
};

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

/**
 * Find the Puppeteer `Page` associated with the devtools panel
 * for the webhint browser extension.
 *
 * Needed because Puppeteer doesn't expose the devtools as a page.
 *
 * @param browser The Puppeteer `Browser` instance to search.
 * @returns The found devtools panel for the extension.
 */
const findWebhintDevtoolsPanel = async (browser: Browser): Promise<Frame> => {
    const targets = await browser.targets();
    const devtoolsTarget = targets.filter((t) => {
        return t.type() === 'other' && t.url().startsWith('chrome-devtools://');
    })[0];

    const devtoolsPage = await getPageFromTarget(devtoolsTarget);

    await delay(500);

    /*
     * Select the last tab in the devtools by navigating left using keyboard
     * shortcuts. The last tab will be webhint so long as we've only loaded
     * one devtools extension.
     *
     * Based on https://github.com/GoogleChrome/puppeteer/issues/3699#issuecomment-450526587
     */
    await devtoolsPage.keyboard.down('Control');
    await devtoolsPage.keyboard.press('[');
    await devtoolsPage.keyboard.up('Control');

    await delay(500);

    const webhintTarget = (await browser.targets()).filter((target) => {
        return target.url().startsWith('chrome-extension://') &&
            target.url().endsWith('/panel.html');
    })[0];

    const webhintPanelPage = await getPageFromTarget(webhintTarget);
    const webhintPanelFrame = webhintPanelPage.frames()[0];

    return webhintPanelFrame;
};

test('It runs end-to-end in a page', async (t) => {
    const server = await Server.create({ configuration: await readFixture('missing-lang.html') });

    const url = `http://localhost:${server.port}/`;

    const browser = await launch({ executablePath });
    const page = (await browser.pages())[0];

    await page.goto(url);

    page.on('pageerror', (e) => {
        console.log('Page Error: ', e);
    });

    const resultsPromise = page.evaluate(() => {
        return new Promise<Results>((resolve) => {
            const listeners: (((events: Events) => void))[] = [];

            const onMessage = (events: Events) => {
                for (const listener of listeners) {
                    listener(events);
                }
            };

            window.chrome = {
                i18n: {
                    getMessage(key: string) {
                        return key;
                    }
                },
                runtime: {
                    onMessage: {
                        addListener: (fn: () => void) => {
                            listeners.push(fn);
                        },
                        removeListener: () => { }
                    },
                    sendMessage: (event: Events) => {
                        if (event.evaluate) {
                            const { code, id } = event.evaluate;

                            setTimeout(() => {
                                try {
                                    const value = eval(code); // eslint-disable-line

                                    onMessage({ evaluateResult: { id, value } });
                                } catch (err) {
                                    onMessage({ evaluateResult: { err, id } });
                                }
                            }, 0);
                        }
                        if (event.requestConfig) {
                            onMessage({ config: {} });
                        }
                        if (event.results) {
                            resolve(event.results);
                        }
                    }
                }
            } as any;
        });
    });

    await page.addScriptTag({ path: `${__dirname}/../bundle/content-script/webhint.js` });

    const results = await resultsPromise;

    t.not(results.categories.length, 0);
    t.true(results.categories.some((category) => {
        return category.hints.some((hint) => {
            return hint.problems.some((problem) => {
                return problem.message === '<html> element must have a lang attribute';
            });
        });
    }), 'Missing `lang` attribute was not reported');

    await browser.close();
    server.stop();
});

// TODO: Get this working in CI (at least for Linux).
if (!isCI) {
    test.skip('It runs end-to-end as an extension', async (t) => {
        const server = await Server.create({ configuration: await readFixture('missing-lang.html') });

        const url = `http://localhost:${server.port}/`;

        const browser = await launch({
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`
            ],
            defaultViewport: null,
            devtools: true,
            executablePath,
            headless: false
        });

        const pages = await browser.pages();

        await pages[0].goto(url);

        await delay(500);

        const backgroundPage = await findBackgroundScriptPage(browser);
        const webhintPanel = await findWebhintDevtoolsPanel(browser);

        await delay(500);

        await webhintPanel.click('button[type="submit"]');

        const results: Results = await backgroundPage.evaluate(() => {
            return new Promise<Results>((resolve) => {
                chrome.runtime.onMessage.addListener((message: Events) => {
                    if (message.results) {
                        resolve(message.results);
                    }
                });
            });
        });

        t.not(results.categories.length, 0);
        t.true(results.categories.some((category) => {
            return category.hints.some((hint) => {
                return hint.problems.some((problem) => {
                    return problem.message === '<html> element must have a lang attribute';
                });
            });
        }), 'Missing `lang` attribute was not reported');

        await browser.close();
        server.stop();
    });
}
