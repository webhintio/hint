import { CheckResult, AxeResults, ImpactValue, NodeResult as AxeNodeResult, run, source, ElementContext } from 'axe-core';

import { HTMLElement } from '@hint/utils-dom';
import { CanEvaluateScript } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Severity } from '@hint/utils-types';
import { getAsUri } from '@hint/utils-network';

import { getMessage } from '../i18n.import';

type EngineKey = object;

type Options = {
    [ruleId: string]: keyof typeof Severity;
} | string[];

type Registration = {
    context: HintContext;
    enabledRules: string[];
    options: { [ruleId: string]: keyof typeof Severity };
    event: CanEvaluateScript;
};

type RegistrationMap = Map<EngineKey, Map<string, Registration[]>>;

/**
 * Accumulates registrations via 'can-evaluate::script' until 'scan::end'.
 * Groups registrations by unique engine key, then by resource URL.
 * Ensures only registrations for the same resource in the same scan are
 * processed together in a single execution of `axe-core`.
 */
const registrationMap: RegistrationMap = new Map();

const getElement = (context: HintContext, node: AxeNodeResult): HTMLElement | undefined | null => {
    let selector = node.target[0];

    // Contrary to types, axe-core can return an array of strings. Take the first.
    /* istanbul ignore next */
    if (Array.isArray(selector)) {
        selector = selector[0];
    }

    return context.pageDOM?.querySelector(selector);
};

/** Validate if an axe check result has data associated with it. */
const hasCheckData = (result: CheckResult): boolean => {
    return !!result.data;
};

/** Retrieve the message from an axe check result. */
const toCheckMessage = (result: CheckResult): string => {
    return result.message;
};

/**
 * Combine only the node sub-check results containing data to
 * create a summary. This avoids including sub-check messages
 * stating static facts which are typically redundant with the
 * help text for a rule.
 *
 * E.g. color contrast includes specific data about the calculated
 * contrast value whereas checking for the lang on <html> just
 * restates that the lang attribute was not found.
 */
const getSummary = (node: AxeNodeResult): string => {
    const summary = [...node.all, ...node.any, ...node.none]
        .filter(hasCheckData)
        .map(toCheckMessage)
        .join(' ');

    return summary;
};

/**
 * Save a registration to process in a batched call to `axe-core` later.
 */
const queueRegistration = (registration: Registration, map: RegistrationMap) => {
    const engineKey = registration.context.engineKey;
    const resource = registration.event.resource;
    const registrationsByResource = map.get(engineKey) || new Map();
    const registrations = registrationsByResource.get(resource) || [];

    registrations.push(registration);
    registrationsByResource.set(resource, registrations);
    map.set(engineKey, registrationsByResource);
};

/**
 * Retrieve the registrations for a particular engine instance and resource.
 * Removes returned registrations from the map as they are no longer needed.
 */
const useRegistrations = (engineKey: EngineKey, resource: string, map: RegistrationMap) => {
    const registrationsByResource = map.get(engineKey);

    if (!registrationsByResource) {
        return null;
    }

    const registrations = registrationsByResource.get(resource);

    /* istanbul ignore next */
    if (!registrations) {
        return null;
    }

    registrationsByResource.delete(resource);

    if (!registrationsByResource.size) {
        map.delete(engineKey);
    }

    return registrations;
};

/* istanbul ignore next */
const toSeverity = (impact?: ImpactValue) => {
    if (impact === 'minor') {
        return Severity.hint;
    }

    if (impact === 'moderate' || impact === 'serious') {
        return Severity.warning;
    }

    if (impact === 'critical') {
        return Severity.error;
    }

    // In case axe adds a new `impact` that is not tracked above
    return Severity.warning;
};

const withQuotes = (ruleId: string) => {
    return `'${ruleId}'`;
};

