export const schema = {
    additionalProperties: false,
    definitions: {
        action: {
            additionalProperties: false,
            properties: {
                file: { type: 'string' },
                on: {
                    enum: ['beforeTargetNavigation', 'afterTargetNavigation'],
                    type: 'string'
                }
            },
            required: ['file', 'on']
        },
        auth: { oneOf: [{ $ref: '#/definitions/authOptions' }, { $ref: '#/definitions/httpAuthOptions' }] },
        authOptions: {
            additionalProperties: false,
            properties: {
                next: { $ref: '#/definitions/submitInput' },
                password: { $ref: '#/definitions/fieldInput' },
                submit: { $ref: '#/definitions/submitInput' },
                user: { $ref: '#/definitions/fieldInput' }
            },
            required: ['user', 'password', 'submit'],
            type: 'object'
        },
        fieldInput: {
            properties: {
                selector: { type: 'string' },
                value: { type: 'string' }
            },
            required: ['selector', 'value'],
            type: 'object'
        },
        httpAuthOptions: {
            additionalProperties: false,
            properties: {
                password: { type: 'string' },
                user: { type: 'string' }
            },
            required: ['user', 'password'],
            type: 'object'
        },
        submitInput: {
            properties: { selector: { type: 'string' } },
            required: ['selector'],
            type: 'object'
        }
    },
    properties: {
        actions: {
            items: { $ref: '#/definitions/action' },
            type: 'array'
        },
        actionsConfig: { type: 'object' },
        auth: { $ref: '#/definitions/auth' },
        browser: {
            enum: ['Chrome', 'Chromium', 'Edge'],
            type: 'string'
        },
        detached: { type: 'boolean' },
        headless: { type: 'boolean' },
        ignoreHTTPSErrors: { type: 'boolean' },
        puppeteerOptions: { type: 'object' },
        waitUntil: {
            enum: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
            type: 'string'
        }
    }
};
