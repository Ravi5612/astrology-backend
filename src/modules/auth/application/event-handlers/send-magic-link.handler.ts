import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '@/common/services/email.service';
import { SendMagicLinkEvent } from '../../domain/events/send-magic-link.event';

@Injectable()
export class SendMagicLinkEventHandler {
  private readonly logger = new Logger(SendMagicLinkEventHandler.name);
  constructor(private readonly emailService: EmailService) {}

  @OnEvent('auth.magic.link', { async: true })
  async handle(event: SendMagicLinkEvent) {
    this.logger.debug('Magic link email sending to the user');
    await this.emailService.sendEmail(
      event.email,
      'Magic link',
      this.buildTemplate(event),
    );
  }

  private buildTemplate(event: SendMagicLinkEvent) {
    const link = `http://localhost:3000/login/magic?token=${event.token}`;

    return `
    <h3>Click to login</h3>
    <br/>
    <button>
      <a href=${link}>Click here to login</a>
      </button>
    `;
  }
}
