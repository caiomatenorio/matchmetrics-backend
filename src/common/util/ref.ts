/**
 * Ref class to hold a reference to a value. This is useful for passing a value by reference,
 * allowing the value to be modified.
 */
export default class Ref<T> {
  constructor(public value: T) {}
}
