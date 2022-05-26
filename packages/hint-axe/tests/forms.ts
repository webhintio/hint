import * as path from 'path';
import { getHintPath, HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

import { axeCoreVersion } from './_utils';

const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
    {
        name: `Label is required on form elements`,
        path: path.join(__dirname, 'fixtures', 'forms.jsx'),
        reports: [
            {
                documentation: [{
                    link: `https://dequeuniversity.com/rules/axe/${axeCoreVersion}/label?application=axeAPI`,
                    text: 'Learn more about this axe rule at Deque University'
                }],
                message: 'Form elements must have labels: Element has no title attribute Element has no placeholder attribute',
                position: { match: 'input' },
                severity: Severity.error
            }
        ]
    },
    {
        name: `Label is implied when {...spread} is used`,
        path: path.join(__dirname, 'fixtures', 'spread.jsx')
    }
];

testLocalHint(hintPath, tests, { parsers: ['javascript', 'jsx'] });
