import normalizeString from './normalize-string';

/** Return if normalized `source` string includes normalized `included` string. */
export default (source: string, included: string) => normalizeString(source)!.includes(normalizeString(included)!);
