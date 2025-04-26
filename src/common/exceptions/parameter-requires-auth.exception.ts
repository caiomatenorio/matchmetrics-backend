import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'

export default class ParameterRequiresAuthException extends ConventionalHttpException {
  constructor(parameterName: string) {
    super(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.PARAMETER_REQUIRES_AUTHENTICATION,
      `Parameter ${parameterName} requires authentication`
    )
  }
}
