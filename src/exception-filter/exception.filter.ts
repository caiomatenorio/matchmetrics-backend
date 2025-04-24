import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  ExceptionFilter as NestExceptionFilter,
} from '@nestjs/common'
import { Response } from 'express'
import ConventionalError from 'src/common/errors/conventional.error'
import ConventionalHttpException from 'src/common/exceptions/conventional-http.exception'
import ErrorResponseBody from 'src/common/response-bodies/error-response-body'
import ErrorCode from '../common/response-bodies/error-code'

@Catch()
export default class ExceptionFilter implements NestExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof ConventionalHttpException) throw exception

    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const status = HttpStatus.INTERNAL_SERVER_ERROR

    let errorCode: ErrorCode
    let message: string

    if (exception instanceof ConventionalError) {
      errorCode = exception.errorCode
      message = exception.message
    } else {
      errorCode = ErrorCode.UNKNOWN
      message = 'An unknown error occurred'
      console.error(exception)
    }

    response.status(status).json(new ErrorResponseBody(status, errorCode, message))
  }
}
