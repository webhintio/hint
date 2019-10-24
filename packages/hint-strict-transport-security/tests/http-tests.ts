import { HintTest, testHint } from '@hint/utils-tests-helpers';
import { getHintPath } from '@hint/utils';

import * as common from './_common';

const hintPath = getHintPath(__filename);

const noHttpServerTests: HintTest[] = [{
    name: `strict-transport-security header sent over HTTP`,
    // the max-age that passes before is now too short
    reports: [{ message: `'strict-transport-security' header should't be specified in pages served over HTTP.` }],
    serverConfig: Object.assign({}, { '/': { headers: common.maxAgeOnlyHeader } })
},
{
    name: `strict-transport-security header not sent over HTTP`,
    serverConfig: Object.assign({}, { '/': '' })
}];

testHint(hintPath, noHttpServerTests);
