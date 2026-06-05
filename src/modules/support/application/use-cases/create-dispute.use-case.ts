import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute, DisputeStatus } from '../../infrastructure/entities/dispute.entity';
import { CreateDisputeDto } from '../../api/dto/create-dispute.dto';
import { ClientProfileFacade } from '@/modules/client/profile/application/profile.facade';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';

@Injectable()
export class CreateDisputeUseCase {
    constructor(
        @InjectRepository(Dispute)
        private readonly disputeRepo: Repository<Dispute>,
        @Inject(forwardRef(() => ClientProfileFacade))
        private readonly clientProfileFacade: ClientProfileFacade,
        @Inject(forwardRef(() => ExpertProfileFacade))
        private readonly expertProfileFacade: ExpertProfileFacade,
    ) { }

    async execute(userId: string, dto: CreateDisputeDto) {
        const client = await this.clientProfileFacade.getProfile(userId);
        const expert = await this.expertProfileFacade.getExpertByUserId(userId);

        const dispute = this.disputeRepo.create({
            client_id: client ? client.id : null,
            expert_id: expert ? expert.id : null,
            type: dto.type,
            category: dto.category,
            description: dto.description,
            status: DisputeStatus.OPEN,
            order_id: dto.orderId,
            item_id: dto.itemId,
            consultation_id: dto.consultationId,
            puja_id: dto.pujaId,
            item_details: dto.itemDetails,
        });

        return this.disputeRepo.save(dispute);
    }
}
