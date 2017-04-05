/* eslint sort-keys: 0, no-undefined: 0 */

import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const tests: Array<RuleTest> = [
    {
        name: `'link' with no initial slashes passes the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <link rel="manifest" href="site.webmanifest">
    </head>
    <body></body>
</html>`
    },
    {
        name: `'link' with initial / passes the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <link rel="manifest" href="/site.webmanifest">
    </head>
    <body></body>
</html>`
    },
    {
        name: `'link' with http passes the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <link rel="manifest" href="http://localhost/site.webmanifest">
    </head>
    <body></body>
</html>`
    },
    {
        name: `'link' with initial // fails the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <link rel="manifest" href="//site.webmanifest">
    </head>
    <body></body>
</html>`,
        reports: [{
            message: 'Invalid link found: //site.webmanifest',
            position: { column: 36, line: 3 }
        }]
    },
    {
        name: `'script' with no initial slashes passes the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <script src="script.js"></script>
    </head>
    <body></body>
</html>`
    },
    {
        name: `'script' with initial / passes the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <script src="/script.js"></script>
    </head>
    <body></body>
</html>`
    },
    {
        name: `'script' with http passes the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <script src="http://localhost/script.js"></script>
    </head>
    <body></body>
</html>`
    },
    {
        name: `'script' with initial // fails the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <script src="//script.js"></script>
    </head>
    <body></body>
</html>`,
        reports: [{
            message: 'Invalid link found: //script.js',
            position: { column: 22, line: 3 }
        }]
    },
    {
        name: `'a' with no initial slashes passes the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
    </head>
    <body>
        <a href="home">home</a>
    </body>
</html>`
    },
    {
        name: `'a' with initial / passes the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
    </head>
    <body>
        <a href="/home">home</a>
    </body>
</html>`
    },
    {
        name: `'a' with http passes the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
    </head>
    <body>
        <a href="http://localhost/home">home</a>
    </body>
</html>`
    },
    {
        name: `'a' with initial // fails the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
    </head>
    <body>
        <a href="//home">home</a>
    </body>
</html>`,
        reports: [{
            message: 'Invalid link found: //home',
            position: { column: 18, line: 5 }
        }]
    }
];

ruleRunner.testRule('no-double-slash', tests);
