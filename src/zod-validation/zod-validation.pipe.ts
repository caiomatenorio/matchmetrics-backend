/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import ValidationException from 'src/common/exceptions/validation.exception'
import { z, ZodSchema } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata): z.infer<typeof this.schema> {
    const parsedValue = this.schema.safeParse(value)
    if (parsedValue.success) return parsedValue.data
    throw new ValidationException(parsedValue.error)
  }
}
