import * as fs from 'fs';
import * as request from 'request';
import * as stripBom from 'strip-bom';

/** Convenience wrapper for synchronously reading file contents. */
export const readFile = (filePath: string): string => {
    return stripBom(fs.readFileSync(filePath, 'utf8')); // eslint-disable-line no-sync
};

/** Convenience wrapper for asynchronously requesting a page. */
export const getPage = (target) => {
    return new Promise(async (resolve, reject) => {
        request(target, async (err, response) => {
            if (err) {
                reject(err);

                return;
            }

            resolve(response);
        });
    });
};
