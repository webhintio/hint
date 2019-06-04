declare module 'highlight.js/lib/highlight' {
    import * as hljs from 'highlight.js';
    export = hljs;
}

declare module 'highlight.js/lib/languages/*' {
    import * as hljs from 'highlight.js';
    const language: (hljs?: hljs.HLJSStatic) => hljs.IModeBase;
    export = language;
}
