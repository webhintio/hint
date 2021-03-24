import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { readFile } from '@hint/utils-fs';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const generateConfig = (...fileNames: string[]) => {
    const requests: {[key: string]: any} = {};
    let html = '';

    for (const fileName of fileNames) {
        const content = readFile(`${__dirname}/fixtures/${fileName}.css`);
        const headers = { 'Content-Type': 'text/css' };
        const path = `/${fileName}.css`;

        requests[path] = { content, headers };
        html += `<link rel="stylesheet" href="${fileName}.css">`;
    }

    requests['/'] = generateHTMLPage(html);

    return requests;
};

const serverConfigs = {
    inline: generateConfig('inline'),
    keyframeRule: generateConfig('keyframe-rule'),
    multipleDisplays: generateConfig('multiple-displays'),
    multipleDisplaysInRule: generateConfig('multiple-displays-in-rule'),
    multipleStyleSheets: generateConfig('simple', 'inline', 'multiple-displays'),
    noFlex: generateConfig('no-flex'),
    simple: generateConfig('simple')
};

const message = `CSS Flexbox may render differently in Internet Explorer than more recent browsers. Check this page in IE then see the documentation for workarounds if needed.`;

const testsWithIE: HintTest[] = [
    {
        name: 'Simple `display:flex;`',
        reports: [{
            message,
            severity: Severity.warning
        }],
        serverConfig: serverConfigs.simple
    },
    {
        name: 'Simple `display:inline-flex;`',
        reports: [{
            message,
            severity: Severity.warning
        }],
        serverConfig: serverConfigs.inline
    },
    {
        name: 'Multiple different display properties',
        reports: [{
            message,
            severity: Severity.warning
        }],
        serverConfig: serverConfigs.multipleDisplays
    },
    {
        name: 'Multiple display properties spread across multiple stylesheets',
        reports: [{
            message,
            severity: Severity.warning
        }],
        serverConfig: serverConfigs.multipleStyleSheets
    },
    {
        name: 'Multiple display flexbox properties in one rule',
        reports: [{
            message,
            severity: Severity.warning
        }],
        serverConfig: serverConfigs.multipleDisplaysInRule
    },
    {
        name: 'No flex display',
        serverConfig: serverConfigs.noFlex
    },
    {
        name: 'Display properties nested in a keyframe rule',
        reports: [{
            message,
            severity: Severity.warning
        }],
        serverConfig: serverConfigs.keyframeRule
    }
];

const testsWithoutIE: HintTest[] = [
    {
        name: 'Simple `display:flex;` without IE',
        serverConfig: serverConfigs.simple
    },
    {
        name: 'Simple `display:inline-flex;` without IE',
        serverConfig: serverConfigs.inline
    },
    {
        name: 'Multiple different display properties without IE',
        serverConfig: serverConfigs.multipleDisplays
    },
    {
        name: 'No flex display without IE',
        serverConfig: serverConfigs.noFlex
    }
];

testHint(hintPath, testsWithIE, { browserslist: ['IE 10', 'Chrome 63'], parsers: ['css'] });
testHint(hintPath, testsWithoutIE, { browserslist: ['Chrome 87', 'Edge 15'], parsers: ['css'] });
