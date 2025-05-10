import { HttpStatus } from '@nestjs/common'
import ConventionalHttpException from './conventional-http.exception'
import ErrorCode from '../util/error-code'

export default class RegionSlugAlreadyInUseException extends ConventionalHttpException {
  constructor() {
    super(HttpStatus.CONFLICT, ErrorCode.REGION_SLUG_ALREADY_IN_USE, 'Region slug already in use')
  }
}
