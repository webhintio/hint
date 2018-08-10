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
import { IFormatter, Problem, FormatterOptions } from 'hint/dist/src/lib/types';
import { Category } from 'hint/dist/src/lib/enums/category';
import * as logger from 'hint/dist/src/lib/utils/logging';

const utils = require('./utils');

import AnalysisResult from './result';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Utils
 * ------------------------------------------------------------------------------
 */

const getCategoryList = (): Array<string> => {
    const result: Array<string> = [];

    for (let [, value] of Object.entries(Category)) {
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
                if (err) {
                    return reject(err);
                }

                return resolve(html);
            });
        });
    }

    /** Format the problems grouped by `resource` name and sorted by line and column number */
    public async format(problems: Array<Problem>, target: string, options: FormatterOptions = {}) {

        debug('Formatting results');

        const result = new AnalysisResult(target, options);
        const categoryList: Array<string> = getCategoryList();

        categoryList.forEach((category) => {
            result.addCategory(category);
        });

        problems.forEach((message) => {
            result.addProblem(message);
        });

        try {
            if (!options.noGenerateFiles) {
                result.id = Date.now().toString();

                const htmlPath = path.join(__dirname, 'views', 'pages', 'report.ejs');
                const html = await this.renderFile(htmlPath, { result, utils });
                // We save the result with the friendly target name
                const name = target.replace(/:\/\//g, '-')
                    .replace(/:/g, '-')
                    .replace(/\./g, '-')
                    .replace(/\//g, '-')
                    .replace(/-$/, '');
                const destDir = path.join(process.cwd(), 'hint-report', name);
                const currentDir = path.join(__dirname);
                const configDir = path.join(destDir, 'config');

                await fs.remove(destDir);

                await fs.mkdirp(configDir);

                await fs.copy(path.join(currentDir, 'assets'), path.join(destDir));

                if (options.config) {
                    await fs.outputFile(path.join(configDir, result.id), JSON.stringify(options.config));
                }

                await fs.outputFile(path.join(destDir, 'index.html'), html);
            }

            return result;
        } catch (err) {
            logger.error(err);

            throw err;
        }
    }
}
