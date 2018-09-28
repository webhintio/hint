import * as path from 'path';

import * as moment from 'moment';
import { cloneDeep } from 'lodash';

import { Severity, FormatterOptions } from 'hint/dist/src/lib/types';
import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import { Problem } from 'hint/dist/src/lib/types';

const thirdPartyServices = loadJSONFile(path.join(__dirname, 'configs', 'third-party-service-config.json'));
const categoryImages = loadJSONFile(path.join(__dirname, 'configs', 'category-images.json'));
const hintsWithoutDocs = ['optimize-image'];

/** Third party logo type. */
type ThirdPartyLogo = {
    name: string;
    url: string;
    alt: string;
};

/** Third party information. */
type ThirdPartyInfo = {
    logo: ThirdPartyLogo;
    link: string;
    details?: boolean;
};

/**
 * Represents information about a Hint.
 */
export class HintResult {
    /** Status of hint. */
    public status: string;
    /** Number of suggestions reported for this hint. */
    public count: number;
    /** Suggestions reported for this hint. */
    public problems: Array<Problem>;
    /** Name of the hint. */
    public name: string;
    /** Third party information (when apply). */
    public thirdPartyInfo: ThirdPartyInfo;
    /** Indicate if there is documentation for this hint. */
    public hasDoc: boolean;

    public constructor(name: string, status: string, url: string, isScanner: boolean) {
        this.problems = [];

        this.name = name;
        this.status = status;
        this.count = 0;

        this.thirdPartyInfo = thirdPartyServices[name] ? cloneDeep(thirdPartyServices[name]) : null;

        if (this.thirdPartyInfo) {
            this.thirdPartyInfo.link.replace(/%URL%/, url);
            if (!isScanner) {
                this.thirdPartyInfo.logo.url = this.thirdPartyInfo.logo.url.substr(1);
            }
        }

        this.hasDoc = !hintsWithoutDocs.includes(name);
    }

    /**
     * Add a new suggestion to the hint.
     * @param problem New suggestion.
     */
    public addProblem(problem: Problem) {
        this.problems.push(problem);
        this.count++;
    }
}

/**
 * Represents the information about a Category.
 */
export class CategoryResult {
    /** Number of suggestions in the category. */
    public hintsCount: number;
    /** Hints that have passed. */
    public passed: Array<HintResult>;
    /** Hints that don't passed. */
    public hints: Array<HintResult>;
    /** Category name. */
    public name: string;
    /** Category image. */
    public image: string;
    /** Category status. */
    public status: string;
    /** Cache HintResults. */
    private cache: Map<string, HintResult> = new Map();
    /** URL analyzed. */
    public url: string;
    /** Is the result generated for the online scanner. */
    private isScanner: boolean;

    public constructor(name: string, url: string, isScanner: boolean) {
        this.hints = [];
        this.passed = [];
        this.name = name;

        this.hintsCount = 0;

        this.image = categoryImages[name.toLowerCase()];
        this.isScanner = isScanner;

        if (this.image && !isScanner) {
            this.image = this.image.substr(1);
        }

        this.status = 'finished';
        this.url = url;
    }

    /**
     * Return a Hint given a name.
     * @param name Hint name to get.
     */
    public getHintByName(name: string): HintResult | undefined {
        const lowerCaseName = name.toLowerCase();
        let hint = this.cache.get(lowerCaseName);

        if (!hint) {
            hint = this.hints.find((hi: HintResult) => {
                return hi.name.toLowerCase() === lowerCaseName;
            });

            if (hint) {
                this.cache.set(lowerCaseName, hint);
            }
        }

        return hint;
    }

    /**
     * Add a new Hint given a name and the status.
     * @param name Hint name.
     * @param status Hint status.
     */
    public addHint(name: string, status: string): HintResult {
        let hint = this.getHintByName(name);

        if (hint) {
            return hint;
        }

        hint = new HintResult(name, status, this.url, this.isScanner);

        if (status === 'pass') {
            this.passed.push(hint);
        } else {
            this.hints.push(hint);
        }

        return hint;
    }

    /**
     * Add a new suggestion to the categoroy.
     * @param problem Hint suggestion.
     */
    public addProblem(problem: Problem) {
        const hintId = problem.hintId;

        let hint = this.getHintByName(hintId);

        if (!hint) {
            // All the problems have to have the same severity, so we just need to calculate the status once.
            const status = problem.severity === Severity.error ? 'error' : 'warning';

            hint = new HintResult(hintId, status, this.url, this.isScanner);

            this.hints.push(hint);
        }

        if (problem.severity === Severity.error || problem.severity === Severity.warning) {
            this.hintsCount++;
        }

        hint.addProblem(problem);
    }
}

