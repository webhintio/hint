import * as path from 'path';
import * as mock from 'mock-require';

import { fs, test } from '@hint/utils';
import { HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';

const { getHintPath } = test;
const { loadJSONFile } = fs;

const webpackDestPath = path.join(__dirname, 'fixtures', 'valid', 'package.json');
const webpackConfig = loadJSONFile(webpackDestPath);

const hintPath = getHintPath(__filename, true);
const tests: HintLocalTest[] = [
    {
        before() {
            const loadPackage = () => {
                return webpackConfig;
            };

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
        },
        name: 'If no devtool in configuration, it should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        before() {
            const loadPackage = () => {
                return webpackConfig;
            };

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
        },
        name: 'If devtool has a value different than `eval`, it should pass',
        path: path.join(__dirname, 'fixtures', 'noeval')
    },
    {
        before() {
            const loadPackage = () => {
                return webpackConfig;
            };

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
        },
        name: 'If devtool is set to `eval` should fail',
        path: path.join(__dirname, 'fixtures', 'eval'),
        reports: [{ message: '`eval` not recommended for prodution' }]
    }
];

testLocalHint(hintPath, tests, {
    parsers: ['webpack-config'],
    serial: true
});
