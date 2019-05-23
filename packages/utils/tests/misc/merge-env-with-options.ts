/* eslint-disable no-process-env */
import test from 'ava';


import { mergeEnvWithOptions } from '../../src/misc';

test(`mergeEnvWithOptions merges an env variable that's not in the given options`, (t) => {
    const key = 'WEBHINT_random_options';
    const value = 'random';

    process.env[key] = value;

    const options = mergeEnvWithOptions({});

    t.is(options.random.options, value);
});

test(`mergeEnvWithOptions correctly parses booleans and numbers`, (t) => {
    const key1 = 'WEBHINT_random_parsing_falseValue';
    const value1 = 'false';
    const key2 = 'WEBHINT_random_parsing_trueValue';
    const value2 = 'true';
    const key3 = 'WEBHINT_random_parsing_numberValue';
    const value3 = '10000';

    process.env[key1] = value1;
    process.env[key2] = value2;
    process.env[key3] = value3;

    const options = mergeEnvWithOptions({});

    t.false(options.random.parsing.falseValue);
    t.true(options.random.parsing.trueValue);
    t.is(options.random.parsing.numberValue, 10000);
});

test(`mergeEnvWithOptions prioritizes the properties in the given options`, (t) => {
    const options = { random: { priority: 'random' } };
    const key = 'WEBHINT_random_priority';
    const value = 'replaced';

    process.env[key] = value;

    const finalOptions = mergeEnvWithOptions(options);

    t.is(finalOptions.random.priority, options.random.priority);
});

test(`mergeEnvWithOptions merges correctly options and environment properties`, (t) => {
    const options = { random: { options: 'random' } };
    const key = 'WEBHINT_random_newproperty';
    const value = 'this is new';

    process.env[key] = value;

    const finalOptions = mergeEnvWithOptions(options);

    t.is(finalOptions.random.options, options.random.options);
    t.is(finalOptions.random.newproperty, value);
});

test(`mergeEnvWithOptions returns a new object if options is undefined`, (t) => {
    const key = 'WEBHINT_random_options';
    const value = 'replaced';

    process.env[key] = value;

    const options = mergeEnvWithOptions(undefined);

    t.is(options.random.options, value);
});
