import { DomainError } from '@/common/domain/domain.error';
import { HttpStatus } from '@nestjs/common';

export class EmailNotVerifiedError extends DomainError {
  readonly code = 'AUTH_EMAIL_NOT_VERIFIED';
  readonly message = 'Email not verified';
  readonly httpStatus = HttpStatus.FORBIDDEN;
}
