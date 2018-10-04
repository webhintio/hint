import { readFileSync } from 'fs';
import { gzipSync } from 'zlib';

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

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
    const serverConfig = {} as any;

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

    const html = generateHTMLPage('', generateBody(imageCount));
    const compressed = gzipSync(Buffer.from(html, 'utf-8'));

    serverConfig['/'] = {
        content: compressed,
        headers: {
            'content-encoding': 'gzip',
            'content-type': 'text/html'
        }
    };

    return serverConfig;
};

const tests: Array<HintTest> = [
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
        reports: [{ message: `To load all the resources on a 3GFast network, it will take about 7.1s in optimal conditions (that is 2.1s more than the 5s target).` }],
        serverConfig: generateServerConfig(3, true)
    },
    {
        name: `Page with 10 images doesn't load under 5s on 3GFast`,
        reports: [{ message: `To load all the resources on a 3GFast network, it will take about 22.4s in optimal conditions (that is 17.4s more than the 5s target).` }],
        serverConfig: generateServerConfig(10, true)
    }
];

const loadTimeTests: Array<HintTest> = [
    {
        name: 'Plain page loads fast enough',
        serverConfig: generateHTMLPage()
    },
    {
        name: `Page with 1 image doesn't load under 1s on 3GFast`,
        reports: [{ message: `To load all the resources on a 3GFast network, it will take about 2.5s in optimal conditions (that is 1.5s more than the 1s target).` }],
        serverConfig: generateServerConfig(1)
    }
];

const connectionTypeTests: Array<HintTest> = [
    {
        name: 'Plain page loads fast enough',
        serverConfig: generateHTMLPage()
    },
    {
        name: `Page with 1 image doesn't load fast enough on Dial`,
        reports: [{ message: `To load all the resources on a Dial network, it will take about 50.7s in optimal conditions (that is 45.7s more than the 5s target).` }],
        serverConfig: generateServerConfig(1)
    }
];

hintRunner.testHint(hintPath, tests, { https: false });
hintRunner.testHint(hintPath, loadTimeTests, {
    hintOptions: { loadTime: 1 },
    https: false
});
hintRunner.testHint(hintPath, connectionTypeTests, {
    hintOptions: { connectionType: 'Dial' },
    https: false
});
