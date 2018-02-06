export type ResourceResponse = {
    /** The URL of the resource. */
    resource: string;
    /** The amount of bytes sent over the wire. */
    sentSize: number;
    /** The size of the resource after being decompressed (if applicable). */
    uncompressedSize: number;
};

export type NetworkConfig = {
    /** The download bandwidth in bytes/sec. */
    bwIn: number;
    /** The upload bandwidth in bytes/sec. */
    bwOut: number;
    /** The description of the connection. */
    label: string;
    /** The latency of the connection in ms. */
    latency: number;
    /** The target load time in seconds.  */
    load?: number;
    /** The id for the connection type. */
    id: string;
    /** Packet loss rate. */
    plr?: number;
};

export type PerfBudgetConfig = {
    connectionType?: string;
    loadTime?: number;
};
