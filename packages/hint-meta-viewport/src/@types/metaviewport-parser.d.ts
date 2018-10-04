// https://github.com/dontcallmedom/metaviewport-parser
declare module 'metaviewport-parser' {
    function parseMetaViewPortContent(content: string): {
        invalidValues: { [name: string]: string | number };
        unknownProperties: { [name: string]: string | number };
        validProperties: { [name: string]: string | number };
    };
}
