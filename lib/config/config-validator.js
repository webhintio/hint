const schemaValidator = require('is-my-json-valid/require'),
    validateConfig = schemaValidator('config-schema.json');

const validateRule = (rule, config) => {

};

module.exports = {

    validateConfig,
    validateRule

};
