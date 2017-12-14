/**
 * @fileoverview The most basic formatter, it just stringifyes whatever object
 * is passed to it.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import * as _ from 'lodash';
import * as Handlebars from 'handlebars';

import { debug as d } from '../../utils/debug';
import * as logger from '../../utils/logging';
import { IFormatter, IProblem, Severity } from '../../types'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

type Issues = {
    issues: Array<IProblem>,
    ruleId: string
};

type ResourceProblemData = { // eslint-disable-line no-unused-vars
    resource: string,
    totalErrors: number,
    totalWarnings: number,
    ruleIds: Array<Issues>
};

// Convert object to an key-value pair array.
const transformToArray = (obj: { [key: string]: any }): Array<Issues> => {
    return _.map(obj, (value, key) => {
        return {
            issues: value,
            ruleId: key
        };
    });
};

const generateTimeStamp = (): string => {
    const t = new Date();

    return `${t.getMonth()}-${t.getDate()}-${t.getFullYear()}_${t.getHours()}-${t.getMinutes()}-${t.getSeconds()}`;
};

const writeReport = async (reportFolderPath: string, content: string): Promise<void> => {
    try {
        await util.promisify(fs.stat)(reportFolderPath);
    } catch (err) {
        // File path doesn't exist, create a new folder.
        await util.promisify(fs.mkdir)(reportFolderPath);

        logger.log(`New folder was created to save the reports: ${reportFolderPath}`);
    }

    const timeStamp: string = generateTimeStamp();

    await util.promisify(fs.writeFile)(path.join(reportFolderPath, `${timeStamp}.html`), content, 'utf8');

    logger.log(`The html report was generated and saved as ${timeStamp}.html`);
};

Handlebars.registerHelper('getSeverityClass', (severity: number): string => {
    return Severity.error === severity ? 'error' : 'warning';
});

const processData = (resources: _.Dictionary<Array<IProblem>>): Array<ResourceProblemData> => {
    debug('Processing data');

    return _.map(resources, (issues: Array<IProblem>, resource: string): ResourceProblemData => {
        let totalErrors: number = 0;
        let totalWarnings: number = 0;

        _.forEach(issues, (issue: IProblem): void => {
            if (issue.location && issue.location.column === -1 && issue.location.line === -1) {
                issue.location = null;
            }

            if (issue.severity === Severity.error) {
                totalErrors += 1;
            } else {
                totalWarnings += 1;
            }
        });

        return {
            resource,
            // Convert to array to suit the use in Handlebars.
            ruleIds: transformToArray(_.groupBy(issues, 'ruleId')),
            totalErrors,
            totalWarnings
        };
    });
};

// ------------------------------------------------------------------------------
// Formatter
// ------------------------------------------------------------------------------

const formatter: IFormatter = {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    async format(messages: Array<IProblem>) {

        debug('Formatting results');

        const resources: _.Dictionary<Array<IProblem>> = _.groupBy(messages, 'resource');
        const templatePath: string = path.join(__dirname, 'report.hbs');
        const reportFolderPath: string = path.join(process.cwd(), 'reports');

        let templateContent: string;

        try {
            debug('Reading template');
            templateContent = await util.promisify(fs.readFile)(templatePath, 'utf8');
        } catch (err) {
            debug(`Error reading template: ${templatePath}`);
            throw (err);
        }

        const template: HandlebarsTemplateDelegate<any> = Handlebars.compile(templateContent);
        const html: string = template({ resources: processData(resources) });

        try {
            await writeReport(reportFolderPath, html);
        } catch (err) {
            debug('Error writing the html report', err);
        }
    }
};

export default formatter;
