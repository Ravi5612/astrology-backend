import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { EmailService } from '@/common/services/email.service';

@Injectable()
export class UserRegisteredHandler {
  private readonly logger = new Logger(UserRegisteredHandler.name);
  constructor(private readonly emailService: EmailService) {}

  @OnEvent('auth.user.registered', { async: true })
  async handle(event: UserRegisteredEvent) {
    this.logger.debug('Email sending to the user');
    await this.emailService.sendEmail(
      event.email,
      'Verify your email',
      this.buildTemplate(event),
    );
  }

  private buildTemplate(event: UserRegisteredEvent) {
    return `
      Hi ${event.name ?? 'there'},
      Verify your email using this link:
      ${event.verification_token}
    `;
  }
}
