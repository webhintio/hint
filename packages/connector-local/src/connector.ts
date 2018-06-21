/**
 * @fileoverview Connector for local development. It reads recursively
 * the contents of a folder and sends events for each one of the files
 * found.
 * It currently only sends `fetch::end::*` events.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as url from 'url';
import * as path from 'path';

import * as chokidar from 'chokidar';
import * as globby from 'globby';
import * as fs from 'fs-extra';

import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { getAsUri } from 'sonarwhal/dist/src/lib/utils/get-as-uri';
import { getAsPathString } from 'sonarwhal/dist/src/lib/utils/get-as-path-string';
import { getContentTypeData, isTextMediaType, getType } from 'sonarwhal/dist/src/lib/utils/content-type';
import { isFile, readFileAsync } from 'sonarwhal/dist/src/lib/utils/misc';
import * as logger from 'sonarwhal/dist/src/lib/utils/logging';

import {
    IConnector,
    Event, FetchEnd, ScanEnd, NetworkData
} from 'sonarwhal/dist/src/lib/types';
import { Sonarwhal } from 'sonarwhal/dist/src/lib/sonarwhal';

/*
 * ------------------------------------------------------------------------------
 * Defaults
 * ------------------------------------------------------------------------------
 */

const debug: debug.IDebugger = d(__filename);

const defaultOptions = {};

export default class LocalConnector implements IConnector {
    private _options: any;
    private sonarwhal: Sonarwhal;
    private _href: string = '';
    private filesPattern: Array<string>;
    private watcher: chokidar.FSWatcher = null;

    public constructor(sonarwhal: Sonarwhal, config: object) {
        this._options = Object.assign({}, defaultOptions, config);
        this.filesPattern = this.getFilesPattern();
        this.sonarwhal = sonarwhal;
    }

    /*
     * ------------------------------------------------------------------------------
     * Private methods
     * ------------------------------------------------------------------------------
     */
    private getFilesPattern(): Array<string> {
        const pattern = this._options.pattern;

        if (!pattern) {
            /*
             * Ignore .git by default, other common folders as
             * node_modules are usually in the .gitignore file and
             * we are using it to ignore them.
             */
            return ['**', '!.git/**'];
        }

        /* istanbul ignore next */
        if (Array.isArray(pattern)) {
            return pattern.length > 0 ? pattern : [];
        }

        /* istanbul ignore next */
        return [pattern];
    }

    private async fetch(target: string) {
        /*
         * target can have one of these forms:
         *   - /path/to/file
         *   - C:/path/to/file
         *   - file:///path/to/file
         *   - file:///C:/path/to/file
         *
         * That's why we need to parse it to an URL
         * and then get the path string.
         */
        const uri: url.URL = getAsUri(target);
        const filePath: string = getAsPathString(uri);
        const content: NetworkData = await this.fetchContent(filePath);
        const event: FetchEnd = {
            element: null,
            request: content.request,
            resource: url.format(getAsUri(filePath)),
            response: content.response
        };
        const type = getType(event.response.mediaType);

        await this.sonarwhal.emitAsync(`fetch::end::${type}`, event);
    }

    private getGitIgnore = async () => {
        try {
            const rawList = await readFileAsync(path.join(process.cwd(), '.gitignore'));
            const splitList = rawList.split('\n');

            const result = splitList.reduce((total: Array<string>, ignore: string) => {
                const value: string = ignore.trim();

                /* istanbul ignore if */
                if (!value) {
                    return total;
                }

                /* istanbul ignore if */
                if (value[0] === '/') {
                    total.push(value.substr(1));
                } else {
                    total.push(value);
                }

                return total;
            }, []);

            return result;
        } catch (err) {
            logger.error('Error reading .gitignore');

            return [];
        }
    }

    private async notify() {
        const href: string = this._href;
        const scanEndEvent: ScanEnd = { resource: href };

        await this.sonarwhal.emitAsync('scan::end', scanEndEvent);
        await this.sonarwhal.notify();

        logger.log('Watching for file changes.');
    }

