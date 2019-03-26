import * as path from 'path';
import { URL } from 'url';

import { Configuration } from './config';
import {
    AnalyzerError,
    AnalyzeOptions,
    CreateAnalyzerOptions,
    FormatterOptions,
    HintResources,
    IFormatter,
    Problem,
    Target,
    UserConfig,
    Endpoint,
    AnalyzerResult
} from './types';
import { Engine } from './engine';
import { AnalyzerErrorStatus } from './enums/error-status';
import { IFormatterConstructor } from './types/formatters';
import { loadResources } from './utils/resource-loader';

import { fs, logger, misc } from '@hint/utils';

const { cutString } = misc;
const { cwd, isFile } = fs;

const initFormatters = (formatters: IFormatterConstructor[]): IFormatter[] => {
    const result = formatters.map((FormatterConstructor) => {
        return new FormatterConstructor();
    });

    return result;
};

const validateResources = (resources: HintResources) => {
    if (resources.missing.length > 0 || resources.incompatible.length > 0) {
        throw new AnalyzerError('Missing or incompatible dependencies', AnalyzerErrorStatus.ResourceError, resources);
    }
};

const validateHints = (configuration: Configuration) => {
    const hintsValidation = Configuration.validateHintsConfig(configuration);

    if (hintsValidation.invalid.length > 0) {
        throw new AnalyzerError('Invalid Hints', AnalyzerErrorStatus.HintError, hintsValidation.invalid);
    }
};

/**
 * Node API.
 */
export class Analyzer {
    private configuration: Configuration;
    private _resources: HintResources;
    private formatters: IFormatter[];
    private watch: boolean | undefined;
    private messages: { [name: string]: string } = {
        'fetch::end': '%url% downloaded',
        'fetch::start': 'Downloading %url%',
        'scan::end': 'Finishing...',
        'scan::start': 'Analyzing %url%',
        'traverse::down': 'Traversing the DOM',
        'traverse::end': 'Traversing finished',
        'traverse::start': 'Traversing the DOM',
        'traverse::up': 'Traversing the DOM'
    }

    private constructor(configuration: Configuration, resources: HintResources, formatters: IFormatter[]) {
        this.configuration = configuration;
        this._resources = resources;
        this.formatters = formatters;
        this.watch = this.configuration.connector && this.configuration.connector.options && this.configuration.connector.options.watch;
    }

    /**
     * Validates a configuration and return an Analyzer object.
     * @param userConfiguration User configuration to load.
     * @param options Options used to initialize the configuration.
     */
    public static create(userConfiguration: UserConfig, options: CreateAnalyzerOptions = {}) {
        let configuration: Configuration;

        if (!userConfiguration) {
            throw new AnalyzerError('Missed configuration', AnalyzerErrorStatus.ConfigurationError);
        }

        try {
            configuration = Configuration.fromConfig(userConfiguration, options);
        } catch (e) {
            throw new AnalyzerError('Invalid configuration', AnalyzerErrorStatus.ConfigurationError);
        }

        const resources = loadResources(configuration!);
        const formatters = initFormatters(resources.formatters);

        validateResources(resources);
        validateHints(configuration);

        return new Analyzer(configuration, resources, formatters);
    }

    /**
     * Get the configuration file in a given directory.
     * @param filePath Config file or directory where to look for the config file.
     */
    public static getUserConfig(filePath?: string): UserConfig | null {
        const isDirectory = !isFile(filePath);
        const configPath = isDirectory ? Configuration.getFilenameForDirectory(filePath || cwd()) : filePath;

        if (!configPath) {
            return null;
        }

        try {
            const resolvedPath = path.resolve(isDirectory ? (filePath || cwd()) : cwd(), configPath);

            return Configuration.loadConfigFile(resolvedPath);
        } catch {
            return null;
        }
    }

    /**
     * Normalize a given url.
     * @param {string | URL | Target} inputUrl URL to convert.
     */
    private normalizeTarget(inputUrl: string | URL | Target): Target {
        if ((inputUrl as Target).url) {
            const target = (inputUrl as Target);
            const url = target.url instanceof URL ? target.url : new URL(target.url as string);

            return {
                content: target.content,
                url
            };
        }

        const url = inputUrl instanceof URL ? inputUrl : new URL(inputUrl as string);

        return {
            content: undefined,
            url
        };
    }

    /**
     * Normalize a given event.
     * @param {string} event Event to normalize.
     */
    private normalizeEvent(event: string) {
        if (event.startsWith('fetch::end')) {
            return 'fetch::end';
        }

        return event;
    }

    /**
     * Configure an engine.
     * @param {Engine} engine Engine to configure.
     * @param {string} url URL that is going to be analyzed.
     * @param {AnalyzeOptions} options Options to configure the analysis.
     */
    private configureEngine(engine: Engine, url: string, options: AnalyzeOptions) {
        if (options.updateCallback) {
            engine.prependAny(((event: string, value: { resource: string }) => {
                const message = this.messages[this.normalizeEvent(event)];

                if (!message) {
                    return;
                }

                options.updateCallback!({
                    message: message.replace('%url%', cutString(value.resource)),
                    resource: value.resource,
                    url
                });
            }) as import('eventemitter2').EventAndListener);
        }

        if (this.watch) {
            engine.on('print', async (event) => {
                await this.format(event.problems);
            });
        }
    }

    /**
     * Analyze the given URL(s).
     * @param {Endpoint} endpoints Endpoint(s) to analyze.
     * @param options Options to configure the analysis.
     */
    public async analyze(endpoints: Endpoint | Endpoint[], options: AnalyzeOptions = {}): Promise<AnalyzerResult[]> {
        let targets: Target[];
        const results: AnalyzerResult[] = [];

        if (Array.isArray(endpoints)) {
            targets = endpoints.map(this.normalizeTarget);
        } else {
            targets = [this.normalizeTarget(endpoints)];
        }

        // TODO: Allow parallelism, indicating the number of simultaneous targets (open an issue for this).
        for (const target of targets) {
            const url = target.url as URL;

            if (target.content && this.configuration.connector!.name !== 'local') {
                throw new AnalyzerError(`Property 'content' is only supported in formatter local. Webhint will analyze the url ${url.href}`, AnalyzerErrorStatus.AnalyzeError);
            }

            const engine = new Engine(this.configuration, this._resources);

            this.configureEngine(engine, url.href, options);

            let problems: Problem[] | null = null;

            try {
                if (options.targetStartCallback) {
                    await options.targetStartCallback({ url: url.href });
                }
                problems = await engine.executeOn(url, { content: target.content });
            } catch (e) {
                throw new AnalyzerError(e, AnalyzerErrorStatus.AnalyzeError);
            } finally {
                // TODO: Try if this is executed.
                await engine.close();
            }

            if (options.targetEndCallback) {
                await options.targetEndCallback({
                    problems: problems!,
                    url: url.href
                });
            }

            results.push({
                problems: problems!,
                url: (target.url as URL).href
            });
        }

        if (this.watch && this.configuration.connector!.name !== 'local') {
            logger.warn(`WARNING: The option 'watch' is not supported in connector '${this.configuration.connector!.name}'`);
        }

        return results;
    }

    /**
     * Run all the formatters configured in the Analyzer with the problems passed.
     * @param {Problem[]} problems Problems to format.
     * @param {FormatterOptions} options Options for the formatters.
     */
    public async format(problems: Problem[], options?: FormatterOptions): Promise<void> {
        for (const formatter of this.formatters) {
            await formatter.format(problems, options);
        }
    }

    /**
     * Returns the resources configured loaded in the Analyzer.
     */
    public get resources() {
        return this._resources;
    }
}
