import * as path from 'path';
import * as mock from 'mock-require';

import { getHintPath, HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';
import { loadJSONFile } from '@hint/utils-fs';
import { Severity } from '@hint/utils-types';

const webpackDestPath = path.join(__dirname, 'fixtures', 'valid', 'package.json');
const webpackConfig = loadJSONFile(webpackDestPath);

const hintPath = getHintPath(__filename, true);
const tests: HintLocalTest[] = [
    {
        before() {
            // Using `as any` to avoid `read-only` error.
            const loadPackage = () => {
                return webpackConfig;
            };

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
        },
        name: 'If valid configuration file exists and webpack is installed should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        before() {
            const loadPackage = () => {
                throw new Error('error');
            };

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
        },
        name: 'If valid configuration file exists but webpack is not installed should fail',
        path: path.join(__dirname, 'fixtures', 'valid'),
        reports: [{
            message: `webpack is not installed in your project.`,
            severity: Severity.warning
        }]
    }
];

testLocalHint(hintPath, tests, {
    parsers: ['webpack-config'],
    serial: true
});
