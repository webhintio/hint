const debug = require('debug')('sonar:rules:no-double-slash');

/** @type {Rule} */
module.exports = {
    /**
     * Creates a new instance of this rule with a given context (configuration, etc.)
     * @param {RuleContext} The context of the rule (severity, settings, reporter)
     * @return {Object} The events the rule needs to be notified of with their handlers
     */
    create(context) {
        /*
            We need to use getAttribute to get the exact value.
            If we access the src or href properties directly the browser already adds
            http(s):// so we cannot verify
        */
        const validate = (resource, element) => {
            debug(`Analyzing link\n${element.outerHTML}`);
            const url = element.getAttribute('src') || element.getAttribute('href') || '';

            if (url.indexOf('//') === 0) {
                debug('Invalid link found');
                const startIndex = element.outerHTML.indexOf(url);
                const html = element.outerHTML.substring(0, startIndex);
                const lines = html.split('\n');
                const line = lines.length;
                const column = lines.length === 1 ? startIndex : lines.pop().length;

                const location = { column, line };

                context.report(resource, element, `Invalid link found: ${url}`, location);
            }
        };

        return {
            'element::a': validate,
            'element::link': validate,
            'element::script': validate
        };
    },
    meta: {
        docs: {
            category: 'Security',
            description: 'Use https over //',
            recommended: true
        },
        fixable: 'code',
        schema: [] // no options
    }
};
