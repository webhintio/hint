const debug = require('debug')('sonar:rules:no-double-slash');

module.exports = {
    meta: {
        docs: {
            description: 'Use https over //',
            category: 'Security',
            recommended: true
        },
        fixable: 'code',
        schema: [] // no options
    },
    /**
     * Creates a new instance of this rule with a given context (configuration, etc.)
     * @param {RuleContext} The context of the rule (severity, settings, reporter)
     * @return {Object} The events the rule needs to be notified of with their handlers
     */
    create(context) {
        // TODO: we should use context for the severity and some options (if applicable)
        /*
            We need to use getAttribute to get the exact value.
            If we access the src or href properties directly the browser already adds
            http(s):// so we cannot verify
        */
        const validate = (element) => {
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

                context.report(element, `Invalid link found: ${url}`, location);
            }
        };

        return {
            'element::a': validate,
            'element::script': validate,
            'element::link': validate
        };
    }
};
