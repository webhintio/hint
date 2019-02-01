// Note: raw-loader only works correctly with the bang! syntax
declare module 'raw-loader!*' {
    const content: string;
    export = content;
}
