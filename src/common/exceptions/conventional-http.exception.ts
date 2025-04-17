import { HttpException } from '@nestjs/common'
import ErrorResponseBody from '../response-bodies/error-response-body'

export default class ConventionalHttpException extends HttpException {
  constructor(responseBody: ErrorResponseBody) {
    super(responseBody, responseBody.statusCode)
  }
}
