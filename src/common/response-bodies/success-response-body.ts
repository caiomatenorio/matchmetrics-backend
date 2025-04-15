import { HttpStatus } from '@nestjs/common'
import ResponseBody from './response-body'

export default class SuccessResponseBody<T> implements ResponseBody {
  public statusCode: HttpStatus
  public timestamp: string
  public message: string
  public data: T | undefined

  constructor(statusCode: HttpStatus, message: string, data?: T) {
    if (statusCode.valueOf() < 200 || statusCode.valueOf() >= 300)
      throw new Error('SuccessResponseBody must have a 2xx status code')

    this.statusCode = statusCode
    this.timestamp = new Date().toISOString()
    this.message = message
    this.data = data
  }
}

export type NoDataSuccessResponseBody = SuccessResponseBody<undefined>
