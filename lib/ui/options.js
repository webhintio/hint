/**
 * @fileoverview Options configuration for optionator.
 * @author Anton Molleda (molant)
 */


//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const optionator = require('optionator');

//------------------------------------------------------------------------------
// Initialization and Public Interface
//------------------------------------------------------------------------------

// exports "parse(args)", "generateHelp()", and "generateHelpForOption(optionName)"
module.exports = optionator({
    prepend: 'sonar [options] https://url.com [https://url2.com]',
    defaults: {
        concatRepeatedArrays: true,
        mergeRepeatedObjects: true
    },
    options: [
        {
            heading: 'Basic configuration'
        },
        {
            option: 'config',
            alias: 'c',
            type: 'path::String',
            description: 'Use configuration from this file or shareable config'
        },
        // {
        //     option: 'env',
        //     type: '[String]',
        //     description: 'Specify environments'
        // },
        {
            heading: 'Output'
        },
        {
            option: 'output-file',
            alias: 'o',
            type: 'path::String',
            description: 'Specify file to write report to'
        },
        {
            option: 'format',
            alias: 'f',
            type: 'String',
            default: 'stylish',
            description: 'Use a specific output format'
        },
        {
            heading: 'Miscellaneous'
        },
        {
            option: 'debug',
            type: 'Boolean',
            default: false,
            description: 'Output debugging information'
        },
        {
            option: 'help',
            alias: 'h',
            type: 'Boolean',
            description: 'Show help'
        },
        {
            option: 'version',
            alias: 'v',
            type: 'Boolean',
            description: 'Output the version number'
        }
    ]
});
