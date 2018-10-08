// https://github.com/eslint/espree
declare module 'espree' {

    interface IFeatures {
        jsx?: boolean;
        globalReturn?: boolean;
        impliedStrict?: boolean;
    }

    interface IOptions {
        range?: boolean;
        loc?: boolean;
        comment?: boolean;
        attachComment?: boolean;
        tokens?: boolean;
        ecmaVersion?: number;
        sourceType?: 'script' | 'module';
        ecmaFeatures?: IFeatures;
    }

    function parse(code: string, options?: IOptions): any;
}
