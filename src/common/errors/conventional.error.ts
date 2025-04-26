import ErrorCode from '../response-bodies/error-code'

export default class ConventionalError extends Error {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string
  ) {
    super(message)
  }
}
