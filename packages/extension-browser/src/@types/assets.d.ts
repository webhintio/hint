declare module '*.ejs' {
    const content: (data: any, _?: any, resolve?: (path: string, data: any) => string) => string;
    export = content;
}
