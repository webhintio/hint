export type BrowserSupportItem = {
    min: number;
    max?: number | null;
}

export type BrowserSupportCollection = {
    [key: string]: BrowserSupportItem
}