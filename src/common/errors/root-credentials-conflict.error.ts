import ErrorCode from '../util/error-code'
import ConventionalError from './conventional.error'

export default class RootCredentialsConflictError extends ConventionalError {
  constructor() {
    super(
      ErrorCode.ROOT_CREDENTIALS_CONFLICT,
      'There is already a user with the specified root credentials, so it was not possible to create it'
    )
  }
}
