import { IProblem, Severity } from '../../../../src/lib/types';

const multipleproblems: Array<IProblem> = [{
    location: {
        column: 10,
        line: 1
    },
    message: 'This is a problem in line 1 column 10',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: ''
},
{
    location: {
        column: 1,
        line: 10
    },
    message: 'This is a problem in line 10',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: ''
},
{
    location: {
        column: 1,
        line: 5
    },
    message: 'This is a problem in line 5',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: ''
},
{
    location: {
        column: 1,
        line: 1
    },
    message: 'This is a problem in line 1 column 1',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: ''
}];

const multipleproblemsandresources: Array<IProblem> = [{
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

const summaryProblems: Array<IProblem> = [{
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
    ruleId: 'random-rule2',
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


const codeframeproblems: Array<IProblem> = [{
    location: {
        column: -1,
        line: -1
    },
    message: 'This is a problem without line in myresource',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: ''
}, {
    location: {
        column: 16,
        elementColumn: 0,
        elementLine: 1,
        line: 1
    },
    message: 'This is a problem with a location',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: `<html lang="en"><head>
        <meta charset="utf-8">
        <title></title>
        <meta name="description" content="sonarwhal website">
        <meta name="viewport" content="width=device-width">

        <meta name="theme-color" content="#4046dd">
        <link rel="manifest" href="/site.webmanifest">

        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png">

        <link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32">
        <link rel="icon" type="image/png" href="/images/favicon-16x16.png" sizes="16x16">

        <link rel="stylesheet" href="/core/css/base.css">
        <link rel="stylesheet" href="/core/css/color.css">
        <link rel="stylesheet" href="/core/css/footer.css">
        <link rel="stylesheet" href="/core/css/helpers.css">
        <link rel="stylesheet" href="/core/css/layouts.css">
        <link rel="stylesheet" href="/core/css/navigation.css">
        <link rel="stylesheet" href="/core/css/search-results.css">
        <link rel="stylesheet" href="/core/css/structure.css">
        <link rel="stylesheet" href="/core/css/type.css">
        <link rel="stylesheet" href="/core/css/highlight.css">
        <link rel="stylesheet" href="/components/breadcrumb/breadcrumb.css">
        <link rel="stylesheet" href="/core/css/controls.css">
            <link rel="stylesheet" href="/core/css/home.css">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:200,300,400,500,600" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.css">
    </head>

    <body>
</body></html>`
}, {
    location: {
        column: 16,
        elementColumn: 0,
        elementLine: 1,
        line: 1
    },
    message: `This is a problem in an element with wrong tabs`,
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: `<html lang="en"><head>
<meta charset="utf-8">
        <title></title>
    </head>

    <body>
</body></html>`
},
{
    location: {
        column: 4,
        elementColumn: 19,
        elementLine: 2,
        line: 2
    },
    message: 'This is a problem inside an element',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: `<a href="//link.com">
            <img src="//image.jpg"/>
        </a>`
}, {
    location: {
        column: 16,
        elementColumn: 7,
        elementLine: 2,
        line: 3
    },
    message: 'This is a problem inside an element with a wrong tab in the problem',
    resource: 'http://myresource.com/',
    ruleId: 'random-rule',
    severity: Severity.warning,
    sourceCode: `<html lang="en"><head>
<meta charset="utf-8">
        <title></title>
    </head>

    <body>
        </body></html>`
}];

const noproblems: Array<IProblem> = [];

const interactiveProblems: Array<IProblem> = [{
    location: {
        column: -1,
        line: -1
    },
    message: 'x-content-type-options\' header value (nosniff,nosniff) is invalid',
    resource: 'http://myresource.com/',
    ruleId: 'x-content-type-options',
    severity: 1,
    sourceCode: null
},
{
    location: { column: 19807, elementColumn: 0, elementLine: 1, line: 7 },
    message: `'x-content-type-options' header was not specified`,
    resource: 'http://myresource.com/',
    ruleId: 'x-content-type-options',
    severity: 1,
    sourceCode: `<img src="https://az817829.vo.msecnd.net/media/2017/12/grid-demo-thumb-51d01bb8-9b67-4c44-9671-f550d1c53b9e.png" alt="" role="none">`
},
{
    location: { column: 20338, elementColumn: 0, elementLine: 1, line: 7 },
    message: `'x-content-type-options' header was not specified`,
    resource: 'http://myresource.com/',
    ruleId: 'x-content-type-options',
    severity: 1,
    sourceCode: `<img src="https://az817829.vo.msecnd.net/media/hello.png" alt="" role="none">`
},
{
    location: { column: 424, elementColumn: 0, elementLine: 1, line: 3 },
    message: `'content-type' header should have 'charset=utf-8'`,
    resource: 'http://myresource.com/',
    ruleId: 'content-type',
    severity: 1,
    sourceCode: `<link rel="stylesheet" href="https://az813057.vo.msecnd.net/styles/home.a6114ef.css">`
}];

const groupedProblems = {
    interoperability: [{
        location: { column: 424, elementColumn: 0, elementLine: 1, line: 3 },
        message: `'content-type' header should have 'charset=utf-8'`,
        resource: 'http://myresource.com/',
        ruleId: 'content-type',
        severity: 1,
        sourceCode: `<link rel="stylesheet" href="https://az813057.vo.msecnd.net/styles/home.a6114ef.css">`
    }],
    security: [{
        location: {
            column: -1,
            line: -1
        },
        message: 'x-content-type-options\' header value (nosniff,nosniff) is invalid',
        resource: 'http://myresource.com/',
        ruleId: 'x-content-type-options',
        severity: 1,
        sourceCode: null
    },
    {
        location: { column: 19807, elementColumn: 0, elementLine: 1, line: 7 },
        message: `'x-content-type-options' header was not specified`,
        resource: 'http://myresource.com/',
        ruleId: 'x-content-type-options',
        severity: 1,
        sourceCode: `<img src="https://az817829.vo.msecnd.net/media/2017/12/grid-demo-thumb-51d01bb8-9b67-4c44-9671-f550d1c53b9e.png" alt="" role="none">`
    },
    {
        location: { column: 20338, elementColumn: 0, elementLine: 1, line: 7 },
        message: `'x-content-type-options' header was not specified`,
        resource: 'http://myresource.com/',
        ruleId: 'x-content-type-options',
        severity: 1,
        sourceCode: `<img src="https://az817829.vo.msecnd.net/media/hello.png" alt="" role="none">`
    }]
};

export {
    codeframeproblems,
    interactiveProblems,
    groupedProblems,
    multipleproblems,
    multipleproblemsandresources,
    noproblems,
    summaryProblems
};
