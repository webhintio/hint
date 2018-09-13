import * as path from 'path';

import * as moment from 'moment';
import { cloneDeep } from 'lodash';

import { Severity, FormatterOptions } from 'hint/dist/src/lib/types';
import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';
import { Problem } from 'hint/dist/src/lib/types';

const thirdPartyServices = loadJSONFile(path.join(__dirname, 'configs', 'third-party-service-config.json'));
const categoryImages = loadJSONFile(path.join(__dirname, 'configs', 'category-images.json'));
const hintsWithoutDocs = ['optimize-image'];

type ThirdPartyLogo = {
    name: string;
    url: string;
    alt: string;
};
type ThirdPartyInfo = {
    logo: ThirdPartyLogo;
    link: string;
    details?: boolean;
};

export class HintResult {
    public status: string;
    public count: number;
    public problems: Array<Problem>;
    public name: string;
    public thirdPartyInfo: ThirdPartyInfo;
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

    public addProblem(problem: Problem) {
        this.problems.push(problem);
        this.count++;
    }
}

export class CategoryResult {
    public hintsCount: number;
    public passed: Array<HintResult>;
    public hints: Array<HintResult>;
    public name: string;
    public image: string;
    public status: string;
    private cache: Map<string, HintResult> = new Map();
    public url: string;
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

export default class AnalysisResult {
    public hintsCount: number;
    public scanTime: string;
    public timeStamp: string;
    public version?: string;
    public permalink: string;
    public categories: Array<CategoryResult>;
    public url: string;
    public isFinish: boolean;
    public status: string;
    public id: string;
    public isScanner: boolean;
    public percentage: number;
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

    private pad = (timeString: string): string => {
        return timeString && timeString.length === 1 ? `0${timeString}` : timeString;
    };

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

    private parseTimeStamp(timeStamp: number): string {
        return moment(timeStamp).format('YYYY-MM-DD H:mm');
    }

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

    public addCategory(categoryName: string): void {
        let category = this.getCategoryByName(categoryName);

        if (category) {
            return;
        }

        category = new CategoryResult(categoryName, this.url, this.isScanner);

        this.categories.push(category);
    }

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
