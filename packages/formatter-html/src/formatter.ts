/**
 * @fileoverview A hint formatter that outputs the issues in a HTML file..
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as path from 'path';

import * as ejs from 'ejs';
import * as fs from 'fs-extra';

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IFormatter, Problem, FormatterOptions, HintResources } from 'hint/dist/src/lib/types';
import { Category } from 'hint/dist/src/lib/enums/category';
import * as logger from 'hint/dist/src/lib/utils/logging';

const utils = require('./utils');

import AnalysisResult, { CategoryResult, HintResult } from './result';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Utils
 * ------------------------------------------------------------------------------
 */
/* istanbul ignore next */
const getCategoryListFromResources = (resources: HintResources) => {
    const categoriesArray: string[] = resources.hints.map((hint) => {
        if (hint.meta.docs && hint.meta.docs.category) {
            return hint.meta.docs.category;
        }

        return Category.other;
    });

    // Clean duplicated values.
    const categories: Set<string> = new Set(categoriesArray);

    return Array.from(categories);
};

const getCategoryList = (resources?: HintResources): string[] => {
    /* istanbul ignore if */
    if (resources) {
        return getCategoryListFromResources(resources);
    }

    const result: string[] = [];

    for (let [, value] of Object.entries(Category)) {
        // TODO: Category has been deprecated, will remove in the near future
        if (value === 'interoperability') {
            continue;
        }
        if (value === 'pwa') {
            value = value.toUpperCase();
        } else {
            value = `${value[0].toUpperCase()}${value.substr(1)}`;
        }
        result.push(value);
    }

    return result;
};

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

export default class HTMLFormatter implements IFormatter {
    private renderFile(filename: string, data: any) {
        return new Promise((resolve, reject) => {
            ejs.renderFile(filename, data, { filename }, (err, html) => {
                /* istanbul ignore if */
                if (err) {
                    return reject(err);
                }

                return resolve(html);
            });
        });
    }

    /** Format the problems grouped by `resource` name and sorted by line and column number */
    public async format(problems: Problem[], /* istanbul ignore next */ target = '', /* istanbul ignore next */ options: FormatterOptions = {}) {

        debug('Formatting results');

        const result = new AnalysisResult(target, options);
        const categoryList: string[] = getCategoryList(options.resources);

        categoryList.forEach((category) => {
            result.addCategory(category);
        });

        problems.forEach((message) => {
            result.addProblem(message);
        });

        /* istanbul ignore if */
        if (options.resources) {
            options.resources.hints.forEach((hintConstructor) => {
                const categoryName: string = hintConstructor.meta.docs!.category!;
                const hintId: string = hintConstructor.meta.id;

                const category: CategoryResult = result.getCategoryByName(categoryName)!;
                const hint: HintResult | undefined = category.getHintByName(hintId);

                if (!hint) {
                    category.addHint(hintId, 'pass');
                }
            });
        }

        try {
            if (!options.noGenerateFiles) {
                result.percentage = 100;
                result.id = Date.now().toString();

                const htmlPath = path.join(__dirname, 'views', 'pages', 'report.ejs');
                const html = await this.renderFile(htmlPath, { result, utils });
                // We save the result with the friendly target name
                const name = target.replace(/:\/\//g, '-')
                    .replace(/:/g, '-')
                    .replace(/\./g, '-')
                    .replace(/\//g, '-')
                    .replace(/[?=]/g, '-query-')
                    .replace(/-$/, '');
                const destDir = path.join(process.cwd(), 'hint-report', name);
                const currentDir = path.join(__dirname);
                const configDir = path.join(destDir, 'config');

                await fs.remove(destDir);

                await fs.mkdirp(configDir);

                await fs.copy(path.join(currentDir, 'assets'), destDir);

                /**
                 * Update images reference to make them work locally
                 * when there is no server.
                 */
                const parseCssfile = async (filePath: string, prefix: string = '../..') => {
                    const cssFile = filePath;
                    let scanCSS = await fs.readFile(cssFile, 'utf-8');
                    const urlCSSRegex = /url\(['"]?([^'")]*)['"]?\)/g;

                    scanCSS = scanCSS.replace(urlCSSRegex, (match, group) => {
                        return `url('${group[0] === '/' ? prefix : ''}${group}')`;
                    });

                    await fs.outputFile(filePath, scanCSS, { encoding: 'utf-8' });
                };

                await parseCssfile(path.join(destDir, 'styles', 'scan', 'scan-results.css'));
                await parseCssfile(path.join(destDir, 'styles', 'anchor-top.css'), '../');

                if (options.config) {
                    await fs.outputFile(path.join(configDir, result.id), JSON.stringify(options.config));
                }

                const destination = path.join(destDir, 'index.html');

                await fs.outputFile(destination, html);

                logger.log(`You can view the HTML report in "${destination}"`);
            }

            return result;
        } catch (err) {
            logger.error(err);

            throw err;
        }
    }
}
