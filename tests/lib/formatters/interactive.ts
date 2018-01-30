import test from 'ava';
import chalk from 'chalk';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

const common = {
    printMessageByResource: () => {
        return { totalErrors: 0, totalWarnings: 1 };
    },
    reportTotal() { }
};
const logging = { log() { } };
const inquirer = { prompt() { } };
const exit = { expanded: 'exit' };

proxyquire('../../../src/lib/formatters/interactive/interactive', {
    '../../utils/logging': logging,
    '../utils/common': common,
    inquirer
});

import interactive from '../../../src/lib/formatters/interactive/interactive';
import * as problems from './fixtures/list-of-problems';

test.beforeEach((t) => {
    sinon.spy(logging, 'log');
    sinon.spy(common, 'printMessageByResource');
    t.context.logger = logging;
    t.context.common = common;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.common.printMessageByResource.restore();
});

test.serial(`Interactive formatter doesn't print anything if no values`, async (t) => {
    await interactive.format(problems.noproblems);

    t.is(t.context.logger.log.callCount, 0);
});

// Group by category.
test.serial(`Before showing the result, the interactive formatter prints a table of all categories and asks the user to select`, async (t) => {
    const selected = { expanded: 'security' };
    const sandbox = sinon.sandbox.create();

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(selected)
        .onSecondCall()
        .resolves(exit);

    const prompt = inquirer.prompt as sinon.SinonStub;

    await interactive.format(problems.interactiveProblems, 'category');

    const question1 = prompt.args[0][0][0];
    const question2 = prompt.args[1][0][0];

    t.is(question1.message, `Select the category that you'd like to expand or exit:`);
    t.is(question2.message, `Select the category that you'd like to expand or exit:`);
    t.is(question1.choices.length, 4);
    t.is(question1.choices[0].value, 'interoperability');
    t.is(question1.choices[1].value, 'security');
    t.is(question1.choices[2].value, 'all');
    t.is(question1.choices[3].value, 'exit');

    sandbox.restore();
});

test.serial(`Interactive formatter should print all the messages included in the selected category`, async (t) => {
    const log = t.context.logger.log;
    const selected = { expanded: 'security' };
    const sandbox = sinon.sandbox.create();
    const includedRuleId = 'x-content-type-options';

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(selected)
        .onSecondCall()
        .resolves(exit);

    await interactive.format(problems.interactiveProblems, 'category');

    const printTable = t.context.common.printMessageByResource;
    const includedRuleMessages = problems.interactiveProblems.filter((msg) => {
        return msg.ruleId === includedRuleId;
    });

    t.is(printTable.args.length, includedRuleMessages.length);
    t.is(printTable.args[0][0].ruleId, includedRuleId);
    t.is(printTable.args[1][0].ruleId, includedRuleId);
    t.is(printTable.args[2][0].ruleId, includedRuleId);
    t.is(log.args.length, 3);
    t.is(log.args[1][0], chalk.magenta(`security:`));

    sandbox.restore();
});

test.serial(`If the user goes back the the main menu, the currently selected categories should be checked by default`, async (t) => {
    const securitySelected = { expanded: 'security' };
    const interopSelected = { expanded: 'interoperability' };
    const sandbox = sinon.sandbox.create();

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(securitySelected)
        .onSecondCall()
        .resolves(interopSelected)
        .onThirdCall()
        .resolves(exit);

    const prompt = inquirer.prompt as sinon.SinonStub;

    await interactive.format(problems.interactiveProblems, 'category');

    t.is(prompt.args[1][0][0].default, 'security');
    t.is(prompt.args[2][0][0].default, 'interoperability');

    sandbox.restore();
});

// Group by domain.
test.serial(`Before showing the result, the interactive formatter prints a table of all domains and asks the user to select`, async (t) => {
    const selected = { expanded: 'myresource' };
    const sandbox = sinon.sandbox.create();

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(selected)
        .onSecondCall()
        .resolves(exit);

    const prompt = inquirer.prompt as sinon.SinonStub;

    await interactive.format(problems.interactiveProblems, 'domain');

    const question1 = prompt.args[0][0][0];
    const question2 = prompt.args[1][0][0];

    t.is(question1.message, `Select the domain that you'd like to expand or exit:`);
    t.is(question2.message, `Select the domain that you'd like to expand or exit:`);
    t.is(question1.choices.length, 4);
    t.is(question1.choices[0].value, 'myotherresource.com');
    t.is(question1.choices[1].value, 'myresource.com');

    sandbox.restore();
});

// No group option was set.
test.serial(`If no group option was set, the interactive formatter prints a table grouped by categories`, async (t) => {
    const selected = { expanded: ['security'] };
    const sandbox = sinon.sandbox.create();

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(selected)
        .onSecondCall()
        .resolves(exit);

    const prompt = inquirer.prompt as sinon.SinonStub;

    await interactive.format(problems.interactiveProblems);

    const question1 = prompt.args[0][0][0];
    const question2 = prompt.args[1][0][0];

    t.is(question1.message, `Select the category that you'd like to expand or exit:`);
    t.is(question2.message, `Select the category that you'd like to expand or exit:`);
    t.is(question1.choices.length, 4);
    t.is(question1.choices[0].value, 'interoperability');
    t.is(question1.choices[1].value, 'security');

    sandbox.restore();
});
