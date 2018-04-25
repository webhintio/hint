/**
 * @fileoverview Options configuration for optionator.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as optionator from 'optionator';

/*
 * ------------------------------------------------------------------------------
 * Initialization and Public Interface
 * ------------------------------------------------------------------------------
 */

export const options = optionator({
    defaults: {
        concatRepeatedArrays: true,
        mergeRepeatedObjects: true
    },
    options: [
        {heading: 'Basic configuration'},
        {
            alias: 'c',
            description: 'Use configuration from this file or shareable config',
            option: 'config',
            type: 'path::String'
        },
        {
            alias: 'i',
            description: 'Generate a configuration file',
            option: 'init',
            type: 'Boolean'
        },
        {heading: 'Miscellaneous'},
        {
            default: false,
            description: 'Output debugging information',
            option: 'debug',
            type: 'Boolean'
        },
        {
            alias: 'h',
            description: 'Show help',
            option: 'help',
            type: 'Boolean'
        },
        {
            alias: 'v',
            description: 'Output the version number',
            option: 'version',
            type: 'Boolean'
        },
        {
            alias: 'n',
            description: `Generate a new rule (in sonarwhal's main repo)`,
            option: 'new-rule',
            type: 'Boolean'
        },
        {
            alias: 'p',
            description: `Generate a new parser`,
            option: 'new-parser',
            type: 'Boolean'
        },
        {
            alias: 'w',
            description: 'Activate a watcher for the connector (if supported)',
            option: 'watch',
            type: 'Boolean'
        },
        {
            alias: 'f',
            description: 'Explicitly specify the formatters to be used',
            option: 'formatters',
            type: 'String'
        },
        {
            alias: 'r',
            description: 'Explicitly specify the rules to be used',
            option: 'rules',
            type: 'String'
        }
    ],
    prepend: 'sonarwhal [options] https://url.com'
});
