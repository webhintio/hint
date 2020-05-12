import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

import * as common from './_common';

const hintPath = getHintPath(__filename);

const noHttpServerTests: HintTest[] = [{
    name: `strict-transport-security header sent over HTTP`,
    // the max-age that passes before is now too short
    reports: [{
        message: `The 'strict-transport-security' header should't be specified in pages served over HTTP.`,
        severity: Severity.warning
    }],
    serverConfig: { ...{ '/': { headers: common.maxAgeOnlyHeader } } }
},
{
    name: `strict-transport-security header not sent over HTTP`,
    serverConfig: { '/': '' }
}];

testHint(hintPath, noHttpServerTests);
