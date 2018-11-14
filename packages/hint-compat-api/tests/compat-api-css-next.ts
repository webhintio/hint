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

const featureAddedBeforeTargetedBrowsers: Array<HintTest> = [
    {
        name: 'Features that were added in versions earlier than the targeted browsers should pass.',
        serverConfig: generateCSSConfig('charset')
    }
];

hintRunner.testHint(hintPath, featureAddedBeforeTargetedBrowsers, { browserslist: ['last 2 Chrome versions'], parsers: ['css']});

const prefixedFeatureAddedTrue: Array<HintTest> = [
    {
        name: 'Prefixed features that have version added as true should pass.',
        serverConfig: generateCSSConfig('box-flex-prefix')
    }
];

hintRunner.testHint(hintPath, prefixedFeatureAddedTrue, { browserslist: ['chrome 32', 'chrome 63 - 65'], parsers: ['css']});

const featureVersionAddedNull: Array<HintTest> = [
    {
        name: 'Features that have version added as null under the targeted browsers should pass.',
        serverConfig: generateCSSConfig('background-repeat')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedNull, { browserslist: ['and_chr 69'], parsers: ['css']});

const childFeatureVersionAddedNull: Array<HintTest> = [
    {
        name: 'Features using child properties that have version added as null under the targeted browsers should pass.',
        serverConfig: generateCSSConfig('text-transform')
    }
];

hintRunner.testHint(hintPath, childFeatureVersionAddedNull, { browserslist: ['chrome 65'], parsers: ['css']});

const featureVersionAddedFalse: Array<HintTest> = [
    {
        name: 'Features that have version added as false should fail.',
        reports: [{ message: 'box-flex of CSS is not added on ie browser.' }],
        serverConfig: generateCSSConfig('box-flex')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedFalse, { browserslist: ['ie 11'], parsers: ['css']});
