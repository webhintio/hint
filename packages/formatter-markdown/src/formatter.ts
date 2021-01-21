import * as fs from 'fs-extra';
import * as path from 'path';
import { cwd } from 'process';

import { logger } from '@hint/utils';
import { Problem, Category, Severity } from '@hint/utils-types';
import { FormatterOptions, HintResources, IFormatter } from 'hint';

import AnalysisResult, { CategoryResult, HintResult } from './result';

import { MarkdownHelpers, HeaderCount } from './utils';
import { getMessage as getMessageFormatter, MessageName } from './i18n.import';

/*
 * ------------------------------------------------------------------------------
 * Utils
 * ------------------------------------------------------------------------------
 */

const messagesFileName = 'messages.json';

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
    const rootPath = path.join(__dirname, '_locales');
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
        const file = path.join(rootPath, lang, messagesFileName);

        // fs.exists is deprecated so using the sync version instead.
        if (fs.existsSync(file)) { // eslint-disable-line no-sync
            existingLanguage = lang;
            break;
        }
    }

    const orig = path.join(rootPath, existingLanguage, messagesFileName);
    const dest = path.join(rootPath, messagesFileName);

    await fs.copyFile(orig, dest);
};

const removeLanguageFile = async () => {
    await fs.unlink(path.join(__dirname, '_locales', messagesFileName));
};

export default class MarkdownFormatter implements IFormatter {

    private language: string = '';

    private getMessage(key: MessageName, substitutions?: string | string[]) {
        return getMessageFormatter(key, this.language, substitutions);
    }

    public async format(problems: Problem[], options: FormatterOptions = {}) {

        this.language = options.language!;
        const target = options.target || '';
        const result = new AnalysisResult(target, options);
        const categoryList: string[] = getCategoryList(options.resources);

        categoryList.forEach((category) => {
            result.addCategory(category, this.language);
        });

        problems.forEach((message) => {
            result.addProblem(message, this.language);
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

                await createLanguageFile(this.language);

                const markdown = this.createMarkdown(result);

                await removeLanguageFile();

                // We save the result with the friendly target name
                const name = target.replace(/:\/\//g, '-')
                    .replace(/:/g, '-')
                    .replace(/\./g, '-')
                    .replace(/\//g, '-')
                    .replace(/[?=]/g, '-query-')
                    .replace(/-$/, '');

                const destDir = options.output || path.join(cwd(), 'hint-report');

                const destination = path.join(destDir, `${name}.md`);

                await fs.outputFile(destination, markdown);

                logger.log(getMessageFormatter('youCanView', this.language, destination));
            }

            return result;
        } catch (err) {
            logger.error(err);

            throw err;
        }
    }

    /**
     * Creates the markdown report of the webhint scan.
     * @param result The webhint scan result.
     */
    /* istanbul ignore next [too hard to test
        should create something similar to the example file:
        ./markdown-webhint-report.md]
    */
    private createMarkdown(result: AnalysisResult) {
        let markdown = '';

        markdown += MarkdownHelpers.createHeader(`Webhint Report - ${result.date}`, HeaderCount.Title);
        markdown += MarkdownHelpers.newLine;
        markdown += `${this.getMessage('hints')}: ${result.hintsCount}`;
        markdown += MarkdownHelpers.newLine;

        markdown += result.categories.map((category) => {
            let categoryInfo = '';

            categoryInfo += MarkdownHelpers.createHeader(category.name, HeaderCount.Category);
            categoryInfo += MarkdownHelpers.newLine;

            if (category.hints.length === 0) {
                categoryInfo += `\u2714 ${this.getMessage('noIssues')}`;
                categoryInfo += MarkdownHelpers.newLine;
            }

            categoryInfo += category.hints.map((hint) => {
                let hintInfo = '';

                hintInfo += MarkdownHelpers.createHeader(`${hint.name}: ${hint.count} hints`, HeaderCount.Hint);
                hintInfo += MarkdownHelpers.newLine;

                if (hint.problems.length > 0) {
                    hintInfo += MarkdownHelpers.getHintLevelSummary(hint.problems);
                    hintInfo += MarkdownHelpers.newLine;
                }

                if (hint.hasDoc) {
                    hintInfo += MarkdownHelpers.createLink(this.getMessage('whyIsThisImportant'), `https://webhint.io/docs/user-guide/hints/hint-${hint.name}/#why-is-this-important`);
                    hintInfo += MarkdownHelpers.newLine;
                    hintInfo += MarkdownHelpers.createLink(this.getMessage('howToFixIt'), `https://webhint.io/docs/user-guide/hints/hint-${hint.name}/#examples-that-pass-the-hint`);
                    hintInfo += MarkdownHelpers.newLine;
                }

                if (hint.thirdPartyInfo) {
                    hintInfo += MarkdownHelpers.createLink(`${this.getMessage('toLearnMore')} ${hint.thirdPartyInfo.logo.alt}`, hint.thirdPartyInfo.link);
                    hintInfo += MarkdownHelpers.newLine;
                }

                hintInfo += hint.problems.map((problem) => {
                    let problemInfo = '';

                    problemInfo += MarkdownHelpers.createHeader(`${MarkdownHelpers.getSeverityIcon(problem.severity)} **${Severity[problem.severity]}** - ${problem.message}`, HeaderCount.Message);
                    problemInfo += MarkdownHelpers.newLine;

                    problemInfo += `${problem.resource}:${problem.location.line}:${problem.location.column}`;
                    problemInfo += MarkdownHelpers.newLine;

                    if (problem.sourceCode) {
                        problemInfo += MarkdownHelpers.createCodeSnippet(problem.sourceCode, problem.codeLanguage);
                    }

                    return problemInfo;
                }).join(MarkdownHelpers.newLine);

                return hintInfo;
            }).join(MarkdownHelpers.newLine);

            return categoryInfo;
        }).join(MarkdownHelpers.newLine);

        markdown += MarkdownHelpers.horizontalRule;
        markdown += MarkdownHelpers.newLine;
        markdown += `Powered by ${MarkdownHelpers.createLink(
            `Webhint${result.version ? ` - ${result.version}` : ''}`,
            'https://webhint.io/')}`;

        return markdown;
    }
}
