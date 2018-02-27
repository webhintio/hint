import test from 'ava';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import { CLIOptions, Severity, IFormatter, Problem } from '../../../src/lib/types';
const actions = { _: ['http://localhost/'] } as CLIOptions;

const sonarwhalContainer = {
    Sonarwhal: class Sonarwhal extends EventEmitter {
        public get formatters() {
            return [];
        }

        public close() { }
        public executeOn() { }
    }
};


// const formatter = { format: () => { } };
const resourceLoader = {
    loadResources() {
        return {};
    }
};
const logger = {
    error() { },
    log() { }
};

const config = {
    SonarwhalConfig: {
        fromFilePath() { },
        getFilenameForDirectory() { }
    }
};

const generator = { initSonarwhalrc() { } };

const spinner = {
    fail() { },
    start() { },
    succeed() { },
    text: ''
};

const ora = () => {
    return spinner;
};

const inquirer = { prompt() { } };

proxyquire('../../../src/lib/cli/analyze', {
    '../config': config,
    '../sonarwhal': sonarwhalContainer,
    '../utils/logging': logger,
    '../utils/resource-loader': resourceLoader,
    './init': generator,
    inquirer,
    ora
});

import * as analyzer from '../../../src/lib/cli/analyze';
// import { SonarwhalConfig } from '../../../src/lib/config';

test.beforeEach((t) => {
    sinon.spy(logger, 'log');
    sinon.spy(logger, 'error');
    sinon.spy(config.SonarwhalConfig, 'getFilenameForDirectory');
    sinon.stub(generator, 'initSonarwhalrc').resolves();
    sinon.spy(spinner, 'start');
    sinon.spy(spinner, 'fail');
    sinon.spy(spinner, 'succeed');

    t.context.SonarwhalConfig = config.SonarwhalConfig;
    t.context.generator = generator;
    t.context.logger = logger;
    t.context.spinner = spinner;
    t.context.inquirer = inquirer;
    t.context.resourceLoader = resourceLoader;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.logger.error.restore();
    t.context.SonarwhalConfig.getFilenameForDirectory.restore();
    t.context.generator.initSonarwhalrc.restore();
    t.context.spinner.start.restore();
    t.context.spinner.fail.restore();
    t.context.spinner.succeed.restore();
});

test.serial('If config is not defined, it should get the config file from the directory process.cwd()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath')
        .onFirstCall()
        .returns({});
    await analyzer.analyze(actions);

    t.true(t.context.SonarwhalConfig.getFilenameForDirectory.called);


    sandbox.restore();
});

test.serial('If config file does not exist, it should create a configuration file if user agrees', async (t) => {
    const error = { message: `Couldn't find any valid configuration` };

    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath')
        .onFirstCall()
        .throws(error)
        .onSecondCall()
        .returns({});
    sandbox.stub(inquirer, 'prompt').resolves({ confirm: true });

    await analyzer.analyze(actions);

    t.true(t.context.inquirer.prompt.calledOnce);
    t.is(t.context.inquirer.prompt.args[0][0][0].name, 'confirm');
    t.true(t.context.generator.initSonarwhalrc.calledOnce);
    t.deepEqual(t.context.generator.initSonarwhalrc.firstCall.args[0], { init: true });

    sandbox.restore();
});

test.serial('If config file does not exist and user refuses to create a configuration file, it should exit with code 1', async (t) => {
    const error = { message: `Couldn't find any valid configuration` };
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath')
        .onFirstCall()
        .throws(error);
    sandbox.stub(inquirer, 'prompt').resolves({ confirm: false });

    const result = await analyzer.analyze(actions);

    t.true(t.context.inquirer.prompt.calledOnce);
    t.is(t.context.inquirer.prompt.args[0][0][0].name, 'confirm');
    t.false(t.context.generator.initSonarwhalrc.called);
    t.false(result);

    sandbox.restore();
});

test.serial('If configuration file exists, it should use it', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    const customConfigOptions = ({ _: ['http://localhost'], config: 'configfile.cfg' } as CLIOptions);

    await analyzer.analyze(customConfigOptions);

    t.false(t.context.SonarwhalConfig.getFilenameForDirectory.called);
    t.is(t.context.SonarwhalConfig.fromFilePath.args[0][0], 'configfile.cfg');

    sandbox.restore();
});

test.serial('If executeOn returns an error, it should exit with code 1 and call formatter.format', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const sonarwhalObj = new sonarwhalContainer.Sonarwhal();

    sandbox.stub(sonarwhalObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(sonarwhalObj, 'executeOn').resolves([{ severity: Severity.error }]);
    sandbox.stub(sonarwhalContainer, 'Sonarwhal').returns(sonarwhalObj);
    sandbox.stub(inquirer, 'prompt').resolves({ confirm: false });
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    const exitCode = await analyzer.analyze(actions);

    t.true(FakeFormatter.called);
    t.false(exitCode);

    sandbox.restore();
});

test.serial('If executeOn returns an error, it should call to spinner.fail()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});
    sandbox.stub(sonarwhalContainer.Sonarwhal.prototype, 'executeOn').resolves([{ severity: Severity.error }]);

    await analyzer.analyze(actions);

    t.true(t.context.spinner.fail.calledOnce);

    sandbox.restore();
});

