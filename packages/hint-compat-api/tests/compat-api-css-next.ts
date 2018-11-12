import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename, true);

const generateCSSConfig = (fileName: string) => {
    const path = 'fixtures/css';
    const styles = readFile(`${__dirname}/${path}/${fileName}.css`);

    return {
        '/': generateHTMLPage('<link rel="stylesheet" href="styles">'),
        '/styles': {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

/*
 * Tests for css features that are not broadly supported.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */

const addedBeforeTargetedBrowsers: Array<HintTest> = [
    {
        name: 'Features that were added in versions earlier than the targeted browsers should pass.',
        serverConfig: generateCSSConfig('charset')
    }
];

hintRunner.testHint(hintPath, addedBeforeTargetedBrowsers, { browserslist: ['last 2 Chrome versions'], parsers: ['css']});

//where version_added is true
const prefixedFeatureAdded: Array<HintTest> = [
    {
        name: 'Prefixed features that are added irrelevant of version should pass.',
        serverConfig: generateCSSConfig('box-flex-prefix')
    }
];

hintRunner.testHint(hintPath, prefixedFeatureAdded, { browserslist: ['chrome 32', 'chrome 63 - 65'], parsers: ['css']});

// const compatibilityUnknown: Array<HintTest> = [
//     {
//         name: 'Features using child properties whoes compatibility is unknown with the targeted browsers should fail.',
//         reports: [{ message: 'capitalize of CSS is not added on chrome browser.' }],
//         serverConfig: generateCSSConfig('text-transform')
//     }
// ];

// hintRunner.testHint(hintPath, compatibilityUnknown, { browserslist: ['chrome 65'], parsers: ['css']});

//case where version_added is null
//I think is a bug from mdn
const childCompatibilityUnknown: Array<HintTest> = [
    {
        name: 'Features using child properties whoes compatibility is unknown with the targeted browsers should fail.',
        reports: [{ message: 'capitalize of CSS is not added on chrome browser.' }],
        serverConfig: generateCSSConfig('text-transform')
    }
];

hintRunner.testHint(hintPath, childCompatibilityUnknown, { browserslist: ['chrome 65'], parsers: ['css']});

//case where version_added is false
const neverAdded: Array<HintTest> = [
    {
        name: 'Features that were never added should fail.',
        reports: [{ message: 'box-flex of CSS is not added on ie browser.' }],
        serverConfig: generateCSSConfig('box-flex')
    }
];

hintRunner.testHint(hintPath, neverAdded, { browserslist: ['ie 11'], parsers: ['css']});



