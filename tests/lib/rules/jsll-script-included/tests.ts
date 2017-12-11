import { generateHTMLPage } from '../../../helpers/misc';
import { IRuleTest } from '../../../helpers/rule-test-type';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import * as ruleRunner from '../../../helpers/rule-runner';

const ruleName: string = getRuleName(__dirname);
const baseUrl: string = `https://az725175.vo.msecnd.net/scripts/jsll`;
const simpleVersionLink: string = `${baseUrl}-4.js`;
const specifiedVersionLink: string = `${baseUrl}-4.2.1.js`;
const invalidVersionLink: string = `${baseUrl}-4-2-1.js`;
const redundantScriptLinks: Array<string> = [`${baseUrl}-4.js`, `${baseUrl}-4.2.1.js`];
const wrongScriptOrderLinks: Array<string> = [`https://uhf.microsoft.com/mscc/statics/mscc-0.3.6.min.js`, `${baseUrl}-4.js`];

const generateScript = (links: string | Array<string>) => {
    let generatedScript = '';
    const scriptLinks = Array.isArray(links) ? links : [links];

    scriptLinks.forEach((link) => {
        generatedScript += `<script src="${link}"></script>`;
    });

    return generatedScript;
};

// Messages.
const noScriptInHeadMsg = `No JSLL script was included in the <head> tag.`;
const redundantScriptInHeadMsg = `More than one JSLL scripts were included in the <head> tag.`;
const warningScriptVersionMsg = `Use the latest release of JSLL with 'jsll-4.js'. It is not recommended to specify the version number unless you wish to lock to a specific release.`;
const invalidScriptVersionMsg = `The jsll script versioning is not valid.`;
const wrongScriptOrderMsg = `The JSLL script isn't placed prior to other scripts.`;

const tests: Array<IRuleTest> = [
    {
        name: 'JSLL script locates in the <head> tag and has the recommended version format',
        serverConfig: generateHTMLPage(generateScript(simpleVersionLink))
    },
    {
        name: 'Multiple JSLL scripts are included in the page',
        reports: [{ message: redundantScriptInHeadMsg }],
        serverConfig: generateHTMLPage(generateScript(redundantScriptLinks))
    },
    {
        name: 'JSLL script locates in the <body> tag instead of the <head> tag',
        reports: [{ message: noScriptInHeadMsg }],
        serverConfig: generateHTMLPage(null, generateScript(simpleVersionLink))
    },
    {
        name: 'JSLL script name has the specified version format',
        reports: [{ message: warningScriptVersionMsg }],
        serverConfig: generateHTMLPage(generateScript(specifiedVersionLink))
    },
    {
        name: 'JSLL script name has an invalid version in name',
        reports: [{ message: invalidScriptVersionMsg }],
        serverConfig: generateHTMLPage(generateScript(invalidVersionLink))
    },
    {
        name: 'JSLL script is not placed prior to other scripts',
        reports: [{ message: wrongScriptOrderMsg }],
        serverConfig: generateHTMLPage(generateScript(wrongScriptOrderLinks))
    },
    {
        name: 'JSLL script placed prior to other scripts',
        serverConfig: generateHTMLPage(generateScript(wrongScriptOrderLinks.reverse()))
    }
];

ruleRunner.testRule(ruleName, tests);
