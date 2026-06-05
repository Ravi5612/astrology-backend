import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../../infrastructure/entities/chat-session.entity';

@Injectable()
export class GetChatEarningsUseCase {
  constructor(
    @InjectRepository(ChatSession)
    private readonly chatRepository: Repository<ChatSession>,
  ) {}

  async execute(dateLimit: Date): Promise<number> {
    const chatStats = await this.chatRepository
      .createQueryBuilder('chat')
      .select("SUM(chat.total_cost)", "total")
      .where('chat.created_at >= :date', { date: dateLimit })
      .andWhere("chat.status = 'completed'")
      .getRawOne();

    return parseFloat(chatStats?.total) || 0;
  }
}
