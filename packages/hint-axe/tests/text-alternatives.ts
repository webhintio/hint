import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

const hintPath = getHintPath(__filename, true);

const html = {
    role: generateHTMLPage(undefined, `
<div>
    <h1>test</h1>
    <svg role="img"><title>test</title></svg>
</div>`)
};

const tests: HintTest[] = [
    {
        name: `HTML passes an svg with role`,
        serverConfig: html.role
    }
];

testHint(hintPath, tests);
