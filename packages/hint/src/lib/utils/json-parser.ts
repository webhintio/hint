import { findNodeAtLocation, Node, parse, parseTree, Segment } from 'jsonc-parser';
import { IJSONLocationOptions, IJSONResult, ProblemLocation } from '../types';

const rxIsNumber = /^[0-9]+$/;

class JSONResult implements IJSONResult {

    private _data: any;
    private _lines: string[];
    private _root: Node;

    public constructor(data: any, root: Node, lines: string[]) {
        this._data = data;
        this._lines = lines;
        this._root = root;

        // Ensure `getLocation` can be passed around without losing context
        this.getLocation = this.getLocation.bind(this);
    }

    public get data(): any {
        return this._data;
    }

    public getLocation(path: string, options?: IJSONLocationOptions): ProblemLocation {
        const segments = this.pathToSegments(path);
        const node = findNodeAtLocation(this._root, segments);
        let offset = node ? node.offset : this._root.offset;

        // The location returned by jsonc-parser is at the value node by default.
        if ((!options || options.at !== 'value') && node && node.parent) {
            // Walk up to the parent node to get the name.
            offset = node.parent.offset + 1; // +1 to get past the quote (")
        }

        return this.offsetToLocation(offset);
    }

    public scope(path: string): IJSONResult {
        const segments = this.pathToSegments(path);
        const node = findNodeAtLocation(this._root, segments);
        const value = this.findValueAtLocation(segments);

        return node && new JSONResult(value, node, this._lines);
    }

    /**
     * Find the value at the given path in the JSON DOM.
     * @param segments The path to the value.
     */
    private findValueAtLocation(segments: Segment[]): any {
        let value = this._data;

        segments.forEach((segment) => {
            value = value[segment];
        });

        return value;
    }

    /**
     * Convert a source offset into a `ProblemLocation` with line/column data.
     * @param offset The offset in the original source.
     */
    private offsetToLocation(offset: number): ProblemLocation {
        for (let i = 0, n = 0; i < this._lines.length; i++) {
            const lineLength = this._lines[i].length;

            if (offset <= n + lineLength) {
                return {
                    column: offset - n,
                    line: i
                };
            }

            // Move to the next line (+1 to account for the newline)
            n += lineLength + 1;
        }

        return null;
    }

    /**
     * Convert a JS-style path string to the `Segment` array needed by jsonc-parser.
     * @param path The path to convert (e.g. `foo.items[1].bar`).
     * @returns An array of `Segment` properties (e.g. `['foo', 'items', 1, 'bar']`).
     */
    private pathToSegments(path: string): Segment[] {
        return path

            // Strip leading dot (.) if present (ajv bug?)
            .replace(/^\./, '')

            // Ignore trailing `]` from `foo[1]`
            .replace(']', '')

            // Break items on `.` or `[`
            .split(/[[.]/)

            // Ensure numbers are not returned as strings
            .map((k) => {
                return rxIsNumber.test(k) ? parseInt(k) : k;
            });
    }
}

/**
 * Parse the provided JSON returning a `JSONResult` with location information.
 * @param json The JSON string to parse
 */
export const parseJSON = (json: string): IJSONResult => {
    const lines = json.split('\n');
    const data = parse(json);
    const root = parseTree(json);

    // If we didn't get a root, it's invalid JSON
    if (!root) {
        // Use the built-in JSON parser to get an error
        JSON.parse(json);
    }

    return new JSONResult(data, root, lines);
};
