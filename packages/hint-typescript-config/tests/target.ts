import * as path from 'path';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';

const hintPath = getHintPath(__filename, true);

type TestWithBrowserInfo = HintLocalTest & {
    browserslist: Array<string>;
};

/** The paths to the target configurations for each tested version */
const paths = ['es3', 'es5', 'es2015', 'es2016', 'esnext', 'no-target'].reduce((final, version) => {

    final[version] = path.join(__dirname, 'fixtures', 'target', version);

    return final;
}, {} as any);


const tests: Array<TestWithBrowserInfo> = [
    {
        browserslist: ['IE 8', 'IE 9', 'Edge 15', 'Edge 16', 'Chrome 63', 'Chrome 60', 'android 4.4.3-4.4.4', 'Safari 10.1', 'Safari 10.0'],
        name: 'Configuration with "compilerOptions.target = es3" and old browsers should pass',
        path: paths.es3
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es3" and modern browsers should fail',
        path: paths.es3,
        reports: [{ message: `Based on your browser configuration your "compilerOptions.target" should be "es2016". Current one is "es3"` }]
    },
    {
        browserslist: ['IE 9', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es5" and minimum browsers should pass',
        path: paths.es5
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es2016" and modern browsers should pass',
        path: paths.es2016
    },
    {
        browserslist: ['IE 8', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es2016" and old browsers should fail',
        path: paths.es2016,
        reports: [{ message: `Based on your browser configuration your "compilerOptions.target" should be "es3". Current one is "es2016"` }]
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = esnext" and not very old browsers should fail',
        path: paths.esnext,
        reports: [{ message: `Based on your browser configuration your "compilerOptions.target" should be "es2016". Current one is "esnext"` }]
    },
    {
        browserslist: ['IE 8', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with no "compilerOptions.target" and old browsers should pass',
        path: paths['no-target']
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: 'Configuration with no "compilerOptions.target" and modern browsers should pass',
        path: paths['no-target'],
        reports: [{ message: `Based on your browser configuration your "compilerOptions.target" should be "es2016". Current one is "es3"` }]
    }
];

tests.forEach((info: TestWithBrowserInfo) => {
    const test: HintLocalTest = {
        name: info.name,
        path: info.path,
        reports: info.reports
    };

    hintRunner.testLocalHint(hintPath, [test], {
        browserslist: info.browserslist,
        parsers: ['typescript-config']
    });
});
