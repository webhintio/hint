import * as path from 'path';
import * as mock from 'mock-require';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';

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
        name: 'If valid configuration file exists and webpack is installed should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        before() {
            loadPackage.default = () => {
                throw new Error('error');
            };

            mock('hint/dist/src/lib/utils/packages/load-package', loadPackage);
        },
        name: 'If valid configuration file exists but webpack is not installed should fail',
        path: path.join(__dirname, 'fixtures', 'valid'),
        reports: [{ message: `webpack is not installed in your project.` }]
    }
];

hintRunner.testLocalHint(hintPath, tests, {
    parsers: ['webpack-config'],
    serial: true
});
