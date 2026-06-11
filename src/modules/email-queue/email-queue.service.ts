import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async queueEmail(payload: SendEmailPayload) {
    this.logger.debug(`Adding email job for ${payload.to} to queue...`);

    // Add job to BullMQ
    const job = await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.debug(`Email job added with ID: ${job.id}`);
    return job;
  }
}
