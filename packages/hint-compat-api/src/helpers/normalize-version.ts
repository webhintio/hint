/**
 * @fileoverview Helper to work with versions and normalize it because versions sometimes are numbers and sometime not.
 */

import { padStart, padEnd } from 'lodash';

/* Normalize versions because https://github.com/mdn/browser-compat-data/pull/2690#issuecomment-417237045
 * 52 normalizes into 520000
 * 52.12 normalizes into 521200
 * 52.12.1 normalizes into 521201
 * 52.1.10 normalizes into 520110
 * 5.1.10 normalizes into 50110
 */
class BrowserVersions {
    private columnSeparator = '.';
    private charForPad = '0';
    private itemsInColum = 2; // Assuming that worst case is xx.xx.xx
    private itemsInColumns = 6;

    public normalize(browserVersion: string): number {
        const result = browserVersion.split(this.columnSeparator).map((column) => {
            return padStart(column, this.itemsInColum, this.charForPad);
        })
            .join('');

        return Number(padEnd(result, this.itemsInColumns, this.charForPad));
    }

    public deNormalize(normalizedVersion: number): string {
        const normalizedVersionString = padStart(`${normalizedVersion}`, this.itemsInColumns, this.charForPad);
        const columns = normalizedVersionString.match(/..?/g);

        if (!columns) {
            throw new Error(`Value ${normalizedVersion} is not allowed to be denormalized.`);
        }

        const realNumbers: number[] = [];
        let foundNumberGreaterThanZero = false;

        columns.reverse().forEach((items) => {
            const converted = Number(items);

            if (converted === 0 && !foundNumberGreaterThanZero) {
                return;
            }

            if (converted > 0) {
                foundNumberGreaterThanZero = true;
            }

            realNumbers.push(converted);
        });

        return realNumbers.reverse().join('.');
    }
}

export const browserVersions = new BrowserVersions();
