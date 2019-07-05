const globby = require('globby');
const path = require('path');
const { createConfig } = require('./create/create-config');
const { createDocs } = require('./create/create-docs');
const { createHints } = require('./create/create-hints');
const { createLocales } = require('./create/create-locales');
const { createMetas } = require('./create/create-metas');

/** @typedef {import('./create/utils').RuleMeta} RuleMeta */

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
        if (category === 'cat.other' && rule.id.startsWith('aria-')) {
            category = 'cat.aria';
            rule.tags.push(category);
        }

        return category;
    });
};

const main = async () => {
    const axePath = require.resolve('axe-core').replace(/axe.js$/, '');
    const axePackage = require('axe-core/package.json');
    const rulePaths = await globby(path.normalize(`${axePath}lib/rules/*.json`));

    const rules = rulePaths.map((rulePath) => {
        return /** @type {RuleMeta} */ (require(rulePath));
    }).sort((r1, r2) => {
        return r1.id.localeCompare(r2.id);
    });

    const categories = [...new Set(getCategories(rules))].sort();

    createConfig(categories);
    createDocs(categories, rules, axePackage.version);
    createHints(categories, rules);
    createLocales(categories);
    createMetas(categories, rules);
};

main();