test.serial('If executeOn throws an exception, it should exit with code 1', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});
    sandbox.stub(sonarwhalContainer.Sonarwhal.prototype, 'executeOn').throws(new Error());

    const result = await analyzer.analyze(actions);

    t.false(result);

    sandbox.restore();
});

test.serial('If executeOn throws an exception, it should call to spinner.fail()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});
    sandbox.stub(sonarwhalContainer.Sonarwhal.prototype, 'executeOn').throws(new Error());

    await analyzer.analyze(actions);

    t.true(t.context.spinner.fail.calledOnce);

    sandbox.restore();
});

test.serial('If executeOn returns no errors, it should exit with code 0 and call formatter.format', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const sonarwhalObj = new sonarwhalContainer.Sonarwhal();

    sandbox.stub(sonarwhalObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(sonarwhalObj, 'executeOn').resolves([{ severity: 0 }]);
    sandbox.stub(sonarwhalContainer, 'Sonarwhal').returns(sonarwhalObj);

    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    const exitCode = await analyzer.analyze(actions);

    t.true(FakeFormatter.called);
    t.true(exitCode);

    sandbox.restore();
});

test.serial('If executeOn returns no errors, it should call to spinner.succeed()', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const sonarwhalObj = new sonarwhalContainer.Sonarwhal();

    sandbox.stub(sonarwhalObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(sonarwhalObj, 'executeOn').resolves([{ severity: 0 }]);
    sandbox.stub(sonarwhalContainer, 'Sonarwhal').returns(sonarwhalObj);

    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    await analyzer.analyze(actions);

    t.true(t.context.spinner.succeed.calledOnce);

    sandbox.restore();
});

test.serial('Event fetch::start should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const sonarwhalObj = new sonarwhalContainer.Sonarwhal();

    sandbox.stub(sonarwhalObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(sonarwhalObj, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('fetch::start', { resource: 'http://localhost/' });
    });
    sandbox.stub(sonarwhalContainer, 'Sonarwhal').returns(sonarwhalObj);
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    await analyzer.analyze(actions);

    t.is(spinner.text, 'Downloading http://localhost/');

    sandbox.restore();
});

test.serial('Event fetch::end should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const sonarwhalObj = new sonarwhalContainer.Sonarwhal();

    sandbox.stub(sonarwhalObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(sonarwhalObj, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('fetch::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(sonarwhalContainer, 'Sonarwhal').returns(sonarwhalObj);
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    await analyzer.analyze(actions);

    t.is(spinner.text, 'http://localhost/ downloaded');

    sandbox.restore();
});

test.serial('Event fetch::end::manifest should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const sonarwhalObj = new sonarwhalContainer.Sonarwhal();

    sandbox.stub(sonarwhalObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(sonarwhalObj, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('fetch::end::manifest', { resource: 'http://localhost/' });
    });
    sandbox.stub(sonarwhalContainer, 'Sonarwhal').returns(sonarwhalObj);
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    await analyzer.analyze(actions);

    t.is(spinner.text, 'http://localhost/ downloaded');

    sandbox.restore();
});

test.serial('Event fetch::end::html should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const sonarwhalObj = new sonarwhalContainer.Sonarwhal();

    sandbox.stub(sonarwhalObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(sonarwhalObj, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('fetch::end::html', { resource: 'http://localhost/' });
    });
    sandbox.stub(sonarwhalContainer, 'Sonarwhal').returns(sonarwhalObj);
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    await analyzer.analyze(actions);

    t.is(spinner.text, 'http://localhost/ downloaded');

    sandbox.restore();
});

test.serial('Event traverse::up should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const sonarwhalObj = new sonarwhalContainer.Sonarwhal();

    sandbox.stub(sonarwhalObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(sonarwhalObj, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('traverse::up', { resource: 'http://localhost/' });
    });
    sandbox.stub(sonarwhalContainer, 'Sonarwhal').returns(sonarwhalObj);
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    await analyzer.analyze(actions);

    t.is(spinner.text, 'Traversing the DOM');

    sandbox.restore();
});

test.serial('Event traverse::end should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const sonarwhalObj = new sonarwhalContainer.Sonarwhal();

    sandbox.stub(sonarwhalObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(sonarwhalObj, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('traverse::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(sonarwhalContainer, 'Sonarwhal').returns(sonarwhalObj);
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    await analyzer.analyze(actions);

    t.is(spinner.text, 'Traversing finished');

    sandbox.restore();
});

test.serial('Event scan::end should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const sonarwhalObj = new sonarwhalContainer.Sonarwhal();

    sandbox.stub(sonarwhalObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(sonarwhalObj, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('scan::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(sonarwhalContainer, 'Sonarwhal').returns(sonarwhalObj);
    sandbox.stub(t.context.SonarwhalConfig, 'fromFilePath').returns({});

    await analyzer.analyze(actions);

    t.is(spinner.text, 'Finishing...');

    sandbox.restore();
});

test.serial('If no sites are defined, it should return false', async (t) => {
    const result = await analyzer.analyze({ _: [] } as CLIOptions);

    t.false(result);
});

test.serial('If _ property is not defined in actions, it should return false', async (t) => {
    const result = await analyzer.analyze({} as CLIOptions);

    t.false(result);
});
