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
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()

    let status: HttpStatus
    let errorCode: ErrorCode
    let message: string
    let errors: { [key: string | number | symbol]: string[] | undefined } | undefined

    if (exception instanceof ConventionalHttpException) {
      status = exception.statusCode
      errorCode = exception.errorCode
      message = exception.message
    } else if (exception instanceof ConventionalError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      errorCode = exception.errorCode
      message = exception.message
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      errorCode = ErrorCode.UNKNOWN
      message = 'Unknown error'
      console.error(exception)
    }

    response.status(status).json(new ErrorResponseBody(status, errorCode, message, errors))
  }
}
