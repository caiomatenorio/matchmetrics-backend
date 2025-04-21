import { HttpStatus } from '@nestjs/common'
import ErrorResponseBody from '../response-bodies/error-response-body'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../response-bodies/error-code'

export default class ParameterRequiresAuthException extends ConventionalHttpException {
  constructor(parameterName: string) {
    super(
      new ErrorResponseBody(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.PARAMETER_REQUIRES_AUTHENTICATION,
        `Parameter "${parameterName}" requires authentication`
      )
    )
  }
}
