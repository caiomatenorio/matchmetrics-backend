import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import ValidationException from 'src/common/exceptions/validation.exception'
import { z, ZodSchema } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata): z.infer<typeof this.schema> {
    const parsedValue = this.schema.safeParse(value)
    if (parsedValue.success) return parsedValue.data
    throw new ValidationException(parsedValue.error)
  }
}
