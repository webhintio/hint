import * as path from 'path';

import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { ConnectorConfig, CLIOptions, IHint, HintMetadata, UserConfig } from '../../src/lib/types';
import { HintScope } from '../../src/lib/enums/hintscope';
import readFileAsync from '../../src/lib/utils/fs/read-file-async';

test.beforeEach(async (t) => {
    delete require.cache[require.resolve('os')];
    delete require.cache[require.resolve('../../src/lib/config')];

    const os = await import('os');
    const resourceLoader = {
        loadConfiguration() { },
        loadHint() { }
    };

    proxyquire('../../src/lib/config', {
        './utils/resource-loader': resourceLoader,
        os
    });

    t.context.config = await import('../../src/lib/config');
    t.context.os = os;
    t.context.resourceLoader = resourceLoader;
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach((t) => {
    t.context.sandbox.restore();
});

test('if there is no configuration file anywhere, it should call os.homedir and return null', (t) => {
    const dir = path.resolve('./fixtures/getFileNameForDirectoryEmpty');
    const { config, os, sandbox } = t.context;

    // We return the same dir so it doesn't look in the users homedir
    const stub = (sandbox as sinon.SinonSandbox)
        .stub(os, 'homedir')
        .returns(dir);

    const result = config.Configuration.getFilenameForDirectory(dir);

    t.is(result, null);
    t.is(stub.callCount, 1, `os.homedir() wasn't called to get the users homedir`);
});

test('if there is configuration file, it should return the path to the file', (t) => {
    const { config } = t.context;
    const result = config.Configuration.getFilenameForDirectory(path.join(__dirname, './fixtures/getFilenameForDirectory'));

    t.true(result.includes('.hintrc'));
});

test('if.hintConfig.fromFilePath is called with a non valid file extension, it should return an exception', (t) => {
    const { config } = t.context;
    const error = t.throws(() => {
        config.Configuration.fromFilePath(path.join(__dirname, './fixtures/notvalid/notvalid.css'), null);
    });

    t.is(error.message, `Couldn't find a configuration file`);
});

test(`if package.json doesn't have a hint configuration, it should return an exception`, (t) => {
    const { config } = t.context;
    const error = t.throws(() => {
        config.Configuration.fromFilePath(path.join(__dirname, './fixtures/notvalid/package.json'), null);
    });

    t.is(error.message, `Couldn't find a configuration file`);
});

test(`if package.json is an invalid JSON, it should return an exception`, (t) => {
    const { config } = t.context;
    const error = t.throws(() => {
        config.Configuration.fromFilePath(path.join(__dirname, './fixtures/exception/package.json'), null);
    });

    t.true(error.message.startsWith('Cannot read config file: '));
});

test(`if the config file doesn't have an extension, it should be parsed as JSON file`, (t) => {
    const { config, resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedHint.called = true;
            this.context = context;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadHint').returns(FakeDisallowedHint);

    const configuration = config.Configuration.fromFilePath(path.join(__dirname, './fixtures/valid/hintrc'), { watch: false } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.hints['disallowed-headers'], 'warning');
});

test(`if the config file is JavaScript, it should return the configuration part`, (t) => {
    const { config, resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedHint.called = true;
            this.context = context;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadHint').returns(FakeDisallowedHint);

    const configuration = config.Configuration.fromFilePath(path.join(__dirname, './fixtures/valid/hintrc.js'), { watch: true } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.hints['disallowed-headers'], 'warning');
});

test(`if package.json contains a valid hint configuration, it should return it`, (t) => {
    const { config, resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedHint.called = true;
            this.context = context;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadHint').returns(FakeDisallowedHint);

    const configuration = config.Configuration.fromFilePath(path.join(__dirname, './fixtures/valid/package.json'), { watch: false } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.hints['disallowed-headers'][0], 'warning');
});

test(`if package.json contains the property "ignoredUrls", it shold return them`, (t) => {
    const { config, resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedHint.called = true;
            this.context = context;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadHint').returns(FakeDisallowedHint);

    const configuration = config.Configuration.fromFilePath(path.join(__dirname, './fixtures/valid/package.json'), { watch: false } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.ignoredUrls.size, 2);
    t.is(configuration.ignoredUrls.get('all').length, 2);
    t.is(configuration.ignoredUrls.get('disallowed-headers').length, 1);
});

test.serial(`if the configuration file contains an extends property, it should combine the configurations`, async (t) => {
    const { config, resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedHint.called = true;
            this.context = context;
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

    const configuration: UserConfig = config.Configuration.fromFilePath(path.join(__dirname, './fixtures/valid/withextends.json'), { watch: false } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.hints['disallowed-headers'], 'error');
    t.is(configuration.formatters.length, 1);
    t.is(configuration.parsers.length, 2);
});


test(`if the configuration file contains an invalid extends property, returns an exception`, async (t) => {
    const { config, resourceLoader, sandbox } = t.context;
    const exts = JSON.parse(await readFileAsync(path.join(__dirname, './fixtures/notvalid/package.json'))).hintConfig;

    sandbox.stub(resourceLoader, 'loadConfiguration').returns(exts);

    const err = t.throws(() => {
        config.Configuration.fromFilePath(path.join(__dirname, './fixtures/valid/withextends.json'), { watch: false } as CLIOptions);
    });

    t.is(err.message, 'Configuration package "basics" is not valid');

});

test.serial(`if a Hint has an invalid configuration, it should tell which ones are invalid`, (t) => {
    const { config, resourceLoader, sandbox } = t.context;

    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedHint.called = true;
            this.context = context;
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

    const configuration = config.Configuration.fromFilePath(path.join(__dirname, './fixtures/valid/package.json'), { watch: false } as CLIOptions);
    const { invalid } = config.Configuration.validateHintsConfig(configuration);

    t.is(invalid.length, 1);
});

test('If formatter is specified as CLI argument, fromConfig method will use that to build.hintConfig', (t) => {
    const { config } = t.context;
    const userConfig = {
        connector: { name: 'chrome' },
        formatters: ['summary', 'excel'],
        hints: { 'apple-touch-icons': 'warning' }
    } as UserConfig;
    const cliOptions = { _: ['https://example.com'], formatters: 'database' } as CLIOptions;

    const result = config.Configuration.fromConfig(userConfig, cliOptions);

    t.is(result.formatters.length, 1);
    t.is(result.formatters[0], 'database');
    // Make sure we updated only the formatters. Other properties of userConfig should stay same
    t.is(result.connector.name, 'chrome');
});

test('If formatter is not specified as CLI argument, fromConfig method will use the formatter specified in the userConfig object as it is to build.hintConfig', (t) => {
    const { config } = t.context;
    const userConfig = {
        connector: { name: 'chrome' },
        formatters: ['summary', 'excel'],
        hints: { 'apple-touch-icons': 'warning' }
    } as UserConfig;
    const cliOptions = { _: ['https://example.com'] } as CLIOptions;

    const result = config.Configuration.fromConfig(userConfig, cliOptions);

    t.is(result.formatters.length, 2);
    t.is(result.formatters[0], 'summary');
    t.is(result.formatters[1], 'excel');
});

test('If hints option is specified as CLI argument, fromConfig method will use that to build.hintConfig', (t) => {
    const { config } = t.context;
    const userConfig = {
        connector: { name: 'chrome' },
        formatters: ['summary'],
        hints: { 'apple-touch-icons': 'warning' }
    } as UserConfig;
    const cliOptions = { _: ['https://example.com'], hints: 'html-checker,content-type' } as CLIOptions;

    const result = config.Configuration.fromConfig(userConfig, cliOptions);

    t.is(result.hints.hasOwnProperty('html-checker'), true);
    t.is(result.hints.hasOwnProperty('content-type'), true);
    // Make sure we updated only the hints. Other properties of userConfig should stay same
    t.is(result.formatters[0], 'summary');
});

test('If hints option is not specified as CLI argument, fromConfig method will use the hints specified in the userConfig object as it is to build.hintConfig', (t) => {
    const { config } = t.context;
    const userConfig = {
        connector: { name: 'chrome' },
        formatters: ['summary'],
        hints: { 'apple-touch-icons': 'warning' }
    } as UserConfig;
    const cliOptions = { _: ['https://example.com'] } as CLIOptions;

    const result = config.Configuration.fromConfig(userConfig, cliOptions);

    t.is(result.hints.hasOwnProperty('apple-touch-icons'), true);
});

test('If both hints and formatters options are specified as CLI arguments, fromConfig method will use that to build.hintConfig', (t) => {
    const { config } = t.context;
    const userConfig = {
        connector: { name: 'chrome' },
        formatters: ['summary', 'excel'],
        hints: { 'apple-touch-icons': 'warning' }
    } as UserConfig;
    const cliOptions = { _: ['https://example.com'], formatters: 'database', hints: 'html-checker' } as CLIOptions;

    const result = config.Configuration.fromConfig(userConfig, cliOptions);

    // verify formatters
    t.is(result.formatters.length, 1);
    t.is(result.formatters[0], 'database');

    // verify hints
    t.is(result.hints.hasOwnProperty('html-checker'), true);
    t.is(result.hints.hasOwnProperty('apple-touch-icons'), false);
});
