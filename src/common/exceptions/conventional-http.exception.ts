import { HttpStatus } from '@nestjs/common'
import ErrorCode from '../response-bodies/error-code'

export default class ConventionalHttpException extends Error {
  constructor(
    public readonly statusCode: HttpStatus,
    public readonly errorCode: ErrorCode,
    public readonly message: string,
    public readonly errors?: { [key: string | number | symbol]: string[] | undefined }
  ) {
    if (statusCode.valueOf() < 400 || statusCode.valueOf() >= 500)
      throw new Error('statusCode must be 4xx')

    super(message)
  }
}
