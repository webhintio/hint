export type HTMLAttribute = {
    /** Attribute name of the element */
    name: string;

    /** Attribute value of the element */
    value: string;
};

export interface INamedNodeMap {
    [index: number]: HTMLAttribute;
    item?(index: number): HTMLAttribute | null;
    readonly length: number;
}
