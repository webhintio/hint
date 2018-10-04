// https://github.com/gagle/node-bcp47
declare module 'bcp47' {
    function parse(tag: string): {
        langtag: {
            language: {
                language: string;
                extlang: string[];
            };
            script: string;
            region: string;
            variant: string[];
            extension: string[];
        };
    };
}
