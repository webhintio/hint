import { ElementLocation } from 'parse5';

export type ChildData = CommentData | ElementData | TextData;
export type DocumentChildData = ChildData | DoctypeData;
export type NodeData = DocumentData | ChildData;

type BaseData = {
    id?: string;
    next: ChildData | null;
    parent: ElementData | null;
    prev: ChildData | null;
};

export type CommentData = BaseData & {
    data: string;
    type: 'comment';
};

export type DoctypeData = BaseData & {
    data: string;
    name: '!doctype';
    nodeName?: string;
    publicId?: string;
    systemId?: string;
    type: 'directive';
};

export type DocumentData = {
    children: DocumentChildData[];
    name: 'root';
    type: 'root';
    'x-mode': 'no-quirks' | 'quirks' | 'limited-quirks';
};

export type ElementData = BaseData & {
    attribs: { [name: string]: string };
    children: ChildData[];
    name: string;
    namespace?: string;
    sourceCodeLocation?: ElementLocation;
    type: 'script' | 'style' | 'tag';
    'x-attribsNamespace': { [name: string]: string };
    'x-attribsPrefix': { [name: string]: string };
};

export type TextData = BaseData & {
    data: string;
    type: 'text';
};
