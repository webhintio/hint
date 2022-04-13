/**
 * https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration
 */
export class CSSStyleDeclaration {
    private _styles: {[name: string]: string};

    /**
     * Non-standard. Used internally by utils-dom to create CSSStyleDeclaration instances.
     */
    public constructor(styles: {[name: string]: string} = {}) {
        this._styles = styles;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/CSSStyleDeclaration/getPropertyValue
     */
    public getPropertyValue(name: string) {
        return this._styles[name] || '';
    }
}
