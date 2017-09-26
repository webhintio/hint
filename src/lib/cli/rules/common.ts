import { findPackageRoot as packageRoot, normalizeStringByDelimiter } from '../../utils/misc';

export const normalize = normalizeStringByDelimiter;
export const ruleTemplateDir = './templates/core-rule';
export const ruleScriptDir = 'src/lib/rules';
export const ruleDocDir = 'docs/user-guide/rules';
export const ruleTestDir = 'tests/lib/rules';
export const ruleDistScriptDir = `dist/${ruleScriptDir}`;
export const packageDir = packageRoot();
export const processDir = process.cwd();

/** Check if a rule exists. */
export const ruleExists = (ruleName: string, currentRules: Array<string>): boolean => {
    return currentRules.includes(normalize(ruleName, '-'));
};

/**  Usage categories that the new rule applies to */
export type UseCase = {
    /**  Rule applies to DOM */
    dom: boolean;
    /**  Rule applies to resource request */
    request: boolean;
    /**  Rule applies to third party service */
    thirdPartyService: boolean;
    /**  Rule applies to JS injection */
    jsInjection: boolean;
};

/** Generate a new rule */
export type NewRule = {
    /** Name of the new rule */
    name: string;
    /** Category of the new rule */
    category: string;
    /** Description of the new rule */
    description: hbs.SafeString;
    /** Element type if `dom` is selected in useCase */
    elementType?: string;
    /** Events that should be subscribed to */
    events: string;
    /** If the new rule is core */
    isCore: boolean;
    /**  Usage categories that the new rule applies to */
    useCase?: UseCase;
};
