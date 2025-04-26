export default abstract class Role {
  readonly name: string
  readonly hierarchy: number
  readonly authenticated: boolean

  equals(other: Role): boolean {
    return this.name === other.name && this.hierarchy === other.hierarchy
  }
}
