export type Message = {
    webhint: WebhintMessage;
};

export type WebhintMessage = {
    type: string;
    payload: any;
};

export type ServerConfiguration = string | object;

export interface IServer {
    start(): Promise<unknown>;
    stop(): Promise<unknown>;
    getPort(): Promise<unknown> | number;
    configure(configuration: ServerConfiguration): Promise<unknown> | void;
    port: number;
}
