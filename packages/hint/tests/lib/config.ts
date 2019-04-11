import * as path from 'path';

import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { readFileAsync } from '@hint/utils';

import { HintScope } from '../../src/lib/enums/hint-scope';
import { IHint, HintMetadata } from '../../src/lib/types';

type ResourceLoader = {
    loadConfiguration: () => string;
    loadHint: () => IHint | null;
};

type OS = {
    homedir: () => string;
};

type ConfigTestContext = {
    os: OS;
    resourceLoader: ResourceLoader;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest.serial as TestInterface<ConfigTestContext>;

const initContext = (t: ExecutionContext<ConfigTestContext>) => {
    const os = {
        homedir: (): string => {
            return '';
        }
    };
    const resourceLoader: ResourceLoader = {
        loadConfiguration() {
            return '';
        },
        loadHint() {
            return null;
        }
    };

    t.context.os = os;
    t.context.resourceLoader = resourceLoader;
    t.context.sandbox = sinon.createSandbox();
};

const loadScript = (context: ConfigTestContext) => {
    return proxyquire('../../src/lib/config', {
        './utils/resource-loader': context.resourceLoader,
        os: context.os
    });
};

test.beforeEach(initContext);

test.afterEach((t) => {
    t.context.sandbox.restore();
});

test('if there is no configuration file anywhere, it should call os.homedir and return null', (t) => {
    const dir = path.resolve('./fixtures/getFileNameForDirectoryEmpty');
    const { os, sandbox } = t.context;

    // We return the same dir so it doesn't look in the users homedir
    const stub = sandbox
        .stub(os, 'homedir')
        .returns(dir);

    const config = loadScript(t.context);
    const result = config.Configuration.getFilenameForDirectory(dir);

    t.is(result, null);
    t.is(stub.callCount, 1, `os.homedir() wasn't called to get the users homedir`);
});

test('if there is configuration file, it should return the path to the file', (t) => {
    const config = loadScript(t.context);
    const result = config.Configuration.getFilenameForDirectory(path.join(__dirname, './fixtures/getFilenameForDirectory'));

    t.true(result.includes('.hintrc'));
});

test('if Configuration.loadConfigFile is called with a non valid file extension, it should return null', (t) => {
    const config = loadScript(t.context);

    const result = config.Configuration.loadConfigFile(path.join(__dirname, './fixtures/notvalid/notvalid.css'));

    t.is(result, null);
});

test(`if package.json doesn't have a hint configuration, it should return null`, (t) => {
    const config = loadScript(t.context);
    const result = config.Configuration.loadConfigFile(path.join(__dirname, './fixtures/notvalid/package.json'));

    t.is(result, null);
});

test(`if package.json is an invalid JSON, it should return an exception`, (t) => {
    const config = loadScript(t.context);
    const error = t.throws(() => {
        config.Configuration.loadConfigFile(path.join(__dirname, './fixtures/exception/package.json'), null);
    });

    t.true(error.message.startsWith('Cannot read config file: '));
});

test(`if the config file doesn't have an extension, it should be parsed as JSON file`, (t) => {
    const { resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeDisallowedHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadHint').returns(FakeDisallowedHint);

    const config = loadScript(t.context);
    const userConfig = config.Configuration.loadConfigFile(path.join(__dirname, './fixtures/valid/hintrc'));
    const configuration = config.Configuration.fromConfig(userConfig);

    t.is(configuration.connector.name, 'chrome');
    t.is(configuration.hints['disallowed-headers'], 'warning');
});

test(`if the config file is JavaScript, it should return the configuration part`, (t) => {
    const { resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeDisallowedHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadHint').returns(FakeDisallowedHint);

    const config = loadScript(t.context);
    const configuration = config.Configuration.loadConfigFile(path.join(__dirname, './fixtures/valid/hintrc.js'));

    t.is(configuration.connector.name, 'chrome');
    t.is(configuration.hints['disallowed-headers'], 'warning');
});

test(`if package.json contains a valid hint configuration, it should return it`, (t) => {
    const { resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeDisallowedHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadHint').returns(FakeDisallowedHint);

    const config = loadScript(t.context);
    const userConfig = config.Configuration.loadConfigFile(path.join(__dirname, './fixtures/valid/package.json'));
    const configuration = config.Configuration.fromConfig(userConfig);

    t.is(configuration.connector.name, 'chrome');
    t.is(configuration.hints['disallowed-headers'][0], 'warning');
});

test(`if package.json contains the property "ignoredUrls", it shold return them`, (t) => {
    const { resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeDisallowedHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadHint').returns(FakeDisallowedHint);

    const config = loadScript(t.context);
    const userConfig = config.Configuration.loadConfigFile(path.join(__dirname, './fixtures/valid/package.json'));
    const configuration = config.Configuration.fromConfig(userConfig);

    t.is(configuration.connector.name, 'chrome');
    t.is(configuration.ignoredUrls.size, 2);
    t.is(configuration.ignoredUrls.get('all').length, 2);
    t.is(configuration.ignoredUrls.get('disallowed-headers').length, 1);
});

test(`if the configuration file contains an extends property, it should combine the configurations`, async (t) => {
    const { resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeDisallowedHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadHint').returns(FakeDisallowedHint);

    const exts = JSON.parse(await readFileAsync(path.join(__dirname, './fixtures/valid/package.json'))).hintConfig;

    sandbox.stub(resourceLoader, 'loadConfiguration').returns(exts);

    const config = loadScript(t.context);
    const userConfig = config.Configuration.loadConfigFile(path.join(__dirname, './fixtures/valid/withextends.json'));
    const configuration = config.Configuration.fromConfig(userConfig, { watch: false });

    t.is(configuration.connector.name, 'chrome');
    t.is(configuration.hints['disallowed-headers'], 'error');
    t.is(configuration.formatters && configuration.formatters.length, 1);
    t.is(configuration.parsers && configuration.parsers.length, 2);
});

test(`if the configuration file contains an invalid extends property, returns an exception`, async (t) => {
    const { resourceLoader, sandbox } = t.context;
    const exts = JSON.parse(await readFileAsync(path.join(__dirname, './fixtures/notvalid/package.json'))).hintConfig;

    sandbox.stub(resourceLoader, 'loadConfiguration').returns(exts);

    const config = loadScript(t.context);
    const userConfig = config.Configuration.loadConfigFile(path.join(__dirname, './fixtures/valid/withextends.json'));
    const err = t.throws(() => {
        config.Configuration.fromConfig(userConfig, { watch: false });
    });

    t.is(err.message, 'Configuration package "basics" is not valid');
});

test(`if a Hint has an invalid configuration, it should tell which ones are invalid`, (t) => {
    const { resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeDisallowedHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [{
                additionalProperties: false,
                properties: {
                    testprop: {
                        description: 'Test property',
                        type: 'string'
                    }
                },
                required: [
                    'testprop'
                ]
            }],
            scope: HintScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadHint').returns(FakeDisallowedHint);

    const config = loadScript(t.context);
    const userConfig = config.Configuration.loadConfigFile(path.join(__dirname, './fixtures/valid/package.json'));
    const configuration = config.Configuration.fromConfig(userConfig);
    const { invalid } = config.Configuration.validateHintsConfig(configuration);

    t.is(invalid.length, 1);
});

test('If formatter is specified in the options, fromConfig method will use that to build the configuration', (t) => {
    const userConfig = {
        connector: { name: 'chrome' },
        formatters: ['summary', 'excel'],
        hints: { 'apple-touch-icons': 'warning' }
    };
    const options = { formatters: ['database'] };

    const config = loadScript(t.context);
    const result = config.Configuration.fromConfig(userConfig, options);

    t.is(result.formatters.length, 1);
    t.is(result.formatters[0], 'database');
    // Make sure we updated only the formatters. Other properties of userConfig should stay same
    t.is(result.connector.name, 'chrome');
});

test('If formatter is not specified in the options, fromConfig method will use the formatter specified in the userConfig object as it is to build the configuration', (t) => {
    const userConfig = {
        connector: { name: 'chrome' },
        formatters: ['summary', 'excel'],
        hints: { 'apple-touch-icons': 'warning' }
    };

    const config = loadScript(t.context);
    const result = config.Configuration.fromConfig(userConfig);

    t.is(result.formatters.length, 2);
    t.is(result.formatters[0], 'summary');
    t.is(result.formatters[1], 'excel');
});

test('If hints option is specified in the options, fromConfig method will use that to build the configuration', (t) => {
    const userConfig = {
        connector: { name: 'chrome' },
        formatters: ['summary'],
        hints: { 'apple-touch-icons': 'warning' }
    };
    const options = { hints: ['html-checker', 'content-type'] };

    const config = loadScript(t.context);
    const result = config.Configuration.fromConfig(userConfig, options);

    t.is(result.hints.hasOwnProperty('html-checker'), true);
    t.is(result.hints.hasOwnProperty('content-type'), true);
    // Make sure we updated only the hints. Other properties of userConfig should stay same
    t.is(result.formatters[0], 'summary');
});

test('If hints option is not specified in the options, fromConfig method will use the hints specified in the userConfig object as it is to build.hintConfig', (t) => {
    const userConfig = {
        connector: { name: 'chrome' },
        formatters: ['summary'],
        hints: { 'apple-touch-icons': 'warning' }
    };

    const config = loadScript(t.context);
    const result = config.Configuration.fromConfig(userConfig);

    t.is(result.hints.hasOwnProperty('apple-touch-icons'), true);
});

test('If both hints and formatters options are specified in the options, fromConfig method will use that to build the configuration', (t) => {
    const userConfig = {
        connector: { name: 'chrome' },
        formatters: ['summary', 'excel'],
        hints: { 'apple-touch-icons': 'warning' }
    };
    const options = { formatters: ['database'], hints: ['html-checker'] };

    const config = loadScript(t.context);
    const result = config.Configuration.fromConfig(userConfig, options);

    // verify formatters
    t.is(result.formatters.length, 1);
    t.is(result.formatters[0], 'database');

    // verify hints
    t.is(result.hints.hasOwnProperty('html-checker'), true);
    t.is(result.hints.hasOwnProperty('apple-touch-icons'), false);
});
