import { HintTest, testHint } from '@hint/utils-tests-helpers';
import { test } from '@hint/utils';

const { generateHTMLPage, getHintPath} = test;
const hintPath = getHintPath(__filename);

const testsNoHTTPS: HintTest[] = [
    {
        name: `HTML page serverd using HTTP`,
        reports: [{ message: 'Site should be served over HTTPS.' }],
        serverConfig: generateHTMLPage()
    }
];

testHint(hintPath, testsNoHTTPS);
