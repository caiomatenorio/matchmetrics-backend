import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'

export default class CountryNotFoundException extends ConventionalHttpException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ErrorCode.COUNTRY_NOT_FOUND, 'Country not found')
  }
}
