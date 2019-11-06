import { generateHTMLPage, getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

const hintPath = getHintPath(__filename);

const testsNoHTTPS: HintTest[] = [
    {
        name: `HTML page serverd using HTTP`,
        reports: [{ message: 'Site should be served over HTTPS.' }],
        serverConfig: generateHTMLPage()
    }
];

testHint(hintPath, testsNoHTTPS);
