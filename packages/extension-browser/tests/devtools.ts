import * as path from 'path';
import { launch } from 'puppeteer-core';
import test from 'ava';

import { Category } from 'hint';

import { chromiumFinder, fs } from '@hint/utils';
import { Server } from '@hint/utils-create-server';

import { Events, InjectDetails, Results } from '../src/shared/types';

const { readFileAsync } = fs;

type Listener = (message: Events) => void;

/**
 * Stub extension APIs used by the webhint devtools panel.
 * This enables the panel to run in a normal webpage for testing.
 *
 * @param results Results to return to the panel after it starts a scan.
 */
const mockExtensionAPIs = (results: Results) => {
    // Set a global promise to access the configuration passed from the devtools panel.
    (window as any).__startPromise = new Promise<InjectDetails>((resolve) => {
        const listeners = new Set<Listener>();

        (window as any).browser = {
            devtools: {
                inspectedWindow: {
                    eval() { },
                    tabId: 1
                },
                network: {
                    getHAR: () => { },
                    onRequestFinished: {
                        addListener: () => { },
                        removeListener: () => { }
                    }
                },
                panels: { themeName: 'dark' }
            },
            i18n: {
                getMessage: () => {
                    return 'Localized string.';
                }
            },
            runtime: {
                // Used by the panel to listen for results.
                connect: () => {
                    return {
                        onMessage: {
                            addListener: (fn: Listener) => {
                                listeners.add(fn);
                            },
                            removeListener: (fn: Listener) => {
                                listeners.delete(fn);
                            }
                        }
                    };
                },
                // Used by the panel to initiate a scan.
                sendMessage: (evt: Events) => {
                    if (evt.enable) {
                        // Report passed configuration for validation.
                        resolve(evt.enable);

                        // Wait a bit then return mocked results.
                        setTimeout(() => {
                            listeners.forEach((listener) => {
                                listener({ results });
                            });
                        }, 500);
                    }
                }
            }
        };
    });
};

test('It builds a configuration, starts a scan, and displays results', async (t) => {

    const [htmlSource, jsSource] = await Promise.all([
        readFileAsync(path.resolve(__dirname, '../bundle/devtools/panel.html')),
        readFileAsync(path.resolve(__dirname, '../bundle/devtools/panel.js'))
    ]);

    // Create a temporary server to load the panel content into a browser.
    const server = await Server.create({
        configuration: {
            '/': htmlSource,
            '/panel.js': {
                content: jsSource,
                headers: { 'Content-Type': 'text/javascript' }
            }
        }
    });

    const url = `http://localhost:${server.port}/`;

    /*
     * Launch the browser and get a reference to the initial page.
     * Note: Uncomment config options to see page content (aids debugging).
     */
    const executablePath = chromiumFinder.getInstallationPath();
    const browser = await launch(/* { defaultViewport: null, headless: false } */{ executablePath });
    const page = (await browser.pages())[0];

    // Inject mock extension APIs, passing mock results to return to the devtools panel.
    await page.evaluateOnNewDocument(mockExtensionAPIs, {
        categories: [{
            hints: [],
            name: Category.compatibility,
            passed: 0
        }],
        url: ''
    } as Results as any);

    // Load the devtools panel.
    await page.goto(url);

    // Disable the "Accessibility" category.
    await page.click('input[type="checkbox"][value="accessibility"]');

    // Click the "Start scan" button.
    await page.click('button[type="submit"]');

    // Wait for the panel to start the scan, getting the passed configuration.
    const injectDetails: InjectDetails = await page.evaluate(() => {
        return (window as any).__startPromise;
    });

    // Validate the configuration has the "Accessibility" category disabled.
    t.deepEqual(injectDetails.config, {
        disabledCategories: [
            Category.accessibility
        ]
    });

    // Wait for the panel to display results.
    await page.waitForSelector('[class*="results_root"]');

    const categories = await page.$$('[class*="category_root"]');

    // Validate the panel displayed one result category (for "Compatibility").
    t.is(categories.length, 1);

    await browser.close();
    await server.stop();
});
