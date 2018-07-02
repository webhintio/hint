import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const styles = readFile(`${__dirname}/fixtures/styles.css`);

const defaultTestsHttp: Array<HintTest> = [
    {
        name: `Page with a same-origin resource and SRI sha384 fails if content is delivered via http`,
        reports: [{ message: 'The resource is not delivered via a secure context' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha384-5YxmVGC5j04J1+MIPUDtqFa/SGXzua7jY1f563CdmtCQAESgM0+KazhGqzlOxNoQ">'),
            '/styles.css': styles
        }
    }
];

hintRunner.testHint(hintPath, defaultTestsHttp);
