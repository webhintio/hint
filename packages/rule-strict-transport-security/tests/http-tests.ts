import { IRuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

import * as common from './_common';

const ruleName = getRuleName(__dirname);

const noHttpServerTests: Array<IRuleTest> = [{
    name: `strict-transport-security sent over HTTP`,
    // the max-age that passes before is now too short
    reports: [{ message: `'strict-transport-security' header should't be specified in pages served over HTTP.` }],
    serverConfig: Object.assign({}, { '/': { headers: common.maxAgeOnlyHeader } })
}];

ruleRunner.testRule(ruleName, noHttpServerTests);
