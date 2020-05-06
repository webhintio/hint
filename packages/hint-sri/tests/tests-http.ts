import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { readFile } from '@hint/utils-fs';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const styles = readFile(`${__dirname}/fixtures/styles.css`);

const defaultTestsHttp: HintTest[] = [
    {
        name: `Page with a same-origin resource and SRI sha384 fails if content is delivered via http`,
        reports: [{
            message: 'Resource was not delivered via a secure context.',
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha384-5YxmVGC5j04J1+MIPUDtqFa/SGXzua7jY1f563CdmtCQAESgM0+KazhGqzlOxNoQ">'),
            '/styles.css': styles
        }
    }
];

testHint(hintPath, defaultTestsHttp);
