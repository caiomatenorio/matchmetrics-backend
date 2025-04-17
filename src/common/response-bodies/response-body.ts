import { HttpStatus } from '@nestjs/common'

export default interface ResponseBody {
  statusCode: HttpStatus
  timestamp: string
}
