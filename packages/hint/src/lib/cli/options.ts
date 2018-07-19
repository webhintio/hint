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
        {heading: 'Miscellaneous'},
        {
            default: false,
            description: 'Output debugging information',
            option: 'debug',
            type: 'Boolean'
        },
        {
            default: false,
            description: 'Output debugging information related with analytics',
            option: 'analytics-debug',
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
            description: 'Explicitly specify the hints to be used',
            option: 'hints',
            type: 'String'
        },
        {
            alias: 't',
            description: 'Explicitly specify if enable tracking or not',
            enum: ['on', 'off'],
            option: 'tracking',
            type: 'String'
        }
    ],
    prepend: 'hint [options] https://url.com'
});
