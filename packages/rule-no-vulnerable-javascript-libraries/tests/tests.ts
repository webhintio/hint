/* eslint sort-keys: 0, no-sync: 0 */

import * as fs from 'fs';

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getRulePath } from 'hint/dist/src/lib/utils/rule-helpers';
import { RuleTest } from '@hint/utils-tests-helpers/dist/src/rule-test-type';
import * as ruleRunner from '@hint/utils-tests-helpers/dist/src/rule-runner';

const generateScriptTag = (script) => {
    return `<script>${script}</script>`;
};

const rulePath = getRulePath(__filename);

const angular = fs.readFileSync(require.resolve('angular/angular.min.js'), 'utf-8');
const jquery = fs.readFileSync(require.resolve('jquery/dist/jquery.min.js'), 'utf-8');
const knockout = fs.readFileSync(require.resolve('knockout/dist/knockout.js'), 'utf-8');
const moment = fs.readFileSync(require.resolve('moment/moment.min.js'), 'utf-8');


const defaultTests: Array<RuleTest> = [
    {
        name: `page with no libraries passes the rule`,
        serverConfig: generateHTMLPage()
    },
    {
        name: `page with a vulnerable library (jquery 2.1.4) fails`,
        reports: [{ message: 'jQuery@2.1.4 has 1 known vulnerability (1 medium). See https://snyk.io/vuln/npm:jquery for more information.' }],
        serverConfig: generateHTMLPage(generateScriptTag(jquery))
    },
    {
        name: `page with a library with a tagged version and vulnerabilities (knockout 3.4.0-rc) fails`,
        reports: [{ message: 'Knockout@3.4.0rc has 1 known vulnerability (1 medium). See https://snyk.io/vuln/npm:knockout for more information.' }],
        serverConfig: generateHTMLPage(generateScriptTag(knockout))
    },
    {
        name: `page with non vulnerable library (moment 1.0.0) passes`,
        serverConfig: generateHTMLPage(generateScriptTag(moment))
    }
];

const userHighConfigTests: Array<RuleTest> = [
    {
        name: `page with a library with vulnerabilities medium or lower passes if configured severity is "high"`,
        serverConfig: generateHTMLPage(generateScriptTag(jquery))
    },
    {
        name: `page with a library with vulnerabilities high fails if configured severity is "high"`,
        reports: [{ message: 'AngularJS@1.4.9 has 3 known vulnerabilities (3 high). See https://snyk.io/vuln/npm:angular for more information.' }],
        serverConfig: generateHTMLPage(generateScriptTag(angular))
    }
];

const userMediumConfigTests: Array<RuleTest> = [
    {
        name: `page with a library with vulnerabilities medium fails if configured severity is "medium"`,
        reports: [{ message: 'jQuery@2.1.4 has 1 known vulnerability (1 medium). See https://snyk.io/vuln/npm:jquery for more information.' }],
        serverConfig: generateHTMLPage(generateScriptTag(jquery))
    },
    {
        name: `page with a library with vulnerabilities high fails if configured severity is "medium"`,
        reports: [{ message: 'AngularJS@1.4.9 has 10 known vulnerabilities (3 high, 7 medium). See https://snyk.io/vuln/npm:angular for more information.' }],
        serverConfig: generateHTMLPage(generateScriptTag(angular))
    }
];

ruleRunner.testRule(rulePath, defaultTests);
ruleRunner.testRule(rulePath, userHighConfigTests, { ruleOptions: { severity: 'high' } });
ruleRunner.testRule(rulePath, userMediumConfigTests, { ruleOptions: { severity: 'medium' } });
