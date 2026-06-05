import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';
import { CallSession, CallSessionStatus } from '../../infrastructure/entities/call-session.entity';

@Injectable()
export class CountExpertCallSessionsUseCase {
  constructor(
    @InjectRepository(CallSession)
    private readonly callSessionRepo: Repository<CallSession>,
  ) { }

  async execute(expert_id: string, options: { status?: CallSessionStatus | CallSessionStatus[], startDate?: Date } = {}) {
    const where: any = { expert_id: expert_id as any };

    if (options.status) {
      if (Array.isArray(options.status)) {
        where.status = In(options.status);
      } else {
        where.status = options.status;
      }
    }

    if (options.startDate) {
      where.created_at = MoreThanOrEqual(options.startDate);
    }

    return this.callSessionRepo.count({ where });
  }
}
