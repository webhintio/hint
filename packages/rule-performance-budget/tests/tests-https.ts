import { readFileSync } from 'fs';

import { generateHTMLPage } from 'sonarwhal/dist/src/lib/utils/misc';
import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';

const rulePath = getRulePath(__filename);

const image = readFileSync(`${__dirname}/fixtures/image.png`);

const imageResponse = {
    content: image,
    header: { 'Content-Type': 'image/png' }
};

const generateBody = (imageCount: number) => {
    let html = '';

    for (let i = 0; i < imageCount; i++) {
        html += `<img src="/image-${i}.png">`;
    }

    return html;
};

const generateServerConfig = (imageCount: number, redirects = false) => {
    const serverConfig = {};

    for (let i = 0; i < imageCount; i++) {
        if (redirects) {
            serverConfig[`/image-${i}.png`] = {
                content: `/image${i}.png`,
                status: 302
            };
            serverConfig[`/image${i}.png`] = imageResponse;
        } else {
            serverConfig[`/image-${i}.png`] = imageResponse;
        }
    }

    serverConfig['/'] = generateHTMLPage('', generateBody(imageCount));

    return serverConfig;
};

const tests: Array<RuleTest> = [
    {
        name: 'Plain page loads fast enough',
        serverConfig: generateHTMLPage()
    },
    {
        name: `Page with 2 images loads under 5s on 3GFast`,
        serverConfig: generateServerConfig(2)
    },
    {
        name: `Page with 3 images and redirects doesn't load under 5s on 3GFast`,
        reports: [{
            message: `To load all the resources on a 3GFast network, it will take about 7.2s in optimal conditions.
That's 2.2s more than the 5s target.`
        }],
        serverConfig: generateServerConfig(3, true)
    },
    {
        name: `Page with 10 images doesn't load under 5s on 3GFast`,
        reports: [{
            message: `To load all the resources on a 3GFast network, it will take about 22.6s in optimal conditions.
That's 17.6s more than the 5s target.`
        }],
        serverConfig: generateServerConfig(10, true)
    }
];

const loadTimeTests: Array<RuleTest> = [
    {
        name: 'Plain page loads fast enough',
        serverConfig: generateHTMLPage()
    },
    {
        name: `Page with 1 image doesn't load under 1s on 3GFast`,
        reports: [{
            message: `To load all the resources on a 3GFast network, it will take about 2.7s in optimal conditions.
That's 1.7s more than the 1s target.`
        }],
        serverConfig: generateServerConfig(1)
    }
];

const connectionTypeTests: Array<RuleTest> = [
    {
        name: 'Plain page loads fast enough',
        serverConfig: generateHTMLPage()
    },

    {
        name: `Page with 1 image doesn't load fast enough on Dial`,
        reports: [{
            message: `To load all the resources on a Dial network, it will take about 50.8s in optimal conditions.
That's 45.8s more than the 5s target.`
        }],
        serverConfig: generateServerConfig(1)
    }
];

ruleRunner.testRule(rulePath, tests, { https: true });
ruleRunner.testRule(rulePath, loadTimeTests, {
    https: true,
    ruleOptions: { loadTime: 1 }
});
ruleRunner.testRule(rulePath, connectionTypeTests, {
    https: true,
    ruleOptions: { connectionType: 'Dial' }
});
