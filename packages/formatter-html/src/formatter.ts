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

import { Category, Problem } from '@hint/utils-types';
import { logger } from '@hint/utils';
import { cwd, readFileAsync } from '@hint/utils-fs';
import { debug as d } from '@hint/utils-debug';
import { FormatterOptions, HintResources, IFormatter } from 'hint';

const utils = require('./utils');

import AnalysisResult, { CategoryResult, HintResult } from './result';
import { getMessage as getMessageFormatter, MessageName } from './i18n.import';

const debug = d(__filename);

type FileContent = {
    content: string;
    file: string;
}

/** List of scripts in the order they needs to be added to the html page */
const scriptsList = [
    'js/highlight/highlight.min.js',
    'js/highlight/languages/xml.min.js',
    'js/polyfills/details.js',
    'js/anchor-top.js',
    'js/scan/_locales/messages.js',
    'js/scan/get-message.js',
    'js/scan/scanner-common.js'
];

/** List of styles in the order they needs to be added to the html page */
const stylesList = [
    'styles/fonts.css',
    'styles/base.css',
    'styles/controls.css',
    'styles/type.css',
    'styles/layouts.css',
    'styles/structure.css',
    'styles/anchor-top.css',
    'styles/scan/scan-results.css',
    'styles/highlight/default.min.css'
];

const mediaTypes = {
    png: 'image/png',
    svg: 'image/svg+xml',
    woff: 'font/woff',
    woff2: 'font/woff2'
};

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

    for (const [, value] of Object.entries(Category)) {
        result.push(value);
    }

    return result;
};

const createLanguageFile = async (language: string = 'en') => {
    const rootPath = path.join(__dirname, 'assets', 'js', 'scan', '_locales');
    const languagesToCheck = [language];
    const languageParts = language.split('-');

    /*
     * Add to the list the 'main' language.
     * e.g. en-US => en
     */
    if (languageParts.length > 1) {
        languagesToCheck.push(languageParts[0]);
    }

    // Default to 'en'.
    let existingLanguage = 'en';

    for (const lang of languagesToCheck) {
        const file = path.join(rootPath, lang, 'messages.js');

        if (fs.existsSync(file)) { // eslint-disable-line no-sync
            existingLanguage = lang;
            break;
        }
    }

    const orig = path.join(rootPath, existingLanguage, 'messages.js');
    const dest = path.join(rootPath, 'messages.js');

    await fs.copyFile(orig, dest);
};

const removeLanguageFile = async () => {
    await fs.unlink(path.join(__dirname, 'assets', 'js', 'scan', '_locales', 'messages.js'));
};

const getScriptsContent = async (files: string[]): Promise<FileContent[]> => {
    const result: FileContent[] = [];

    for (const file of files) {
        const regex = /<\/script>/g;
        const content = await readFileAsync(path.resolve(__dirname, 'assets', file));

        result.push({
            // Replace the string </script> to avoid problems in the website.
            content: content.replace(regex, '</scr"+"ipt>'),
            file
        });
    }

    return result;
};

const isFont = (extension: string) => {
    return extension === 'woff' || extension === 'woff2';
};

const getDataUri = (file: string) => {
    const extensionFile = path.extname(file).slice(1);
    const mediaType = mediaTypes[extensionFile as keyof typeof mediaTypes];
    const content = fs.readFileSync(path.join(__dirname, 'assets', isFont(extensionFile) ? 'styles' : '', file)); // eslint-disable-line no-sync

    const data = Buffer.from(content).toString('base64');

    const dataUri = `data:${mediaType};base64,${data}`;

    return dataUri;
};

const replaceRegex = (match: string, file: string) => {
    const dataUri = getDataUri(file);

    return `url('${dataUri}')`;
};

const getStylesContent = async (files: string[]): Promise<FileContent[]> => {
    const result: FileContent[] = [];

    for (const file of files) {
        let content = await readFileAsync(path.resolve(__dirname, 'assets', file));

        const urlCSSRegex = /url\(['"]?([^'")]*)['"]?\)/g;

        content = content.replace(urlCSSRegex, replaceRegex);

        result.push({
            content,
            file
        });
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
    public async format(problems: Problem[], /* istanbul ignore next */ options: FormatterOptions = {}) {

        debug('Formatting results');

        const language = options.language!;
        const target = options.target || '';
        const result = new AnalysisResult(target, options);
        const categoryList: string[] = getCategoryList(options.resources);

        categoryList.forEach((category) => {
            result.addCategory(category, language);
        });

        problems.forEach((message) => {
            result.addProblem(message, language);
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

                await createLanguageFile(language);

                const htmlPath = path.join(__dirname, 'views', 'pages', 'report.ejs');
                const scripts = await getScriptsContent(scriptsList);
                const html = await this.renderFile(htmlPath, {
                    getDataUri,
                    getMessage(key: MessageName, substitutions?: string | string[]) {
                        return getMessageFormatter(key, language, substitutions);
                    },
                    result,
                    scripts,
                    styles: await getStylesContent(stylesList),
                    utils
                });

                await removeLanguageFile();
                // We save the result with the friendly target name
                const name = target.replace(/:\/\//g, '-')
                    .replace(/:/g, '-')
                    .replace(/\./g, '-')
                    .replace(/\//g, '-')
                    .replace(/[?=]/g, '-query-')
                    .replace(/-$/, '');
                const destDir = options.output || path.join(cwd(), 'hint-report');

                const destination = path.join(destDir, `${name}.html`);

                await fs.outputFile(destination, html);

                logger.log(getMessageFormatter('youCanView', language, destination));
            }

            return result;
        } catch (err) {
            logger.error(err);

            throw err;
        }
    }
}
