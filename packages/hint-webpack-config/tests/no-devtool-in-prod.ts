import * as path from 'path';
import * as mock from 'mock-require';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';

import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
// We need to use `require` to be able to overwrite the method `getPackage`.
const webpackDestPath = path.join(__dirname, 'fixtures', 'valid', 'package.json');
const webpackConfig = loadJSONFile(webpackDestPath);
const loadPackage = {
    default() {
        return;
    }
};

const hintPath = getHintPath(__filename, true);
const tests: Array<HintLocalTest> = [
    {
        before() {
            loadPackage.default = () => {
                return webpackConfig;
            };

            mock('hint/dist/src/lib/utils/packages/load-package', loadPackage);
        },
        name: 'If no devtool in configuration, it should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        before() {
            loadPackage.default = () => {
                return webpackConfig;
            };

            mock('hint/dist/src/lib/utils/packages/load-package', loadPackage);
        },
        name: 'If devtool has a value different than `eval`, it should pass',
        path: path.join(__dirname, 'fixtures', 'noeval')
    },
    {
        before() {
            loadPackage.default = () => {
                return webpackConfig;
            };

            mock('hint/dist/src/lib/utils/packages/load-package', loadPackage);
        },
        name: 'If devtool is set to `eval` should fail',
        path: path.join(__dirname, 'fixtures', 'eval'),
        reports: [{ message: '`eval` not recommended for prodution' }]
    }
];

hintRunner.testLocalHint(hintPath, tests, {
    parsers: ['webpack-config'],
    serial: true
});
