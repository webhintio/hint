import { fs, test } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { readFile } = fs;
const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);

const styles = readFile(`${__dirname}/fixtures/styles.css`);

const defaultTestsHttp: HintTest[] = [
    {
        name: `Page with a same-origin resource and SRI sha384 fails if content is delivered via http`,
        reports: [{ message: 'The resource http://localhost/styles.css is not delivered via a secure context' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha384-5YxmVGC5j04J1+MIPUDtqFa/SGXzua7jY1f563CdmtCQAESgM0+KazhGqzlOxNoQ">'),
            '/styles.css': styles
        }
    }
];

testHint(hintPath, defaultTestsHttp);
