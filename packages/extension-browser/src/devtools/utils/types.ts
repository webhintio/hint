type Elements = JSX.IntrinsicElements;

/**
 * Create a new type derived from `T` excluding the provided `Props`.
 *
 * ```ts
 * type T = { foo: any; bar: any; baz: any; };
 * type Props = 'foo' | 'bar';
 * type Result = Omit<Props, T>;
 * // Result => { baz: any }
 * ```
 */
export type Omit<Props, T> = Pick<T, Exclude<keyof T, Props>>;

/**
 * Get the React `Props` type for the specified instrinsic element `Tag`.
 *
 * ```ts
 * type Props = ElementProps<'a'>;
 * // Props => the same props supported by `<a>`
 * ```
 */
export type ElementProps<Tag extends keyof Elements> = Elements[Tag];
