import { HttpStatus } from '@nestjs/common'
import ErrorResponseBody from '../response-bodies/error-response-body'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../response-bodies/error-code'
import { ZodError } from 'zod'

export default class ValidationException extends ConventionalHttpException {
  constructor(error: ZodError<any>) {
    const { formErrors, fieldErrors } = error.flatten()

    if (formErrors.length) {
      super(
        new ErrorResponseBody(
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          'Body is required'
        )
      )
    } else {
      super(
        new ErrorResponseBody(
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          'Validation error',
          fieldErrors
        )
      )
    }
  }
}
