/**
 * Ref class to hold a reference to a value. This is useful for passing a value by reference,
 * allowing the value to be modified.
 *
 * @template T - The type of the value to hold a reference to.
 */
export default class Ref<T> {
  /**
   * @param value {T} - The value to hold a reference to.
   */
  constructor(public value: T) {}
}
