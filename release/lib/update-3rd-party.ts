import * as path from 'path';
import { promisify } from 'util';
import * as req from 'request';
import { debug, execa, updateFile } from './utils';
import { Subscriber, Observable } from 'rxjs';
import { Context } from '../@types/custom';

const request = promisify(req) as (options: req.OptionsWithUrl) => Promise<req.Response>;

const downloadFile = async (downloadURL: string, downloadLocation: string) => {
    const res = await request({ url: downloadURL }) as req.Response;

    if (res.body.message) {
        throw new Error(res.body.message);
    }

    await updateFile(downloadLocation, res.body);

    await execa('git reset HEAD');
    await execa(`git add ${downloadLocation}`);

    try {
        // https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---exit-code
        const results = await execa(`git diff --cached --exit-code --quiet "${downloadLocation}"`);

        debug(results.stdout);
    } catch (e) {
        // There are changes to commit
        await execa(`git commit -m "Update: '${path.basename(downloadLocation)}'"`);
    }
};

const resources = new Map([
    ['packages/hint-performance-budget/src/connections.ini', 'https://raw.githubusercontent.com/WPO-Foundation/webpagetest/master/www/settings/connectivity.ini.sample'],
    ['packages/hint-no-vulnerable-javascript-libraries/src/snyk-snapshot.json', 'https://snyk.io/partners/api/v2/vulndb/clientside.json'],
    ['packages/parser-typescript-config/src/schema.json', 'http://json.schemastore.org/tsconfig'],
    ['packages/hint-amp-validator/src/validator', 'https://cdn.ampproject.org/v0/validator.js']
]);

const updateEverything = async (observer: Subscriber<{}>, ctx: Context) => {
    for (const [route, uri] of resources) {
        const message = `Updating ${route}`;

        debug(message);
        observer.next(message);

        try {
            await downloadFile(uri, path.normalize(route));
        } catch (e) {
            ctx.error = e;

            debug(`Error downloading ${uri}`);
            debug(JSON.stringify(ctx.error, Object.getOwnPropertyNames(ctx.error), 2));

            return observer.error(e);
        }
    }

    return observer.complete();
};

export const updateThirdPartyResources = (ctx: Context) => {
    return new Observable((observer) => {
        updateEverything(observer, ctx);
    });
};
