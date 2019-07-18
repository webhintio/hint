/**
 * @fileoverview A hint formatter that outputs the issues in an Excel file
 * (xlsx).
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as path from 'path';

import * as Excel from 'exceljs';
import forEach = require('lodash/forEach');
import groupBy = require('lodash/groupBy');
import sortBy = require('lodash/sortBy');

import { debug as d, fs, logger } from '@hint/utils';
import { FormatterOptions, IFormatter, Problem } from 'hint';

import { getMessage } from './i18n.import';

const _ = {
    forEach,
    groupBy,
    sortBy
};
const debug = d(__filename);
const { cwd } = fs;
const startRow = 5;

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

export default class ExcelFormatter implements IFormatter {
    public async format(messages: Problem[], options: FormatterOptions = {}) {
        if (messages.length === 0) {
            return;
        }

        const language = options.language!;
        const target = options.target || '';
        const resources: _.Dictionary<Problem[]> = _.groupBy(messages, 'resource');
        const workbook = new Excel.Workbook();
        const sortedResources = _.sortBy(Object.keys(resources));

        // Styles for the cells
        const bold = { font: { bold: true } };
        const mediumBorder = { style: 'medium' };
        const border = {
            border: {
                bottom: mediumBorder,
                left: mediumBorder,
                right: mediumBorder,
                top: mediumBorder
            }
        };
        const rightAlign = { align: { horizontal: 'right' } };
        const tableHeader = Object.assign({
            fill: {
                fgColor: { argb: 'FF000000' },
                pattern: 'solid',
                type: 'pattern'
            },
            font: {
                bold: true,
                color: { argb: 'FFFFFFFF' }
            }
        }, border);

        const names: Map<string, string> = new Map();
        /**
         * Replaces `://`, `/`, `.` for `-` so the names are compatible with the sheets
         */
        const getName = (name: string) => {
            if (names.has(name)) {
                return names.get(name);
            }

            const finalName = getMessage('resourceName', language, names.size.toString());

            names.set(name, finalName);

            return finalName;
        };

        /** Applies all the given properties to `cell`. */
        const applyToCell = (cell: Excel.Cell, ...properties: any[]) => {
            Object.assign(cell, ...properties);
        };

        /** Creates a new sheet with the report for the given resource. */
        const processResource = (msgs: Problem[], resource: string) => {
            const sortedMessages: Problem[] = _.sortBy(msgs, 'hintId');
            const name = getName(resource);
            const sheet = workbook.addWorksheet(name);
            let counter = startRow;

            sheet.getColumn('E').width = 25;
            sheet.getColumn('F').width = 150;

            applyToCell(
                sheet.getCell(`E${counter}`),
                { value: resource },
                bold);

            counter += 2;

            applyToCell(
                sheet.getCell(`E${counter}`),
                { value: getMessage('hintId', language)},
                tableHeader);
            applyToCell(
                sheet.getCell(`F${counter}`),
                { value: getMessage('issue', language) },
                tableHeader);
            counter++;

            _.forEach(sortedMessages, (problem) => {
                applyToCell(
                    sheet.getCell(`E${counter}`),
                    {
                        value: {
                            hyperlink: `https://webhint.io/docs/user-guide/hints/hint-${problem.hintId}/`,
                            text: problem.hintId
                        }
                    },
                    border);
                applyToCell(
                    sheet.getCell(`F${counter}`),
                    { value: problem.message },
                    border);
                counter++;
            });
        };

        /** Creates the summary sheet with the list of resources with issues. */
        const createSummary = (resourcesList: string[], scannedUrl: string) => {
            const sheet = workbook.addWorksheet(getMessage('summary', language));
            let counter = startRow;

            sheet.getColumn('E').width = 50;
            sheet.getColumn('F').width = 20;

            // Title of the sheet
            applyToCell(
                sheet.getCell(`E${counter}`),
                { value: getMessage('summaryFor', language, scannedUrl) },
                bold);
            counter += 2;

            // Header with summary
            applyToCell(
                sheet.getCell(`E${counter}`),
                { value: getMessage('resourceUrl', language) },
                tableHeader);
            applyToCell(
                sheet.getCell(`F${counter}`),
                { value: getMessage('numberOfIssues', language) },
                rightAlign,
                tableHeader);
            counter++;

            _.forEach(resourcesList, (resource) => {
                const resourceShortName = getName(resource);

                applyToCell(
                    sheet.getCell(`E${counter}`),
                    {
                        value: {
                            hyperlink: `#'${resourceShortName}'!A1`,
                            text: resource
                        }
                    },
                    border);

                applyToCell(
                    sheet.getCell(`F${counter}`),
                    { value: resources[resource].length },
                    border);

                counter++;
            });
        };

        debug('Formatting results');

        createSummary(sortedResources, target);

        _.forEach(sortedResources, (resourceName) => {
            processResource(resources[resourceName], resourceName);
        });

        try {
            // We save the file with the friendly target name
            const name = target.replace(/:\/\//g, '-')
                .replace(/:/g, '-')
                .replace(/\./g, '-')
                .replace(/\//g, '-')
                .replace(/-$/, '');

            const fileName = options.output || path.resolve(cwd(), `${name}.xlsx`);

            await workbook.xlsx.writeFile(fileName);
        } catch (e) {
            /* istanbul ignore next */
            { // eslint-disable-line
                logger.error(getMessage('errorSaving', language));

                if (e.message.includes('EBUSY')) {
                    logger.error(getMessage('maybeIsOpened', language));
                }
            }
        }
    }
}
