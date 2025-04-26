import ErrorCode from '../util/error-code'

export default class ConventionalError extends Error {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string
  ) {
    super(message)
  }
}
