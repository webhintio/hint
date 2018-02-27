import { Problem, Severity } from 'sonarwhal/dist/src/lib/types';

const multipleproblemsandresources: Array<Problem> = [{
    location: {
        column: 10,
        elementColumn: 10,
        elementLine: 1,
        line: 1
    },
    message: 'This is a problem in line 1 column 10',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: '<a href="//link.com">link</a>'
},
{
    location: {
        column: -1,
        line: -1
    },
    message: 'This is a problem without line in myresource',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: ''
},
{
    location: {
        column: -1,
        line: -1
    },
    message: 'This is a problem without line',
    resource: 'http://myresource2.com/this/resource/is/really/really/long/resources/image/imagewithalongname.jpg',
    ruleId: 'random-rule',
    severity: Severity.error,
    sourceCode: ''
},
{
    location: {
        column: -1,
        line: -1
    },
    message: 'This is another problem without line',
    resource: 'http://myresource2.com/this/resource/is/really/really/long/resources/image/imagewithalongname.jpg',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: ''
},
{
    location: {
        column: 4,
        elementColumn: 19,
        elementLine: 2,
        line: 2
    },
    message: 'This is a problem in line 2 column 10',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: `<a href="//link.com">
        <img src="//image.jpg"/>
    </a>`
}];

const noproblems: Array<Problem> = [];

export {
    multipleproblemsandresources,
    noproblems
};
