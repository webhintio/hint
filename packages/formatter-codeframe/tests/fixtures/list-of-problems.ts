import { Problem, Severity } from 'hint/dist/src/lib/types';
import { Category } from 'hint/dist/src/lib/enums/category';

const codeframeproblems: Array<Problem> = [{
    category: Category.other,
    hintId: 'random-hint',
    location: {
        column: -1,
        line: -1
    },
    message: 'This is a problem without line in myresource',
    resource: 'http://myresource.com/',
    severity: Severity.warning,
    sourceCode: ''
}, {
    category: Category.other,
    hintId: 'random-hint',
    location: {
        column: 16,
        elementColumn: 0,
        elementLine: 1,
        line: 1
    },
    message: 'This is a problem with a location',
    resource: 'http://myresource.com/',
    severity: Severity.warning,
    sourceCode: `<html lang="en"><head>
        <meta charset="utf-8">
        <title></title>
        <meta name="description" content="webhint website">
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
    category: Category.other,
    hintId: 'random-hint',
    location: {
        column: 16,
        elementColumn: 0,
        elementLine: 1,
        line: 1
    },
    message: `This is a problem in an element with wrong tabs`,
    resource: 'http://myresource.com/',
    severity: Severity.warning,
    sourceCode: `<html lang="en"><head>
<meta charset="utf-8">
        <title></title>
    </head>

    <body>
</body></html>`
},
{
    category: Category.other,
    hintId: 'random-hint',
    location: {
        column: 4,
        elementColumn: 19,
        elementLine: 2,
        line: 2
    },
    message: 'This is a problem inside an element',
    resource: 'http://myresource.com/',
    severity: Severity.warning,
    sourceCode: `<a href="//link.com">
            <img src="//image.jpg"/>
        </a>`
}, {
    category: Category.other,
    hintId: 'random-hint',
    location: {
        column: 16,
        elementColumn: 7,
        elementLine: 2,
        line: 3
    },
    message: 'This is a problem inside an element with a wrong tab in the problem',
    resource: 'http://myresource.com/',
    severity: Severity.error,
    sourceCode: `<html lang="en"><head>
<meta charset="utf-8">
        <title></title>
    </head>

    <body>
        </body></html>`
}];

const noproblems: Array<Problem> = [];

export {
    codeframeproblems,
    noproblems
};
