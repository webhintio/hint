import test from 'ava';
import { executablePath } from 'puppeteer';

import { Analyzer } from 'hint';

import { hostUI } from './helpers/host-ui';

test('It passes all configured hints from webhint', async (t) => {
    const [server, urls] = await hostUI();

    const config = Analyzer.getUserConfig()!;

    config.connector = {
        name: 'puppeteer',
        options: { puppeteerOptions: { executablePath: executablePath() } } as any
    };

    const webhint = Analyzer.create(config);
    const results = await webhint.analyze(urls);

    for (const result of results) {
        for (const problem of result.problems) {
            t.log(problem);
        }
    }

    t.is(results.reduce((sum, result) => {
        return sum + result.problems.length;
    }, 0), 0);

    await server.stop();
});
