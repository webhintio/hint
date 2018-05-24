import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const ruleName = 'stylesheet-limits';

const generateCSSRules = (count = 1) => {
    let rules = [];
    for (let i = 1; i <= count; i++) {
        rules.push(`.r${i}`);
    }
    return rules.join(',') + ' { color: #fff }';
};

/*
 * You should test for cases where the rule passes and doesn't.
 * More information about how `ruleRunner` can be configured is
 * available in:
 * https://sonarwhal.com/docs/contributor-guide/rules/#howtotestarule
 */
const maxRules = 65534;
ruleRunner.testRule(ruleName, [
    {
        name: `Page contains less than ${maxRules} CSS rules`,
        serverConfig: generateHTMLPage(`<style>${generateCSSRules(maxRules - 1)}</style>`)
    },
    {
        name: `Page contains ${maxRules} CSS rules`,
        reports: [{ message: `Maximum of ${maxRules} CSS rules reached (${maxRules})` }],
        serverConfig: generateHTMLPage(`<style>${generateCSSRules(maxRules)}</style>`)
    }
]);

const maxRulesIE9 = 4095;
ruleRunner.testRule(ruleName, [
    {
        name: `Page targeting IE9 contains less than ${maxRulesIE9} CSS rules`,
        serverConfig: generateHTMLPage(`<style>${generateCSSRules(maxRulesIE9 - 1)}</style>`)
    },
    {
        name: `Page targeting IE9 contains ${maxRulesIE9} CSS rules`,
        reports: [{ message: `Maximum of ${maxRulesIE9} CSS rules reached (${maxRulesIE9})` }],
        serverConfig: generateHTMLPage(`<style>${generateCSSRules(maxRulesIE9)}</style>`)
    }
], {
    browserslist: ['IE 9']
});

const maxRulesCustom = 10;
ruleRunner.testRule(ruleName, [
    {
        name: `Page contains less than the customized ${maxRulesCustom} CSS rules`,
        serverConfig: generateHTMLPage(`<style>${generateCSSRules(maxRulesCustom - 1)}</style>`)
    },
    {
        name: `Page contains the customized ${maxRulesCustom} CSS rules`,
        reports: [{ message: `Maximum of ${maxRulesCustom} CSS rules reached (${maxRulesCustom})` }],
        serverConfig: generateHTMLPage(`<style>${generateCSSRules(maxRulesCustom)}</style>`)
    }
], {
    ruleOptions: { 
        'max-css-rules': 10
    }
});
