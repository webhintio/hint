const schemaValidator = require('is-my-json-valid/require');
const validateConfig = schemaValidator('config-schema.json');

const validateRule = () => {};

module.exports = {

    validateConfig,
    validateRule

};
