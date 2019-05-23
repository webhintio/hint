import { merge } from 'lodash';

const isWebhintVariable = (variable: string) => {
    return variable.toLowerCase().startsWith('webhint_');
};

const parseValue = (value: string): string | number | boolean => {
    const parsedInt = parseInt(value);

    if (!isNaN(parsedInt)) {
        return parsedInt;
    }

    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    return value;
};

/**
 * Adds the value of a variable to an object creating as many properties as
 * needed.
 *
 * E.g.:
 *
 * ```js
 * addToConfig('webhint_connector_options_auth_username', 'johndoe', {});
 * ```
 *
 * gets transformed into
 *
 * ```json
 * {
 *   "connector": {
 *     "options": {
 *       "auth": {
 *         "username": "johndoe"
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * @param variable The variable to add to a config. E.g.:
 *   `webhint_connector_options_auth_username`
 * @param value Any string
 * @param config The object to add the config too
 */
const addToConfig = (variable: string, value: string, config: any) => {
    /** `variable` example: webhint_connector_options_auth_username */
    const parts = variable.split('_');

    /** First item is `webhint` and it is not needed */
    parts.shift();

    const lastPart = parts.pop()!;
    const context = parts.reduce((current, part) => {
        /* Create the property if necessary */
        return (current[part] = current[part] || {});
    }, config);

    context[lastPart] = parseValue(value);
};

/**
 * Merges any enviroment variable prefixed with `webhint_` with the given
 * options given priority to the `options`.
 *
 * E.g.: `WEBHINT_connector_options_ignoreHTTPSErrors=true` will be:
 *
 * ```json
 * {
 *   "connector": {
 *       "name": true
 *   }
 * }
 * ```
 *
 * @param options The initial set of options to merge the env variables with.
 */
export const mergeEnvWithOptions = (options: any) => {
    const environment = process.env; // eslint-disable-line no-process-env
    const envConfig: any = {};

    const variables = Object.keys(environment);

    for (const variable of variables) {
        if (isWebhintVariable(variable)) {
            addToConfig(variable, process.env[variable]!, envConfig); // eslint-disable-line no-process-env
        }
    }

    const finalOptions = merge(envConfig, options);

    return finalOptions;
};
