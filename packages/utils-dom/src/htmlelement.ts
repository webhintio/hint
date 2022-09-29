import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';
import cssSelect, { selectOne } from 'css-select';

import { ProblemLocation } from '@hint/utils-types';

import { findOriginalElement } from './find-original-element';
import { ElementData, INamedNodeMap } from './types';

import { Node } from './node';
import { CSSStyleDeclaration } from './cssstyledeclaration';
import { HTMLDocument } from './htmldocument';
import { getCompiledSelector } from './get-compiled-selector';

/**
 * https://developer.mozilla.org/docs/Web/API/HTMLElement
 */
export class HTMLElement extends Node {
    private _element: ElementData;
    private _computedStyles: CSSStyleDeclaration;
    private _domRect = {
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        toJSON() {
            return this;
        },
        top: 0,
        width: 0,
        x: 0,
        y: 0
    };

    /**
     * Non-standard. Used internally by utils-dom to create HTMLElement instances.
     */
    public constructor(element: ElementData, ownerDocument: HTMLDocument) {
        super(element, ownerDocument);
        this._element = element;
        this._computedStyles = new CSSStyleDeclaration(element['x-styles']);
        if (element['x-rects']) {
            this._domRect.x = element['x-rects'].clientRect.x;
            this._domRect.y = element['x-rects'].clientRect.y;
            this._domRect.left = element['x-rects'].clientRect.x;
            this._domRect.top = element['x-rects'].clientRect.y;
            this._domRect.width = element['x-rects'].clientRect.width;
            this._domRect.height = element['x-rects'].clientRect.height;
            this._domRect.right = this._domRect.x + this._domRect.width;
            this._domRect.bottom = this._domRect.y + this._domRect.height;
        }
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/attributes
     */
    public get attributes(): INamedNodeMap {
        const x = this._element.attribs;

        return Object.entries(x).map(([name, value]) => {
            return {
                name,
                nodeName: name,
                nodeValue: value,
                value
            };
        });
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/ParentNode/children
     */
    public get children(): HTMLElement[] {
        return this.childNodes.filter((node) => {
            return node instanceof HTMLElement;
        }) as HTMLElement[];
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/id
     */
    public get id() {
        return this.getAttribute('id') || '';
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/name
     */
    public get name() {
        return this.getAttribute('name') || '';
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/ElementCSSInlineStyle/style
     */
    public get style() {
        return {
            getPropertyValue(name: string) {
                return; // TODO: Return actual inline styles
            }
        };
    }

    /**
     * See `type` in https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
     */
    public get type() {
        if (this.nodeName === 'BUTTON') {
            return this.getAttribute('type') || 'submit';
        } else if (this.nodeName === 'INPUT') {
            return this.getAttribute('type') || 'text';
        }

        return '';
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/getAttribute
     */
    public getAttribute(name: string): string | null {
        const attrib = this._element.attribs[name];
        const value = typeof attrib !== 'undefined' ? attrib : null;

        return value;
    }

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
     */
    public getBoundingClientRect(): DOMRect {
        return this._domRect;
    }

    /**
     * Non-standard. Used internally by utils-dom for `window.getComputedStyle`.
     */
    public getComputedStyle() {
        return this._computedStyles;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/hasAttribute
     */
    public hasAttribute(name: string): boolean {
        return this.getAttribute(name) !== null;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/hasAttributes
     */
    public hasAttributes(): boolean {
        return Object.keys(this._element.attribs).length > 0;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/setAttribute
     */
    public setAttribute(name: string, value: string) {
        this._element.attribs[name] = value;
    }

    /**
     * Non-standard.
     * Check if additional attributes were provided via spread notation,
     * meaning the exact set of provided attributes is unknown.
     */
    public hasAttributeSpread(): boolean {
        return this.hasAttribute('{...spread}');
    }

    /**
     * Non-standard.
     * Check if the value of an attribute was provided as a template
     * expression, meaning the exact value of the attribute is unknown.
     */
    public isAttributeAnExpression(attribute: string): boolean {
        const value = this.getAttribute(attribute);

        return value ? value.includes('{') : false;
    }

    /**
     * Helper to find the original location in source of an element.
     * Used when this element is part of a DOM snapshot to search the
     * original fetched document a similar element and use the location
     * of that element instead.
     */
    private _getOriginalLocation(): parse5.ElementLocation | null {
        const location = this._element.sourceCodeLocation;

        // Use direct location information when available.
        if (location) {
            return location;
        }

        // If not, try to match an element in the original document to use it's location.
        if (this.ownerDocument.originalDocument) {
            const match = findOriginalElement(this.ownerDocument.originalDocument, this);

            if (match) {
                return match._element.sourceCodeLocation || null;
            }
        }

        // Otherwise we don't have a location (element may have been dynamically generated).
        return null;
    }

    /**
     * Non-standard.
     * Zero-based location of the specified attribute in original source code.
     *
     * @param name The name of the attribute to get the location for.
     */
    public getAttributeLocation(name: string): ProblemLocation {
        const elementLocation = this._getOriginalLocation();
        const location = elementLocation?.attrs?.[name];

        return {
            column: location ? location.startCol - 1 : -1,
            endColumn: location ? location.endCol - 1 : -1,
            endLine: location ? location.endLine - 1 : -1,
            endOffset: location ? location.endOffset : -1,
            line: location ? location.startLine - 1 : -1,
            startOffset: location ? location.startOffset : -1
        };
    }

    /**
     * Non-standard.
     * Zero-based location of the element in original source code.
     */
    public getLocation(): ProblemLocation {
        const location = this._getOriginalLocation();

        return {
            column: location ? location.startCol - 1 : -1,
            elementId: this._element.id,
            endColumn: location ? location.endCol - 1 : -1,
            endLine: location ? location.endLine - 1 : -1,
            endOffset: location ? location.endOffset : -1,
            line: location ? location.startLine - 1 : -1,
            startOffset: location ? location.startOffset : -1
        };
    }

    /**
     * Non-standard.
     * Calculate the source code location of content within this element.
     * Used to determine offsets for CSS-in-HTML and JS-in-HTML reports.
     */
    public getContentLocation(offset: ProblemLocation): ProblemLocation | null {
        const location = this._getOriginalLocation();

        if (!location) {
            return null;
        }

        // Get the end of the start tag from `parse5`, converting to be zero-based.
        const startTag = location.startTag;
        const column = startTag.endCol - 1;
        const line = startTag.endLine - 1;

        // Adjust resulting column when content is on the same line as the tag.
        if (offset.line === 0) {
            return {
                column: column + offset.column,
                endColumn: offset.endColumn && (offset.endLine === 0 ? column + offset.endColumn : offset.endColumn),
                endLine: offset.endLine && (line + offset.endLine),
                line
            };
        }

        // Otherwise adjust just the resulting line.
        return {
            column: offset.column,
            endColumn: offset.endColumn,
            endLine: offset.endLine && (line + offset.endLine),
            line: line + offset.line
        };
    }

    /**
     * Non-standard. Used internally by utils-dom to compare elements.
     * TODO: Consider removing in favor of `===` reference comparisons.
     */
    public isSame(element: HTMLElement): boolean {
        return this._element === element._element;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/innerHTML
     */
    public get innerHTML(): string {
        return parse5.serialize(this._element as htmlparser2Adapter.Node, { treeAdapter: htmlparser2Adapter });
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/querySelector
     */
    public querySelector(selector: string): HTMLElement | null {
        const data = selectOne(
            getCompiledSelector(selector),
            this._element
        );

        return data ? this.ownerDocument.getNodeFromData(data) as HTMLElement : null;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/querySelectorAll
     */
    public querySelectorAll(selector: string): HTMLElement[] {
        const matches: any[] = cssSelect(
            getCompiledSelector(selector),
            this._element
        );

        const result = matches.map((element) => {
            return this.ownerDocument.getNodeFromData(element);
        });

        return result as HTMLElement[];
    }

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
     */
    public matches(selector: string): boolean {
        return getCompiledSelector(selector)(this._element);
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Element/outerHTML
     */
    public get outerHTML(): string {
        /*
         * Until parse5 support outerHTML
         * (https://github.com/inikulin/parse5/issues/230)
         * we need to use this workaround.
         * https://github.com/inikulin/parse5/issues/118
         *
         * The problem with this workaround will modify the
         * parentElement and parentNode of the element, so we
         * need to restore it before return the outerHTML.
         */
        const fragment = htmlparser2Adapter.createDocumentFragment();
        const { parent, next, prev } = this._element;

        htmlparser2Adapter.appendChild(fragment, this._element as htmlparser2Adapter.Node);

        const result = parse5.serialize(fragment, { treeAdapter: htmlparser2Adapter });

        this._element.parent = parent;
        this._element.next = next;
        this._element.prev = prev;

        /* istanbul ignore else */
        if (next) {
            next.prev = this._element;
        }

        /* istanbul ignore else */
        if (prev) {
            prev.next = this._element;
        }

        return result;
    }

    /**
     * Non-standard.
     * Resolve the provided URL against the base URL for this element's document.
     */
    public resolveUrl(url: string) {
        return this.ownerDocument.resolveUrl(url);
    }

    /**
     * Non-standard.
     * Retrieves the newline type (\n, \r\n) of the element and the indent level of its child element
     * Elements that exist only on one line will have empty strings for newlineType and indent.
     */
    public getChildIndent(): {indent: string; newlineType: string} {
        const newlineType = this.outerHTML.indexOf('\r\n') === -1 ? '\n' : '\r\n';
        const splitByLine = this.outerHTML.split(newlineType);

        if (splitByLine.length === 1) {
            return {indent: '', newlineType: ''};
        }

        if (splitByLine.length === 2) {
            const lastLine = splitByLine[splitByLine.length - 1];
            const nonSpaceInd = lastLine.search(/[^ ]/);
            // Add two spaces for child indent.
            const indent = `${lastLine.substring(0, nonSpaceInd)}  `;

            return {indent, newlineType};
        }
        const childLine = splitByLine[1];
        const nonSpaceInd = childLine.search(/[^ ]/);

        return {indent: childLine.substring(0, nonSpaceInd), newlineType};
    }

    /**
     * Non-standard.
     * This helper method takes in a string (presumably representing an HTML element) and returns the resulting outerHTML text
     * after inserting it as the first child element.
     * removeExistingInstance is an optional boolean used if the inserted element exists as a child and we want to move it to the first child spot.
     * This method is used to help create insertion CodeFix objects.
     */
    public prependChildOuterHtml(child: string, removeExistingInstance?: boolean): string {
        const openingTagRegex = /<[^>]+>/;
        const childIndent = this.getChildIndent();
        const outerHTML = removeExistingInstance ? this.outerHTML.replace(child, '') : this.outerHTML;

        const tagMatch = outerHTML.match(openingTagRegex);

        if (tagMatch) {
            const childInsertionInd = tagMatch[0].length;
            const newLineWithIndent = childIndent?.newlineType && childIndent?.indent ? `${childIndent?.newlineType}${childIndent?.indent}` : '';

            return outerHTML.substring(0, childInsertionInd) + newLineWithIndent + child + outerHTML.substring(childInsertionInd);
        }

        return this.outerHTML;
    }
}
