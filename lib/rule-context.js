/**
 * @fileoverview RuleContext utility for rules
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Typedefs
//------------------------------------------------------------------------------

/**
 * An error message description
 * @typedef {Object} MessageDescriptor
 * @property {string} nodeType The type of node.
 * @property {Location} loc The location of the problem.
 * @property {string} message The problem message.
 * @property {Object} [data] Optional data to use to fill in placeholders in the
 *      message.
 * @property {Function} fix The function to call that creates a fix command.
 */

//------------------------------------------------------------------------------
// Helper functions
//------------------------------------------------------------------------------
// TODO: maybe this should go into another file for easier testing?
function findElementLocation(element) {
    const html = element.ownerDocument.children[0].outerHTML;
    const occurrences = (html.match(new RegExp(element.outerHtml, 'g')) || []).length;
    let initHtml;
    if (occurrences === 1) {
        initHtml = html.substring(0, html.indexOf(element.outerHtml));
    } else if (occurrences > 1) {
        // TODO: return the right start place
        initHtml = html.substring(0, html.indexOf(element.outerHtml));
    } else {
        return null;
    }

    const lines = initHtml.split('\n');
    return {
        line: lines.length + 1,
        column: lines.pop().length
    };
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * Rule context class
 * Acts as an abstraction layer between rules and the main eslint object.
 */
class RuleContext {

    /**
     * @param {string} ruleId The ID of the rule using this object.
     * @param {sonar} sonar The sonar object.
     * @param {number} severity The configured severity level of the rule.
     * @param {Array} options The configuration information to be added to the rule.
     * @param {Object} settings The configuration settings passed from the config file.
     * @param {Object} meta The metadata of the rule
     */
    constructor(ruleId, sonar, severity, options, meta) {
        // public.
        this.id = ruleId;
        this.options = options;
        this.meta = meta;

        // private.
        this.sonar = sonar;
        this.severity = severity;

        Object.freeze(this);
    }

    /**
     * Passthrough to eslint.report() that automatically assigns the rule ID and severity.
     * @param {Object} nodeOrDescriptor The node related to the message or a message
     *      descriptor.
     * @param {string} message The message to display to the user.
     * @param {Object} position The position of the error in that element.
     * @returns {void}
     */
    report(nodeOrDescriptor, message, position = null) {
        const descriptor = nodeOrDescriptor; // TODO: this should probably contain the info of the resource (HTML, image, font, etc.)

        let location;
        if (position !== null && descriptor.outerHTML) {
            location = findElementLocation(nodeOrDescriptor);
            location.column += position.column;
            location.line += position.line;
        } else {
            location = position;
        }

        this.sonar.report(
            this.id,
            this.severity,
            descriptor.node,
            location,
            message,
            this.meta
        );
    }
}


module.exports = RuleContext;
