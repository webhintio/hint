import { test, fs } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);

const { readFile } = fs;

const generateConfig = (fileName: string) => {
    if (fileName.endsWith('.html')) {
        return readFile(`${__dirname}/fixtures/${fileName}`);
    }

    const styles = readFile(`${__dirname}/fixtures/${fileName}.css`);

    return {
        '/': generateHTMLPage(`<link rel="stylesheet" href="${fileName}.css"><summary class="test" id="idtest">Testing</summary>`),
        [`/${fileName}.css`]: {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

const summary = {
    classStyle: generateConfig('summary-class-not-ok'),
    divStyle: generateConfig('summary-id-not-ok'),
    noProblems: generateConfig('summary-ok.html'),
    noStyleProblem: generateConfig('summary-ok')

};

const tests: HintTest[] = [
    {
        name: 'This test should Pass',
        serverConfig: summary.noProblems
    },
    {
        name: `Style test Pass`,
        serverConfig: summary.noStyleProblem
    },
    {
        name: `Class does not have intended value of display attribute`,
        reports: [{ message: `display should be list-item` }],
        serverConfig: summary.classStyle
    },
    {
        name: `Id does not have intended value of display attribute`,
        reports: [{ message: `display should be list-item` }],
        serverConfig: summary.divStyle
    }

];

testHint(hintPath, tests, { parsers: ['css'] });
