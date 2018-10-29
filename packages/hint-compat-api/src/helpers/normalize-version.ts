import { padStart, padEnd } from 'lodash';

// Normalize versions because https://github.com/mdn/browser-compat-data/pull/2690#issuecomment-417237045
class BrowserVersions {
    private columnSeparator = '.';
    private charForPad = '0';
    private itemsInColum = 2; // Assuming that worst case is xx.xx.xx
    private columns = 3;
    private itemsInColumns = this.itemsInColum * this.columns;

    public normalize(browserVersion: string): number {
        const result = browserVersion.split(this.columnSeparator).map(column => {
            return padStart(column, this.itemsInColum, this.charForPad);
        }).join('');

        return Number(padEnd(result, this.itemsInColumns, this.charForPad))
    }

    public deNormalize(normalizedVersion: number): string {
        const normalizedVersionString = padStart(normalizedVersion + '', this.itemsInColumns, this.charForPad);
        const columns = normalizedVersionString.match(/..?/g);

        if (!columns) {
            throw new Error(`Value ${normalizedVersion} is not allowed to be denormalized.`);
        }

        let realNumbers: number[] = [];
        let foundNumberGreaterThanZero = false;
        columns.reverse().forEach(items => {
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
