import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetDisputeByIdUseCase } from './get-dispute-by-id.use-case';
import { DisputeMessage } from '../../infrastructure/entities/dispute-message.entity';

@Injectable()
export class GetDisputeMessagesUseCase {
    constructor(
        private readonly getDisputeByIdUseCase: GetDisputeByIdUseCase,
        @InjectRepository(DisputeMessage)
        private readonly messageRepo: Repository<DisputeMessage>,
    ) { }

    async execute(userId: string, disputeId: string, isAdmin = false) {
        const dispute = await this.getDisputeByIdUseCase.execute(userId, disputeId, isAdmin);

        return this.messageRepo.find({
            where: { dispute_id: disputeId },
            order: { created_at: 'ASC' },
        });
    }
}
