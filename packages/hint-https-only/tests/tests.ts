import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const testsNoHTTPS: Array<HintTest> = [
    {
        name: `HTML page serverd using HTTP`,
        reports: [{ message: 'Site should be served over HTTPS.' }],
        serverConfig: generateHTMLPage()
    }
];

hintRunner.testHint(hintPath, testsNoHTTPS);
