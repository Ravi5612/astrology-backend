import { Injectable } from '@nestjs/common';
import { BooleanMessage } from '@/common/dto/boolean-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../infrastructure/entities/notification.entity';

@Injectable()
export class ClearAllNotificationsUseCase {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async execute(userId: string) {
    await this.notificationRepo.delete({
      user_id: userId,
    });
    return new BooleanMessage();
  }
}
