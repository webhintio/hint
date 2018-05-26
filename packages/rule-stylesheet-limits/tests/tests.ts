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

const generateStyleSheets = (count = 1) => {
    let sheets = [];
    for (let i = 1; i <= count; i++) {
        sheets.push('<style>.r { color: #fff }</style>');
    }
    return sheets.join('\n');
};

const generateImports = (count = 1) => {
    const config = {
        '/': generateHTMLPage(`<style>@import url('i1.css');</style>`)
    }
    for (let i = 1; i <= count; i++) {
        config[`/i${i}.css`] = {
            content: i < count ? `@import url('i${i + 1}.css');\n.r { color: #fff }` : '.r { color: #fff }',
            headers: { 'Content-Type': 'text/css' }
        }
    }
    return config;
}

function test(label, limits: { maxRules: number, maxSheets: number, maxImports: number }, configs: any) {
    let { maxRules, maxSheets, maxImports } = limits;

    ruleRunner.testRule(ruleName, [
        {
            name: `Page${label} contains less than ${maxRules} CSS rules`,
            serverConfig: generateHTMLPage(`<style>${generateCSSRules(maxRules - 1)}</style>`)
        },
        {
            name: `Page${label} contains ${maxRules} CSS rules`,
            reports: [{ message: `Maximum of ${maxRules} CSS rules reached (${maxRules})` }],
            serverConfig: generateHTMLPage(`<style>${generateCSSRules(maxRules)}</style>`)
        },
        {
            name: `Page${label} contains less than ${maxSheets} stylesheets`,
            serverConfig: generateHTMLPage(generateStyleSheets(maxSheets - 1))
        },
        {
            name: `Page${label} contains ${maxSheets} stylesheets`,
            reports: [{ message: `Maximum of ${maxSheets} stylesheets reached (${maxSheets})` }],
            serverConfig: generateHTMLPage(generateStyleSheets(maxSheets))
        }
    ], configs);

    if (maxImports) {
        ruleRunner.testRule(ruleName, [
            {
                name: `Page${label} contains less than ${maxImports} nested imports`,
                serverConfig: generateImports(maxImports - 1)
            },
            {
                name: `Page${label} contains ${maxImports} nested imports`,
                reports: [{ message: `Maximum of ${maxImports} nested imports reached (${maxImports})` }],
                serverConfig: generateImports(maxImports)
            }
            
        //  exclude jsdom since it currently ignores @import rules
        //  https://github.com/jsdom/jsdom/issues/2124
        ], { ...configs, ignoredConnectors: ['jsdom'] });
    }
}

test('', {
    maxRules: 65534,
    maxSheets: 4095,
    maxImports: 0
}, {
    serial: true, //  keeps the tests from timing out due to the large numbers being checked
});

test(' targeting IE9', {
    maxRules: 4095,
    maxSheets: 31,
    maxImports: 4
}, {
    browserslist: ['IE 9']
});

const customLimits = {
    maxRules: 10,
    maxSheets: 4,
    maxImports: 2
};

test(' with custom limits', customLimits, {
    ruleOptions: customLimits
});
