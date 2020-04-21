import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);
const severity = Severity.error;

const testsNoHTTPS: HintTest[] = [
    {
        name: `HTML page serverd using HTTP`,
        reports: [{ message: 'Site should be served over HTTPS.', severity }],
        serverConfig: generateHTMLPage()
    }
];

testHint(hintPath, testsNoHTTPS);
