declare module 'tsort' {
    type Graph = {
        add(...nodes: string[]): void;
        sort(): string[];
    };

    function tsort(): Graph;
    export = tsort;
}
