// https://github.com/jsdom/data-urls
declare module 'data-urls' {
    function parseDataURL(url: string): {
        body: Buffer;
        mimeType: {
            type: string;
            subtype: string;
            essence: string;
            parameters: Map<string, string>;
            isHTML(): boolean;
            isXML(): boolean;
        };
    };
    export = parseDataURL;
}
