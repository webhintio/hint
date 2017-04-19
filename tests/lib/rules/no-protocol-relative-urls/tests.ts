/* eslint sort-keys: 0, no-undefined: 0 */

import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';

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
        reports: [{
            message: 'Protocol relative URL found: //site.webmanifest',
            position: { column: 28, line: 1 }
        }],
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <link rel="manifest" href="//site.webmanifest">
    </head>
    <body></body>
</html>`
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
        reports: [{
            message: 'Protocol relative URL found: //script.js',
            position: { column: 14, line: 1 }
        }],
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <script src="//script.js"></script>
    </head>
    <body></body>
</html>`
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
        reports: [{
            message: 'Protocol relative URL found: //home',
            position: { column: 10, line: 1 }
        }],
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
    </head>
    <body>
        <a href="//home">home</a>
    </body>
</html>`
    },
    {
        name: `'script' with no "src" passes the rule`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <script>var a = 10;</script>
    </head>
    <body>
    </body>
</html>`
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests);
