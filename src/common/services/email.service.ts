// src/common/services/email.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const emailConfig = this.configService.get('email', { infer: true });

    // Configure the transporter
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });
  }

  /**
   * Send an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param html HTML content
   */
  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"No Reply" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      });

      console.log('Email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
