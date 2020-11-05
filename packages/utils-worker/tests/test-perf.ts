import { RunResult, Test } from './helpers/types';
import { getResults } from './helpers/runner';
import { Resource, ResourceType } from '../src/shared/types';
import { HintsConfigObject } from '@hint/utils';

const generateCSS = (path: string) => {
    let result = '';

    for (let i = 0; i < 10000; i++) {
        result += `.a${i} {
            color: #abcdef;
        }
`;
    }

    result += `
.button {
    .example1 {
        appearance: none;
        -moz-appearance: none;
        -webkit-appearance: none;
    }
}
`;

    return {
        content: result,
        path,
        type: ResourceType.CSS
    };
};

const generateJS = (path: string) => {
    let result = '';

    for (let i = 0; i < 10000; i++) {
        result += `const a${i} = (x) => {
            console.log(x);
        }
`;
    }

    result += `document.getElementById('container').appendChild(document.createElement('svg'));`;

    return {
        content: result,
        path,
        type: ResourceType.JS
    };
};

const generateHTML = (resources: Resource[] = []) => {
    let result = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>Basic Hints Test</title>`;

    const css = resources.filter((res) => {
        return res.type === ResourceType.CSS;
    });

    if (css.length) {
        for (const { path } of css) {
            result += `<link rel="stylesheet" href="${path}"/>`;
        }
    }

    result += `
    </head>
    <body>
        <h1>Basic Hints Test</h1>
        <dialog open>
            <form>`;

    for (let i = 0; i < 500; i++) {
        result += `<img src="icon.png"><button class="button">Test</button>
                  `;
    }

    result += `</form>
        </dialog>
    </body>
`;

    const js = resources.filter((res) => {
        return res.type === ResourceType.JS;
    });

    if (js.length) {
        for (const { path } of js) {
            result += `<script src="${path}"></script>`;
        }
    }

    result += `
</html>
`;

    return result;
};

const generateDeepHTML = (resources: Resource[] = []) => {
    const deep = 100;
    let result = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>Basic Hints Test</title>`;

    const css = resources.filter((res) => {
        return res.type === ResourceType.CSS;
    });

    if (css.length) {
        for (const { path } of css) {
            result += `<link rel="stylesheet" href="${path}"/>`;
        }
    }

    result += `
    </head>
    <body>
        <h1>Basic Hints Test</h1>
        <dialog open>
            <form>`;

    for (let j = 0; j < 5; j++) {
        for (let i = 0; i < deep; i++) {
            result += `<div>
            <img src="icon.png"><button>Test</button>
            `;
        }

        for (let i = 0; i < deep; i++) {
            result += `</div>`;
        }
    }

    result += `</form>
        </dialog>
    </body>
`;

    const js = resources.filter((res) => {
        return res.type === ResourceType.JS;
    });

    if (js.length) {
        for (const { path } of js) {
            result += `<script src="${path}"></script>`;
        }
    }

    result += `
</html>
`;

    return result;
};

const prefixOrderCSS = [generateCSS('./index.css')];
const leadingDotClasslistJS = [generateJS('./index.js')];

const disabledAxeHints: HintsConfigObject = {
    'axe/aria': 'off',
    'axe/color': 'off',
    'axe/forms': 'off',
    'axe/keyboard': 'off',
    'axe/language': 'off',
    'axe/name-role-value': 'off',
    'axe/other': 'off',
    'axe/parsing': 'off',
    'axe/semantics': 'off',
    'axe/sensory-and-visual-cues': 'off',
    'axe/structure': 'off',
    'axe/tables': 'off',
    'axe/text-alternatives': 'off',
    'axe/time-and-media': 'off'
};

const tests: Test[] = [{
    expectedHints: ['axe/text-alternatives'],
    expectedTime: 22500,
    html: generateHTML(),
    name: 'Axe perf test',
    timeout: 40000
}, {
    expectedHints: ['axe/text-alternatives'],
    expectedTime: 37000,
    html: generateDeepHTML(),
    name: 'Axe deep perf test',
    timeout: 60000
}, {
    expectedHints: ['button-type'],
    expectedTime: 1650,
    hints: disabledAxeHints,
    html: generateDeepHTML(),
    name: 'Button type perf test',
    timeout: 10000
}, {
    expectedHints: ['x-content-type-options'],
    expectedTime: 145,
    hints: disabledAxeHints,
    html: generateHTML(),
    name: 'x-content-type-options perf test',
    timeout: 5000
}, {
    expectedHints: ['css-prefix-order'],
    expectedTime: 600,
    hints: disabledAxeHints,
    html: generateDeepHTML(prefixOrderCSS),
    name: 'CSS prefix order perf test',
    resources: prefixOrderCSS,
    timeout: 5000
}, {
    expectedHints: ['create-element-svg'],
    expectedTime: 1250,
    hints: disabledAxeHints,
    html: generateDeepHTML(leadingDotClasslistJS),
    name: 'Create SVG element perf test',
    resources: leadingDotClasslistJS,
    timeout: 6000
}];

const runTest = (test: Test) => {
    return getResults({
        userConfig: {
            hints: test.hints || [],
            language: 'en-us'
        }
    }, test, console.log);
};

const delta = 15 / 100; // 15%

const removeMaxMin = (results: RunResult[]): RunResult[] => {
    const copyResults = [...results];


    copyResults.sort((a, b) => {
        return a.totalTime - b.totalTime;
    });

    copyResults.splice(0, 1);
    copyResults.splice(copyResults.length - 1, 1);

    return copyResults;
};

const getAverage = (results: RunResult[]): number => {
    const sum = results.reduce((total, result) => {
        return total + result.totalTime;
    }, 0);

    return sum / results.length;
};

const runTests = async () => {
    let ok = true;

    for (const test of tests) {
        if (!test.expectedTime) {
            ok = false;

            console.error(`Expected time is required in test '${test.name}'`);

            continue;
        }
        console.log(`Running test: '${test.name}'`);
        try {
            const results: RunResult[] = [];

            for (let i = 0; i < 5; i++) {
                const result = await runTest(test);

                results.push(result);
            }

            const trimmedResults = removeMaxMin(results);

            const average = getAverage(trimmedResults);

            const max = test.expectedTime + test.expectedTime * delta;
            const min = test.expectedTime - test.expectedTime * delta;

            if (average < min) {
                ok = false;
                console.log(`Test '${test.name}' fails. The tests was too fast, please review the expected time or if there is any issue. (${average}/${test.expectedTime})`);
            } else if (average > max) {
                ok = false;
                console.log(`Test '${test.name}' fails. (${average}/${test.expectedTime})`);
            } else {
                console.log(`Test '${test.name}' ok. (${average}/${test.expectedTime})`);
            }
        } catch (e) {
            console.error(`Test '${test.name}' fails.\n`, e);
            ok = false;
        }
    }

    if (!ok) {
        console.error('Perf tests failed. Please review the log for more details');
        process.exit(1); // eslint-disable-line no-process-exit
    }

    process.exit(0); // eslint-disable-line no-process-exit
};


runTests();
