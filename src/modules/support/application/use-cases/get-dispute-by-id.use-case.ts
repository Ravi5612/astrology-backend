import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from '../../infrastructure/persistence/entities/dispute.entity';

@Injectable()
export class GetDisputeByIdUseCase {
    constructor(
        @InjectRepository(Dispute)
        private readonly disputeRepo: Repository<Dispute>,
    ) { }

    async execute(userId: number, disputeId: number) {
        const dispute = await this.disputeRepo.findOne({
            where: { id: disputeId, user_id: userId },
        });

        if (!dispute) {
            throw new NotFoundException(`Dispute with ID ${disputeId} not found`);
        }

        return dispute;
    }
}
