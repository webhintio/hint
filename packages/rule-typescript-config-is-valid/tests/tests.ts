import * as path from 'path';
import { test } from 'ava';

import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';
import { RulesConfigObject, UserConfig } from 'sonarwhal/dist/src/lib/types';
import * as resourceLoader from 'sonarwhal/dist/src/lib/utils/resource-loader';

import { SonarwhalConfig } from 'sonarwhal/dist/src/lib/config';
import { getAsUri } from 'sonarwhal/dist/src/lib/utils/get-as-uri';

const ruleName = getRuleName(__dirname);

/*
 * You should test for cases where the rule passes and doesn't.
 * More information about how `ruleRunner` can be configured is
 * available in:
 * https://sonarwhal.com/docs/contributor-guide/rules/#howtotestarule
 */
const tests: Array<{ dir: string, name: string, reports?: Array<any> }> = [
    {
        dir: path.join(__dirname, 'fixtures', 'valid'),
        name: 'Valid configuration should pass'
    },
    {
        dir: path.join(__dirname, 'fixtures', 'noconfig'),
        name: `If there is no config files, it should pass`
    },
    {
        dir: path.join(__dirname, 'fixtures', 'invalidjson'),
        name: 'Invalid configuration should fail',
        reports: [{ message: `Unexpected token ' in JSON at position 148` }]
    },
    {
        dir: path.join(__dirname, 'fixtures', 'invalidschema'),
        name: 'Invalid configuration should fail',
        reports: [{ message: `'compilerOptions.lib[3]' should be equal to one of the allowed values 'es5, es6, es2015, es7, es2016, es2017, es2018, esnext, dom, dom.iterable, webworker, scripthost, es2015.core, es2015.collection, es2015.generator, es2015.iterable, es2015.promise, es2015.proxy, es2015.reflect, es2015.symbol, es2015.symbol.wellknown, es2016.array.include, es2017.object, es2017.sharedmemory, es2017.typedarrays, esnext.array, esnext.asynciterable, esnext.promise'. Value found 'invalidlib'` }]
    }
];

const rules: RulesConfigObject = {};

rules[ruleName] = 'error';

const config: UserConfig = {
    browserslist: [],
    connector: {
        name: 'local',
        options: {}
    },
    parsers: ['typescript-config'],
    rules
};

const sonarwhalConfig = SonarwhalConfig.fromConfig(config);
const resources = resourceLoader.loadResources(sonarwhalConfig);

tests.forEach((ruleTest) => {
    test(ruleTest.name, async (t) => {
        const sonarwhal = new Sonarwhal(sonarwhalConfig, resources);

        const results = await sonarwhal.executeOn(getAsUri(ruleTest.dir));

        if (!ruleTest.reports) {
            return t.is(results.length, 0, `Received results is ${JSON.stringify(results, null, 2)}`);
        }

        if (results.length === 0) {
            return t.fail(`No results found, should be ${ruleTest.reports.length}`);
        }

        if (results.length !== ruleTest.reports.length) {
            return t.fail(`Result count is ${results.length}, should be ${ruleTest.reports.length}`);
        }

        return ruleTest.reports.forEach((r, index) => {
            t.is(r.message, results[index].message);
        });
    });
});
