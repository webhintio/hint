import { IProblem, Severity } from '../../../../src/lib/types'; //eslint-disable-line no-unused-vars

const multipleproblems: Array<IProblem> = [{
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

const multipleproblemsandresources: Array<IProblem> = [{
    column: 10,
    line: 1,
    message: 'This is a problem in line 1 column 10',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning
},
{
    column: -1,
    line: -1,
    message: 'This is a problem without line in myresource',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning
},
{
    column: -1,
    line: -1,
    message: 'This is a problem without line',
    resource: 'http://myresource2.com/this/resource/is/really/really/long/resources/image/imagewithalongname.jpg',
    ruleId: 'random-rule',
    severity: Severity.error
},
{
    column: -1,
    line: -1,
    message: 'This is another problem without line',
    resource: 'http://myresource2.com/this/resource/is/really/really/long/resources/image/imagewithalongname.jpg',
    ruleId: 'random-rule',
    severity: Severity.warning
}];

const noproblems: Array<IProblem> = [];

export {
    multipleproblems,
    multipleproblemsandresources,
    noproblems
};
