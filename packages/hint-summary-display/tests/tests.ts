import { test, fs } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);

const { readFile } = fs;

const generateConfig = (fileName: string) => {
    const styles = readFile(`${__dirname}/fixtures/${fileName}.css`);

    return {
        '/': generateHTMLPage(`<link rel="stylesheet" href="${fileName}.css">`),
        [`/${fileName}.css`]: {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

const summary = {
    summaryDefaultStyle: generateConfig('summaryDefaultStyle'),
    summaryStyleChanged: generateConfig('summaryStyleChanged'),
    summaryTest1: generateConfig('summaryTest1'),
    summaryTest2: generateConfig('summaryTest2'),
    summaryTest3: generateConfig('summaryTest3'),
    summaryTest4: generateConfig('summaryTest4'),
    summaryTest5: generateConfig('summaryTest5'),
    summaryTest6: generateConfig('summaryTest6'),
    summaryTest7: generateConfig('summaryTest7')
};

const tests: HintTest[] = [
    {
        name: 'Summary tag has display: `list-item`',
        serverConfig: summary.summaryDefaultStyle
    },
    {
        name: 'Summary tag does not have `display: `list-item`',
        reports: [{ message: `Changing display of a summary tag hides open/close icon` }],
        serverConfig: summary.summaryStyleChanged
    },
    {
        name: 'Summary tag with child class selector',
        serverConfig: summary.summaryTest1
    },
    {
        name: 'Summary tag with class changes display',
        reports: [{ message: `Changing display of a summary tag hides open/close icon` }],
        serverConfig: summary.summaryTest2
    },
    {
        name: 'Multiple css selector',
        reports: [{ message: `Changing display of a summary tag hides open/close icon` }],
        serverConfig: summary.summaryTest3
    },
    {
        name: 'Nested summary tags',
        reports: [{ message: `Changing display of a summary tag hides open/close icon` }],
        serverConfig: summary.summaryTest4
    },
    {
        name: 'Sibling selector',
        reports: [{ message: `Changing display of a summary tag hides open/close icon` }],
        serverConfig: summary.summaryTest5
    },
    {
        name: 'Child selector',
        reports: [{ message: `Changing display of a summary tag hides open/close icon` }],
        serverConfig: summary.summaryTest6
    },
    {
        name: 'Summary does not change the display',
        serverConfig: summary.summaryTest7
    }
];

testHint(hintPath, tests, { parsers: ['css'] });
