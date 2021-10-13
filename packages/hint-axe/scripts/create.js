const { createConfig } = require('./create/create-config');
const { createDocs } = require('./create/create-docs');
const { createHints } = require('./create/create-hints');
const { createLocales } = require('./create/create-locales');
const { createMetas } = require('./create/create-metas');

/** @typedef {import('axe-core').RuleMetadata} RuleMeta */

/**
 * @param {RuleMeta[]} rules
 */
const getCategories = (rules) => {
    return rules.map((rule) => {
        let category = rule.tags.filter((tag) => {
            return tag.startsWith('cat.');
        })[0] || 'cat.other';

        // TODO: Fix in `axe-core`
        if (category === 'cat.time') {
            category = 'cat.time-and-media';
            rule.tags = rule.tags.map((tag) => {
                return tag === 'cat.time' ? 'cat.time-and-media' : tag;
            });
        }

        // TODO: Fix in `axe-core`
        if (category === 'cat.other' && rule.ruleId.startsWith('aria-')) {
            category = 'cat.aria';
            rule.tags.push(category);
        }

        return category;
    });
};

const main = () => {
    const axeCore = require('axe-core');
    const rules = axeCore.getRules();

    rules.sort((r1, r2) => {
        return r1.ruleId.localeCompare(r2.ruleId);
    });

    const categories = [...new Set(getCategories(rules))].sort();

    createConfig(categories);
    createDocs(categories, rules, axeCore.version);
    createHints(categories, rules);
    createLocales(categories);
    createMetas(categories, rules);
};

main();
