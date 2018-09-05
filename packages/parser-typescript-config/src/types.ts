import { Event, ErrorEvent } from 'hint/dist/src/lib/types/events';
import { IJSONLocationFunction, ISchemaValidationError } from 'hint/dist/src/lib/types';

/** Valid values for the `JSX` compiler option. */
export enum TypeScriptJSXEnum {
    preserve = 'preserve',
    react = 'react',
    reactNative = 'react-native'
}

/** Valid values for the `lib` compiler option. */
export enum TypeScriptLibEnum {
    es5 = 'es5',
    es6 = 'es6',
    es2015 = 'es2015',
    es7 = 'es7',
    es2016 = 'es2016',
    es2017 = 'es2017',
    es2018 = 'es2018',
    esnext = 'esnext',
    dom = 'dom',
    domIterable = 'dom.iterable',
    webworker = 'webworker',
    scripthost = 'scripthost',
    es2015Core = 'es2015.core',
    es2015Collection = 'es2015.collection',
    es2015Generator = 'es2015.generator',
    es2015Iterable = 'es2015.iterable',
    es2015Promise = 'es2015.promise',
    es2015Proxy = 'es2015.proxy',
    es2015Reflect = 'es2015.reflect',
    es2015Symbol = 'es2015.symbol',
    es2015SymbolWellknown = 'es2015Symbol.wellknown',
    es2016ArrayInclude = 'es2016.array.include',
    es2017Object = 'es2017.object',
    es2017Sharedmemory = 'es2017.sharedmemory',
    es2017Typedarrays = 'es2017.typedarrays',
    esnextArray = 'esnext.array',
    esnextAsynciterable = 'esnext.asynciterable',
    esnextPromise = 'esnext.promise'
}

/**
 * Target values.
 * Note: This values in the config file are case insentive.
 */
export enum TypeScriptTargetEnum {
    es3 = 'es3',
    es5 = 'es5',
    es6 = 'es6',
    es2015 = 'es2015',
    es2016 = 'es2016',
    es2017 = 'eses2017',
    esnext = 'esnext'
}

/**
 * Module values.
 * Note: This values in the config file are case insentive.
 */
export enum TypeScriptModuleEnum {
    commonjs = 'commonjs',
    amd = 'amd',
    umd = 'umd',
    system = 'system',
    es3 = 'es3',
    es5 = 'es5',
    es6 = 'es6',
    es2015 = 'es2015',
    es2016 = 'es2016',
    es2017 = 'es2017',
    esnext = 'esnext',
    none = 'none'
}

/**
 * Module resolution values.
 * Note: This values in the config file can have the first character
 * in upper case (Classic, Node).
 */
export enum TypeScriptModuleResolutionEnum {
    classic = 'classic',
    node = 'node'
}

/**
 * New line values.
 * Note: This values in the config file are case insentive.
 */
export enum TypeScriptNewLineEnum {
    CRLF = 'CRLF',
    LF = 'LF'
}

/** Specify path mapping to be computed relative to baseUrl option. */
export type TypeScriptPaths = {
    [key: string]: Array<string>;
};

/** List of TypeScript language server plugins to load. */
export type TypeScriptPlugin = {
    name: string;
};

/** Instructs the TypeScript compiler how to compile .ts files. */
export type TypeScriptCompilerOptions = {
    allowJs: boolean;
    allowSyntheticDefaultImports: boolean;
    charset: string;
    declaration: boolean;
    declarationDir: string;
    diagnostics: boolean;
    emitBOM: boolean;
    inlineSourceMap: boolean;
    inlineSources: boolean;
    jsx: TypeScriptJSXEnum;
    reactNamespace: string;
    listFiles: boolean;
    mapRoot: string;
    module: TypeScriptModuleEnum;
    newLine: TypeScriptNewLineEnum;
    noEmit: boolean;
    noEmitHelpers: boolean;
    noEmitOnError: boolean;
    noImplicitAny: boolean;
    noImplicitThis: boolean;
    noUnusedLocals: boolean;
    noUnusedParameters: boolean;
    noLib: boolean;
    noResolve: boolean;
    noStrictGenericChecks: boolean;
    skipDefaultLibCheck: boolean;
    skipLibCheck: boolean;
    outFile: string;
    outDir: string;
    preserveConstEnums: boolean;
    preserveSymlinks: boolean;
    pretty: boolean;
    removeComments: boolean;
    rootDir: string;
    isolatedModules: boolean;
    sourceMap: boolean;
    sourceRoot: string;
    suppressExcessPropertyErrors: boolean;
    suppressImplicitAnyIndexErrors: boolean;
    stripInternal: boolean;
    target: TypeScriptTargetEnum;
    watch: boolean;
    experimentalDecorators: boolean;
    emitDecoratorMetadata: boolean;
    moduleResolution: TypeScriptModuleResolutionEnum;
    allowUnusedLabels: boolean;
    noImplicitReturns: boolean;
    noImplicitUseStrict: boolean;
    noFallthroughCasesInSwitch: boolean;
    allowUnreachableCode: boolean;
    forceConsistentCasingInFileNames: boolean;
    baseUrl: string;
    paths: TypeScriptPaths;
    plugins: Array<TypeScriptPlugin>;
    rootDirs: Array<string>;
    typeRoots: Array<string>;
    types: Array<string>;
    traceResolution: boolean;
    listEmittedFiles: boolean;
    lib: Array<TypeScriptLibEnum>;
    strictNullChecks: boolean;
    maxNodeModuleJsDepth: number;
    importHelpers: boolean;
    jsxFactory: string;
    alwaysStrict: boolean;
    strict: boolean;
    downlevelIteration: boolean;
    checkJs: boolean;
    strictFunctionTypes: boolean;
    strictPropertyInitialization: boolean;
    esModuleInterop: boolean;
};

/** Auto type (.d.ts) acquisition options for this project.*/
export type TypeScriptTypeAcquisition = {
    enable: boolean;
    include: Array<string>;
    exclude: Array<string>;
};

/** TypeScript Configuration */
export type TypeScriptConfig = {
    compilerOptions: TypeScriptCompilerOptions;
    compileOnSave: boolean;
    extends: string;
    files: Array<string>;
    include: Array<string>;
    exclude: Array<string>;
    typeAcquisition: TypeScriptTypeAcquisition;
};

/** Data type sent for Invalid JSON event */
export type TypeScriptConfigInvalidJSON = ErrorEvent;

/** Data type sent for JSON doesn't validate Schema event */
export type TypeScriptConfigInvalidSchema = Event & {
    errors: Array<ISchemaValidationError>;
    prettifiedErrors: Array<string>;
};

/** Data type sent when the parse starts parsing */
export type TypeScriptConfigParseStart = Event;

/** The object emitted by the `typescript-config` parser */
export type TypeScriptConfigParse = Event & {
    /** The TypeScript config parsed */
    config: TypeScriptConfig;
    /** Find the location of a path within the original JSON source */
    getLocation: IJSONLocationFunction;
    /** The original TypeScript config */
    originalConfig: TypeScriptConfig;
};
