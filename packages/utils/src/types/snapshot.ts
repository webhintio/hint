import { ElementLocation, Location } from 'parse5';

export type ChildData = CommentData | DoctypeData | ElementData | TextData;
export type NodeData = DocumentData | ChildData;

type BaseData = {
    id?: number;
    next: ChildData | null;
    parent: DocumentData | ElementData | null;
    prev: ChildData | null;
};

export type CommentData = BaseData & {
    data: string;
    sourceCodeLocation?: Location | null;
    type: 'comment';
};

export type DoctypeData = BaseData & {
    data: string;
    name: '!doctype';
    nodeName?: string;
    publicId?: string;
    sourceCodeLocation?: Location | null;
    systemId?: string;
    type: 'directive';
};

export type DocumentData = {
    children: ChildData[];
    name: 'root';
    type: 'root';
    'x-mode': 'no-quirks' | 'quirks' | 'limited-quirks';
};

export type ElementData = BaseData & {
    attribs: { [name: string]: string };
    children: ChildData[];
    name: string;
    namespace?: string | null;
    sourceCodeLocation?: ElementLocation | null;
    type: 'script' | 'style' | 'tag';
    'x-attribsNamespace': { [name: string]: string };
    'x-attribsPrefix': { [name: string]: string };
};

export type TextData = BaseData & {
    data: string;
    sourceCodeLocation?: Location | null;
    type: 'text';
};
