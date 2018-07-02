import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';

import * as common from './_common';

const hintPath = getHintPath(__filename);

const noHttpServerTests: Array<HintTest> = [{
    name: `strict-transport-security sent over HTTP`,
    // the max-age that passes before is now too short
    reports: [{ message: `'strict-transport-security' header should't be specified in pages served over HTTP.` }],
    serverConfig: Object.assign({}, { '/': { headers: common.maxAgeOnlyHeader } })
}];

hintRunner.testHint(hintPath, noHttpServerTests);