/**
 * Represents the result of an analysis.
 */
export default class AnalysisResult {
    /** Number of suggestions. */
    public hintsCount: number;
    /** Scan time. */
    public scanTime: string;
    /** When the scan was started (started in the online scanner). */
    public timeStamp: string;
    /** webhint version. */
    public version?: string;
    /** Link to the result (online scanner). */
    public permalink: string;
    /** List of categories. */
    public categories: Array<CategoryResult>;
    /** URL analized. */
    public url: string;
    /** The analysis is finish. */
    public isFinish: boolean;
    /** Status of the analysis. */
    public status: string;
    /** Analysis id (mostly for the online scanner). */
    public id: string;
    /** If the results was generated in the online scanner. */
    public isScanner: boolean;
    /** Precentage of the analysis completed. */
    public percentage: number;
    /** Cache for CategorieResults. */
    private cache: Map<string, CategoryResult> = new Map();

    public constructor(target: string, options: FormatterOptions) {
        this.url = target;
        this.hintsCount = 0;
        this.status = options.status ? options.status : 'finished';
        // Question: Should we have this here or in webhint.io?
        this.isFinish = this.status === 'finished' || this.status === 'error';

        this.scanTime = this.parseScanTime(options.scanTime || 0);
        this.timeStamp = this.parseTimeStamp(options.timeStamp!);
        this.version = options.version;
        this.permalink = '';
        this.id = '';
        this.isScanner = !!options.isScanner;
        this.percentage = 0;

        this.categories = [];
    }

    /**
     * Add a 0 to a time string if needed.
     */
    private pad = (timeString: string): string => {
        return timeString && timeString.length === 1 ? `0${timeString}` : timeString;
    };

    /**
     * Return a string representing the time.
     * @param scanTime Time in milliseconds.
     */
    private parseScanTime(scanTime: number): string {
        const duration = moment.duration(scanTime);
        const minutes = this.pad(`${duration.get('minutes')}`);
        const seconds = this.pad(`${duration.get('seconds')}`);
        let time = `${minutes}:${seconds}`;

        if (duration.get('hours') > 0) {
            const hours = this.pad(`${duration.get('hours')}`);

            time = `${hours}:${time}`;
        }

        return time;
    }

    /**
     * Return the string of a time stamp.
     * @param timeStamp Time in milliseconds.
     */
    private parseTimeStamp(timeStamp: number): string {
        return moment(timeStamp).format('YYYY-MM-DD H:mm');
    }

    /**
     * Return a category given a name.
     * @param name Category name.
     */
    public getCategoryByName(name: string): CategoryResult | undefined {
        const lowerCaseName = name.toLowerCase();
        let category = this.cache.get(lowerCaseName);

        if (!category) {
            category = this.categories.find((cat: CategoryResult) => {
                return cat.name.toLowerCase() === lowerCaseName;
            });

            if (category) {
                this.cache.set(lowerCaseName, category);
            }
        }

        return category;
    }

    /**
     * Add a suggestion to the result.
     * @param problem New suggestion.
     */
    public addProblem(problem: Problem): void {
        const categoryName: string = problem.category;

        let category: CategoryResult | undefined = this.getCategoryByName(categoryName);

        if (!category) {
            category = new CategoryResult(categoryName, this.url, this.isScanner);

            this.categories.push(category);
        }

        if (problem.severity === Severity.error || problem.severity === Severity.warning) {
            this.hintsCount++;
        }

        category.addProblem(problem);
    }

    /**
     * Add a new category to the result.
     * @param categoryName Category name.
     */
    public addCategory(categoryName: string): void {
        let category = this.getCategoryByName(categoryName);

        if (category) {
            return;
        }

        category = new CategoryResult(categoryName, this.url, this.isScanner);

        this.categories.push(category);
    }

    /**
     * Remove a category from the results.
     * @param categoryName Category name.
     */
    public removeCategory(categoryName: string): void {
        const name = categoryName.toLowerCase();

        const category = this.getCategoryByName(name);

        if (category) {
            this.hintsCount -= category.hintsCount;

            const index = this.categories.indexOf(category);

            this.categories.splice(index, 1);

            this.cache.delete(name);
        }
    }
}
