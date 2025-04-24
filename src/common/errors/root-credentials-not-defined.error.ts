import ErrorCode from '../response-bodies/error-code'
import ConventionalError from './conventional.error'

export default class RootCredentialsNotDefinedError extends ConventionalError {
  constructor() {
    super(
      ErrorCode.ROOT_CREDENTIALS_NOT_DEFINED,
      'The credentials of the root user were not defined'
    )
  }
}
