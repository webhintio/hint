declare module 'npm-registry-fetch' {
    function json(url: string, opts?: any): Promise<object>;
}
