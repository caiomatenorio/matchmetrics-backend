import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'

export default class RegionNotFoundException extends ConventionalHttpException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ErrorCode.REGION_NOT_FOUND, 'Region not found')
  }
}
