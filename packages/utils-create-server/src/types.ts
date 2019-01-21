export type Message = {
    webhint: WebhintMessage;
};

export type WebhintMessage = {
    type: string;
    payload: any;
};

export type ServerConfiguration = string | object;
