import { HttpStatus } from '@nestjs/common'
import ResponseBody from './response-body'
import ErrorCode from '../util/error-code'

export default class ErrorResponseBody implements ResponseBody {
  public statusCode: HttpStatus
  public timestamp: string
  public errorCode: ErrorCode
  public message: string
  public errors?: { [key: string | number | symbol]: string[] | undefined }

  constructor(
    statusCode: HttpStatus,
    errorCode: ErrorCode,
    message: string,
    errors?: { [key: string | number | symbol]: string[] | undefined }
  ) {
    if (statusCode.valueOf() < 400 || statusCode.valueOf() >= 600)
      throw new Error('ErrorResponseBody must have a 4xx or 5xx status code')

    this.statusCode = statusCode
    this.timestamp = new Date().toISOString()
    this.errorCode = errorCode
    this.message = message
    this.errors = errors
  }
}
