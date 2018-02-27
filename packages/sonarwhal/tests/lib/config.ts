import * as path from 'path';

import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { ConnectorConfig, CLIOptions, IRule, RuleMetadata } from '../../src/lib/types';
import { RuleScope } from '../../src/lib/enums/rulescope';

const resourceLoader = {
    loadConfiguration() { },
    loadRule() { }
};

proxyquire('../../src/lib/config', { './utils/resource-loader': resourceLoader });

import * as config from '../../src/lib/config';
import { readFileAsync } from '../../src/lib/utils/misc';

test('if there is no configuration file, it should return null', (t) => {
    const result = config.SonarwhalConfig.getFilenameForDirectory('./fixtures/getFileNameForDirectoryEmpty');

    t.is(result, null);
});

test('if there is configuration file, it should return the path to the file', (t) => {
    const result = config.SonarwhalConfig.getFilenameForDirectory(path.join(__dirname, './fixtures/getFilenameForDirectory'));

    t.true(result.includes('.sonarwhalrc'));
});

test('if SonarwhalConfig.fromFilePath is called with a non valid file extension, it should return an exception', (t) => {
    const error = t.throws(() => {
        config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/notvalid/notvalid.css'), null);
    });

    t.is(error.message, `Couldn't find a configuration file`);
});

test(`if package.json doesn't have a sonarwhal configuration, it should return an exception`, (t) => {
    const error = t.throws(() => {
        config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/notvalid/package.json'), null);
    });

    t.is(error.message, `Couldn't find a configuration file`);
});

test(`if package.json is an invalid JSON, it should return an exception`, (t) => {
    const error = t.throws(() => {
        config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/exception/package.json'), null);
    });

    t.true(error.message.startsWith('Cannot read config file: '));
});

test.serial(`if the config file doesn't have an extension, it should be parse as JSON file`, (t) => {
    const sandbox = sinon.createSandbox();

    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadRule').returns(FakeDisallowedRule);

    const configuration = config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/valid/sonarwhalrc'), { watch: false } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.rules['disallowed-headers'], 'warning');

    sandbox.restore();
});

test.serial(`if the config file is JavaScript, it should return the configuration part`, (t) => {
    const sandbox = sinon.createSandbox();

    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadRule').returns(FakeDisallowedRule);

    const configuration = config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/valid/sonarwhalrc.js'), { watch: true } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.rules['disallowed-headers'], 'warning');

    sandbox.restore();
});

test.serial(`if package.json contains a valid sonarwhal configuration, it should return it`, (t) => {
    const sandbox = sinon.createSandbox();

    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadRule').returns(FakeDisallowedRule);

    const configuration = config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/valid/package.json'), { watch: false } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.rules['disallowed-headers'][0], 'warning');

    sandbox.restore();
});

test.serial(`if package.json contains the property "ignoredUrls", it shold return them`, (t) => {
    const sandbox = sinon.createSandbox();

    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadRule').returns(FakeDisallowedRule);

    const configuration = config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/valid/package.json'), { watch: false } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.ignoredUrls.size, 2);
    t.is(configuration.ignoredUrls.get('all').length, 2);
    t.is(configuration.ignoredUrls.get('disallowed-headers').length, 1);

    sandbox.restore();
});

test.serial(`if the configuration file contains an extends property, it should combine the configurations`, async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadRule').returns(FakeDisallowedRule);

    const exts = JSON.parse(await readFileAsync(path.join(__dirname, './fixtures/valid/package.json'))).sonarwhalConfig;

    sandbox.stub(resourceLoader, 'loadConfiguration').returns(exts);

    const configuration = config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/valid/withextends.json'), { watch: false } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.rules['disallowed-headers'], 'error');

    sandbox.restore();
});


test.serial(`if the configuration file contains an invalid extends property, returns an exception`, async (t) => {
    const sandbox = sinon.createSandbox();

    const exts = JSON.parse(await readFileAsync(path.join(__dirname, './fixtures/notvalid/package.json'))).sonarwhalConfig;

    sandbox.stub(resourceLoader, 'loadConfiguration').returns(exts);

    t.plan(1);

    try {
        config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/valid/withextends.json'), { watch: false } as CLIOptions);
    } catch (err) {
        t.is(err.message, 'Configuration package "basics" is not valid');
    }

    sandbox.restore();
});

test.serial(`if a Rule has an invalid configuration, it should throw an exception`, async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
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
            scope: RuleScope.any
        }
    }

    sandbox.stub(resourceLoader, 'loadRule').returns(FakeDisallowedRule);

    t.plan(1);
    try {
        config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/valid/package.json'), { watch: false } as CLIOptions);
    } catch (err) {
        t.is(err.message, 'Rule disallowed-headers has an invalid configuration');
    }

    sandbox.restore();
});
