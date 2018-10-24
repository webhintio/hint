export type BrowserSupportItem = {
    min: number;
    max?: number | null;
};

export type BrowserSupportCollection = {
    [key: string]: BrowserSupportItem;
};

export type BrowserSupportItemRaw = {
    min: string;
    max?: string | null;
};

export type BrowserSupportCollectionRaw = {
    [key: string]: BrowserSupportItemRaw;
};
