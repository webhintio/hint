import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

import * as common from './_common';

const rulePath = getRulePath(__filename);

const noHttpServerTests: Array<RuleTest> = [{
    name: `strict-transport-security sent over HTTP`,
    // the max-age that passes before is now too short
    reports: [{ message: `'strict-transport-security' header should't be specified in pages served over HTTP.` }],
    serverConfig: Object.assign({}, { '/': { headers: common.maxAgeOnlyHeader } })
}];

ruleRunner.testRule(rulePath, noHttpServerTests);
