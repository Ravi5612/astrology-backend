import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NodeMailerService } from '@/external/nodemailer/nodemailer.service';

interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailerService: NodeMailerService) {
    super();
  }

  async process(job: Job<SendEmailPayload, unknown, string>): Promise<void> {
    this.logger.debug(`Processing email job ${job.id} for ${job.data.to}...`);

    try {
      await this.mailerService.sendEmail(
        job.data.to,
        job.data.subject,
        job.data.html,
      );
      this.logger.debug(`Email job ${job.id} completed successfully.`);
    } catch (error) {
      this.logger.error(`Failed to send email for job ${job.id}:`, error);
      throw error; // This will trigger BullMQ's retry mechanism
    }
  }
}
