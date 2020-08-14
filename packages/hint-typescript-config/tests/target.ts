import * as path from 'path';

import { getHintPath, HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename, true);

type TestWithBrowserInfo = HintLocalTest & {
    browserslist: string[];
};

/** The paths to the target configurations for each tested version */
const paths = [
    'es3',
    'es5',
    'es2015',
    'es2016',
    'esnext',
    'extends',
    'extends-overrides',
    'no-target',
    'no-target-extends',
    'no-target-extends-target'
].reduce((final, version) => {

    final[version] = path.join(__dirname, 'fixtures', 'target', version);

    return final;
}, {} as any);


const tests: TestWithBrowserInfo[] = [
    {
        browserslist: ['IE 8', 'IE 9', 'Edge 15', 'Edge 16', 'Chrome 63', 'Chrome 60', 'android 4.4.3-4.4.4', 'Safari 10.1', 'Safari 10.0'],
        name: 'Configuration with "compilerOptions.target = es3" and old browsers should pass',
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths.es3
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es3" and modern browsers should fail',
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths.es3,
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: '"es3"' },
                severity: Severity.warning
            }
        ]
    },
    {
        browserslist: ['IE 9', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es5" and minimum browsers should pass',
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths.es5
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es2016" and modern browsers should pass',
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths.es2016
    },
    {
        browserslist: ['IE 8', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = es2016" and old browsers should fail',
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths.es2016,
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES3". Current one is "ES2016"`,
                position: { match: '"es2016"' },
                severity: Severity.warning
            }
        ]
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: 'Configuration with "compilerOptions.target = esnext" and not very old browsers should fail',
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths.esnext,
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ESNext"`,
                position: { match: '"esnext"' },
                severity: Severity.warning
            }
        ]
    },
    {
        browserslist: ['IE 8', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with no "compilerOptions.target" and old browsers should pass',
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths['no-target']
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with no "compilerOptions.target" and modern browsers shouldn't pass`,
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths['no-target'],
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: 'compilerOptions' },
                severity: Severity.warning
            }]
    },
    {
        browserslist: ['IE 8', 'Edge 15', 'Chrome 63'],
        name: 'Configuration with no "compilerOptions.target" in extended file and old browsers should pass',
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths['no-target-extends']
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with no "compilerOptions.target" in extended file and modern browsers shouldn't pass`,
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths['no-target-extends'],
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: 'compilerOptions' },
                severity: Severity.warning
            }]
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with "compilerOptions.target" in extended file and modern browsers shouldn't pass`,
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths['no-target-extends-target'],
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: '"../es3/tsconfig.json"' },
                severity: Severity.warning
            }]
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with extends pointing to ES2016 and modern browsers should pass`,
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths.extends
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with extends pointing to ES2016 and target es3 should fail`,
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths['extends-overrides'],
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: '"es3"' },
                severity: Severity.warning
            }
        ]
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with extends pointing to ES2016 and target es3 should fail if browserlist is found in package.json`,
        overrides: {
            '@hint/utils': {
                findPackageRoot(dirname: string, fileToFind: string) {
                    if (fileToFind === 'package.json') {
                        return path.join(__dirname, 'fixtures', 'target', 'config-package-json');
                    }

                    throw new Error('Package not found');
                }
            }
        },
        path: paths['extends-overrides'],
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES2016". Current one is "ES3"`,
                position: { match: '"es3"' },
                severity: Severity.warning
            }
        ]
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with extends pointing to ES2016 and target es3 should pass if browserlist configuration is not found in package.json`,
        overrides: {
            '@hint/utils': {
                findPackageRoot(dirname: string, fileToFind: string) {
                    if (fileToFind === 'package.json') {
                        return path.join(__dirname, 'fixtures', 'target', 'no-config-package-json');
                    }

                    throw new Error('Package not found');
                }
            }
        },
        path: paths['extends-overrides']
    },
    {
        browserslist: ['Edge 15', 'Chrome 63'],
        name: `Configuration with extends pointing to ES2016 and target es3 should pass if browserlist configuration is not found`,
        overrides: {
            '@hint/utils': {
                findPackageRoot(dirname: string, fileToFind: string) {
                    throw new Error('Package not found');
                }
            }
        },
        path: paths['extends-overrides']
    },
    {
        browserslist: ['IE 8', 'Edge 15', 'Chrome 63'],
        name: `Configuration with extends pointing to ES2016 and old browsers should fail`,
        overrides: {
            '@hint/utils': {
                findPackageRoot() {
                    return 'folder';
                }
            }
        },
        path: paths.extends,
        reports: [
            {
                message: `Based on your browser configuration your "compilerOptions.target" should be "ES3". Current one is "ES2016"`,
                position: { match: '"../es2016/tsconfig.json"' },
                severity: Severity.warning
            }
        ]
    }
];

tests.forEach((info: TestWithBrowserInfo) => {
    const test: HintLocalTest = {
        before: info.before,
        name: info.name,
        overrides: info.overrides,
        path: info.path,
        reports: info.reports
    };

    testLocalHint(hintPath, [test], {
        browserslist: info.browserslist,
        parsers: ['typescript-config'],
        serial: true
    });
});
