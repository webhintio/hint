import { HTMLDocument } from './htmldocument';
import { Node } from './node';
import { CommentData, TextData } from './types';

type CData = CommentData | TextData;

/**
 * https://developer.mozilla.org/docs/Web/API/CharacterData
 */
export class CharacterData extends Node {
    private _cdata: CData;

    /**
     * Non-standard. Used internally by utils-dom to create CharacterData instances.
     */
    public constructor(data: CData, owner: HTMLDocument) {
        super(data, owner);
        this._cdata = data;
    }

    public get data() {
        return this._cdata.data;
    }
}
