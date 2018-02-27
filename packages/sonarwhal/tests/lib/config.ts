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

    const configuration = config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/sonarwhalrc'), { watch: false } as CLIOptions);

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

    const configuration = config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/sonarwhalrc.js'), { watch: true } as CLIOptions);

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

    const configuration = config.SonarwhalConfig.fromFilePath(path.join(__dirname, './fixtures/package.json'), { watch: false } as CLIOptions);

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.rules['disallowed-headers'], 'warning');

    sandbox.restore();
});