    private watch(targetString: string) {
        return new Promise(async (resolve, reject) => {
            const isF = isFile(targetString);
            /* istanbul ignore next */
            const target = isF ? targetString : '.';
            const ignored = await this.getGitIgnore();

            this.watcher = chokidar.watch(target, {
                /* istanbul ignore next */
                cwd: !isF ? targetString : null,
                ignored: ignored.concat(['.git/']),
                ignoreInitial: true,
                /*
                 * If you are using vscode and create and remove a folder
                 * from the editor, an EPERM error is thrown.
                 * This option avoid that error.
                 */
                ignorePermissionErrors: true
            });

            const getFile = (filePath: string): string => {
                /* istanbul ignore if */
                if (isF) {
                    return filePath;
                }

                /* istanbul ignore else */
                if (path.isAbsolute(filePath)) {
                    return filePath;
                }

                return path.join(targetString, filePath);
            };

            const onAdd = async (filePath: string) => {
                const file = getFile(filePath);

                // TODO: Remove this log or change the message
                logger.log(`File ${file} added`);

                await this.fetch(file);
                await this.notify();
            };

            const onChange = async (filePath: string) => {
                const file: string = getFile(filePath);
                const fileUrl = getAsUri(file);

                logger.log(`File ${file} changeg`);
                // TODO: Manipulate the report if the file already have messages in the report.
                this.sonarwhal.clean(fileUrl);
                await this.fetch(file);
                await this.notify();
            };

            const onUnlink = async (filePath: string) => {
                const file: string = getFile(filePath);
                const fileUrl = getAsUri(file);

                this.sonarwhal.clean(fileUrl);
                // TODO: Do anything when a file is removed? Maybe check the current report and remove messages related to that file.
                logger.log('onUnlink');

                await this.notify();
            };

            const onReady = async () => {
                await this.notify();
            };

            const onError = (err: any) => {
                logger.error('error', err);

                reject(err);
            };

            this.watcher
                .on('add', onAdd.bind(this))
                .on('change', onChange.bind(this))
                .on('unlink', onUnlink.bind(this))
                .on('error', onError)
                .on('ready', onReady);

            // Close the watcher after press Ctrl + C
            process.once('SIGINT', () => {
                this.watcher.close();
                this.sonarwhal.clear();
                resolve();
            });
        });
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    public async fetchContent(filePath: string): Promise<NetworkData> {
        const rawContent = await fs.readFile(filePath);
        const contentType = getContentTypeData(null, filePath, null, rawContent);
        let content = '';

        if (isTextMediaType(contentType.mediaType)) {
            content = rawContent.toString(contentType.charset);
        }

        // Need to do some magic to create a fetch::end::*
        return {
            request: {} as Request,
            response: {
                body: {
                    content,
                    rawContent,
                    rawResponse() {
                        /* istanbul ignore next */
                        return Promise.resolve(rawContent);
                    }
                },
                charset: contentType.charset,
                headers: {},
                hops: [],
                mediaType: contentType.mediaType,
                statusCode: 200,
                url: filePath
            }
        };
    }

    public async collect(target: url.URL) {
        /** The target in string format */
        const href: string = this._href = target.href;
        const initialEvent: Event = { resource: href };

        this.sonarwhal.emitAsync('scan::start', initialEvent);

        const pathString = getAsPathString(target);
        let files;

        if (isFile(pathString)) {
            await this.sonarwhal.emitAsync('fetch::start::target', initialEvent);
            files = [pathString];
        } else {
            // TODO: the current @types/globby doesn't support gitignore. Remove "as any" when possible
            files = await globby(this.filesPattern, ({
                absolute: true,
                cwd: pathString,
                dot: true,
                gitignore: true
            } as any));
        }

        await Promise.all(files.map(this.fetch.bind(this)));

        if (this._options.watch) {
            await this.watch(pathString);
        } else {
            await this.sonarwhal.emitAsync('scan::end', initialEvent);
        }
    }

    /* istanbul ignore next */
    public close() {
        return Promise.resolve();
    }
}
