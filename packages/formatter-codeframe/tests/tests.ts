import test from 'ava';
import chalk from 'chalk';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

const logging = { log() { } };

proxyquire('../src/formatter', { 'hint/dist/src/lib/utils/logging': logging });

import CodeframeFormatter from '../src/formatter';
import * as problems from './fixtures/list-of-problems';

test.beforeEach((t) => {
    sinon.spy(logging, 'log');

    t.context.logger = logging;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
});

test(`Codeframe formatter doesn't print anything if no values`, (t) => {
    const formatter = new CodeframeFormatter();

    formatter.format(problems.noproblems);

    t.is(t.context.logger.log.callCount, 0);
});

test(`Codeframe formatter prints a table and a summary for each resource`, (t) => {
    const formatter = new CodeframeFormatter();

    formatter.format(problems.codeframeproblems);

    const log = t.context.logger.log;
    let problem = problems.codeframeproblems[0];

    t.is(log.args[0][0], `${chalk.yellow('Warning')}: ${problem.message} (${problem.ruleId}) at ${chalk.cyan(problem.resource)}`);

    problem = problems.codeframeproblems[1];
    let sourceCode = problem.sourceCode.split('\n');

    t.is(log.args[2][0], `${chalk.yellow('Warning')}: ${problem.message} (${problem.ruleId}) at ${chalk.cyan(problem.resource)}:${problem.location.line}:${problem.location.column}`);
    t.is(log.args[4][0], sourceCode[0]);
    t.is(log.args[5][0], '^');
    t.is(log.args[8][0], '…');

    problem = problems.codeframeproblems[2];
    sourceCode = problem.sourceCode.split('\n');

    t.is(log.args[14][0], sourceCode[1]);

    problem = problems.codeframeproblems[3];
    sourceCode = problem.sourceCode.split('\n');
    t.is(log.args[22][0], `              ^`);

    problem = problems.codeframeproblems[4];
    sourceCode = problem.sourceCode.split('\n');
    t.is(log.args[29][0], `      ^`);
    t.is(log.args[30][0], sourceCode[2].trim());
    t.is(log.args[31][0], sourceCode[3]);
    t.is(log.args[32][0], '…');
});
