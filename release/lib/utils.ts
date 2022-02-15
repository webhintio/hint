import * as path from 'path';

import * as execasync from 'execa';
import * as fs from 'fs-extra';
import pRetry from 'p-retry';

import { Package, Context } from '../@types/custom';
import { ListrTaskWrapper } from 'listr';
import { Observable, Subscriber } from 'rxjs';

export const logFilename = `release.log`;
export const REPOSITORY_SLUG = 'webhintio/hint';
export const REPOSITORY_URL = `https://github.com/${REPOSITORY_SLUG}`;

/**
 * The output stream to `release.log`
 */
// TODO: We should wait for the 'open' event to be sure everything is fine
const debugStream = fs.createWriteStream(path.join(process.cwd(), logFilename));

/**
 * A helper to write into the stream and forget
 * @param content The string to output
 */
const debug = (content: string) => {

    debugStream.write(`${content}\n`, (err) => {
        if (err) {
            console.error(err);
        }
    });
};

export {
    debug,
    debugStream
};

export const updatePkgJson = (pkg: Package) => {
    return fs.writeFile(pkg.path, `${JSON.stringify(pkg.content, null, 2)}\n`, 'utf-8');
};

export const readFile = (filePath: string) => {
    return fs.readFile(filePath, 'utf-8');
};

const TEST_RETRIES = 3;

/** Execute a `command` retrying if `exitCode` is different than 0. */
export const execWithRetry = (command: string, options?: execasync.Options) => {
    const fn = () => {
        debug(`${options && options.cwd ? options.cwd : process.cwd()}${path.sep}${command}`);

        const args = command.split(' ');
        const program = args.shift()!;

        return execasync(program, args, {
            ...options,
            ...{ stdio: [null, debugStream, debugStream] }
        } as execasync.Options);
    };

    return pRetry(fn, {
        onFailedAttempt: (error) => {
            debug(`Failed executing "${command}". Retries left: ${error.retriesLeft}.`);
        },
        retries: TEST_RETRIES
    });
};

/**
 * Groups all string arguments into a single one. E.g.:
 * ```js
 * ['-m', '"Upgrade:', 'to', 'latest', 'version"'] --> ['-m', '"Upgrade: to latest version"']`
 * ```
 * @param args The arguments
 */
const groupArgs = (args: string[]) => {
    let isStringArgument = false;
    const newArgs: string[] = args.reduce((acum: string[], current) => {

        if (isStringArgument) {
            const last = acum[acum.length - 1];

            acum[acum.length - 1] = `${last} ${current}`.replace(/"/g, '');

            if (current.endsWith('"')) {
                isStringArgument = false;
            }

            return acum;
        }

        if (current.startsWith('"')) {

            /**
             * Argument is split. I.e.: `['"part1', 'part2"'];`
             */
            if (!current.endsWith('"')) {
                isStringArgument = true;

                acum.push(current);

                return acum;
            }

            /**
             * Argument is surrounded by "" that need to be removed.
             * We just remove all the quotes because we don't escape any in our commands
             */
            acum.push(current.replace(/"/g, ''));

            return acum;
        }

        acum.push(current);

        return acum;
    }, []);

    return newArgs;
};

/**
 *  Wrapper around the package `execa` that outputs the command into the log.
 */
export const execa = (command: string, options?: execasync.Options) => {
    debug(`${options && options.cwd ? options.cwd : process.cwd()}${path.sep}${command}`);

    const args = command.split(' ');
    const program = args.shift()!;

    return execasync(program, groupArgs(args), options);
};

type CustomTask = (ctx: any, task: ListrTaskWrapper) => Promise<any> | any;

export const taskErrorWrapper = (f: CustomTask) => {
    return (ctx: Context, task: ListrTaskWrapper) => {
        let result: any;

        try {
            result = f(ctx, task);
        } catch (error) {
            ctx.error = error as Error;

            throw error;
        }

        if (result && result.then) {
            result.catch((error: Error) => {
                ctx.error = error;
            });
        }

        return result;
    };
};

/**
 * Iterates over all the packages and executes the given action on each one.
 *
 * @param action The action to perform for each package. The parameters for
 * the action are the `Package` and the `Subscriber` to report progress in the
 * UI.
 */
export const packageTask = (action: (pkg: Package, observable: Subscriber<{}>, ctx: Context) => Promise<void>) => {
    const packageTaskWrapper = async (packages: Map<string, Package>, observable: Subscriber<{}>, ctx: Context, task: ListrTaskWrapper) => {
        for (const [, pkg] of packages) {
            try {
                await action(pkg, observable, ctx);
            } catch (e) {
                ctx.error = e as Error;

                debug(`Error executing task "${task.title}" for "${pkg.name}"`);
                debug(JSON.stringify(ctx.error, Object.getOwnPropertyNames(ctx.error), 2));

                return observable.error(e);
            }
        }

        debug(`Finishing "${task.title}"`);

        return observable.complete();
    };

    const task = (ctx: Context, task: ListrTaskWrapper) => {
        return new Observable((observer) => {
            debug(`Starting "${task.title}"`);
            const { packages } = ctx;

            packageTaskWrapper(packages, observer, ctx, task);
        });
    };

    return task;
};