const evaluateAxe = async (context: HintContext, event: CanEvaluateScript, rules: string[]): Promise<AxeResults | null> => {
    const { document, resource } = event;

    /**
     * iframes scan is ignored for local files due to error:
     * 'allowedOrigins value "null" is not a valid origin'
     *
     * This is caused by an axe-core bug which is currently tracked here:
     * https://github.com/dequelabs/axe-core/issues/3002
     */
    const uri = getAsUri(resource);
    const shouldScanIframes = !(uri && uri.protocol.includes('file'));

    /* istanbul ignore next */
    try {
        const target = document.isFragment ?
            'document.body' :
            'document';

        return await context.evaluate(`(function(module) {
            ${source}
            var target = ${target};
            return window.axe.run(target, {
                iframes: ${shouldScanIframes},
                runOnly: {
                    type: 'rule',
                    values: [${rules.map(withQuotes).join(',')}]
                }
            });
        })()`);
    } catch (e) {

        const err = e as Error;
        let message: string;

        console.error(`Running axe-core failed: ${err.message}\n${err.stack}`);

        if (err.message.includes('evaluation exceeded')) {
            message = getMessage('notFastEnough', context.language);
        } else {
            message = getMessage('errorExecuting', context.language, err.message);
        }

        message = getMessage('tryAgainLater', context.language, message);

        context.report(resource, message, { severity: Severity.warning });

        return null;
    }
};

const normalizeOptions = (options: Options) => {
    if (Array.isArray(options)) {
        const normalizedOptions = options.reduce((newOptions, axeRuleId) => {
            (newOptions as any)[axeRuleId] = 'default';

            return newOptions;
        }, {});

        return normalizedOptions;
    }

    return options || {};
};

/**
 * Register a given set of axe rules to be queued for evaluation on
 * `can-evaluate::script`. These rules will be aggregated across axe
 * sub-hints and executed in a single batch for a given resource on
 * `scan::end` (for performance). Results will then be split out and
 * reported back via their original context.
 */
export const register = (context: HintContext, rules: string[], disabled: string[]) => {
    const options = normalizeOptions(context.hintOptions);

    const { engineKey } = context;

    const enabledRules = rules.filter((rule) => {
        if (options[rule]) {
            return options[rule] !== 'off';
        }

        return !disabled.includes(rule);
    });

    context.on('traverse::end', (event) => {
        queueRegistration({ context, enabledRules, event, options }, registrationMap);
    });

    // Used when we have to evaluate axe in a different context (e.g. connector-puppeteer and nearly everything else).
    context.on('scan::end', async ({ resource }) => {
        const registrations = useRegistrations(engineKey, resource, registrationMap);

        if (!registrations) {
            return;
        }

        const ruleToRegistration = new Map<string, Registration>();

        for (const registration of registrations) {
            for (const rule of registration.enabledRules) {
                ruleToRegistration.set(rule, registration);
            }
        }

        const document = registrations[0].event.document;
        const rules = Array.from(ruleToRegistration.keys());

        let result: AxeResults | null = null;

        if (document.defaultView) {
            // If we're in the same context as the document, run axe directly (e.g. utils-worker).
            const target = document.isFragment ? document.body : document.documentElement;

            result = await run(target as ElementContext, {
                runOnly: {
                    type: 'rule',
                    values: rules
                }
            });
        } else {
            // Otherwise evaluate axe in the provided context (e.g. connector-puppeter, everything else).
            result = await evaluateAxe(context, { document, resource }, rules);
        }

        /* istanbul ignore next */
        if (!result || !Array.isArray(result.violations)) {
            throw new Error(`Unable to parse axe results ${result}`);
        }

        for (const violation of result.violations) {
            for (const node of violation.nodes) {
                const summary = getSummary(node);
                const message = summary ? `${violation.help}: ${summary}` : violation.help;
                const registration = ruleToRegistration.get(violation.id)!;
                const element = getElement(context, node);
                const ruleSeverity = Severity[registration.options[violation.id]] ?? Severity.default;
                const forceSeverity = ruleSeverity !== Severity.default;
                const severity = !forceSeverity ?
                    toSeverity(violation.impact) :
                    ruleSeverity;

                registration.context.report(resource, message, {
                    documentation: [{
                        link: violation.helpUrl,
                        text: getMessage('learnMore', context.language)
                    }],
                    element,
                    forceSeverity,
                    severity
                });
            }
        }
    });
};
