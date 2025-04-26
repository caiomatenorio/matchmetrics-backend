import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'
import { ZodError } from 'zod'

export default class ValidationException extends ConventionalHttpException {
  constructor(error: ZodError<any>) {
    const { formErrors, fieldErrors } = error.flatten()

    if (formErrors.length) {
      super(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        'Required body/query/parameter is missing'
      )
    } else {
      super(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, 'Validation error', fieldErrors)
    }
  }
}
