import { Problem, Severity } from '../../../../lib/types'; //eslint-disable-line no-unused-vars

const multipleproblems: Array<Problem> = [{
    column: 10,
    line: 1,
    message: 'This is a problem in line 1 column 10',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning
},
{
    column: 1,
    line: 10,
    message: 'This is a problem in line 10',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning
},
{
    column: 1,
    line: 5,
    message: 'This is a problem in line 5',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning
},
{
    column: 1,
    line: 1,
    message: 'This is a problem in line 1 column 1',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning
}];

const noproblems: Array<Problem> = [];

export {
    multipleproblems,
    noproblems
};
