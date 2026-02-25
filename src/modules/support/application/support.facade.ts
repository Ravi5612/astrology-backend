import { Injectable } from '@nestjs/common';
import { GetDisputesUseCase } from './use-cases/get-disputes.use-case';
import { CreateDisputeUseCase } from './use-cases/create-dispute.use-case';
import { GetDisputeByIdUseCase } from './use-cases/get-dispute-by-id.use-case';
import { SendDisputeMessageUseCase } from './use-cases/send-message.use-case';
import { GetDisputeMessagesUseCase } from './use-cases/get-messages.use-case';
import { MarkMessagesAsReadUseCase } from './use-cases/mark-as-read.use-case';
import { CreateDisputeDto } from '../api/dto/create-dispute.dto';
import { SendDisputeMessageDto } from '../api/dto/send-dispute-message.dto';

@Injectable()
export class SupportFacade {
    constructor(
        private readonly getDisputesUseCase: GetDisputesUseCase,
        private readonly createDisputeUseCase: CreateDisputeUseCase,
        private readonly getDisputeByIdUseCase: GetDisputeByIdUseCase,
        private readonly sendMessageUseCase: SendDisputeMessageUseCase,
        private readonly getMessagesUseCase: GetDisputeMessagesUseCase,
        private readonly markMessagesAsReadUseCase: MarkMessagesAsReadUseCase,
    ) { }

    async createDispute(userId: number, dto: CreateDisputeDto) {
        return this.createDisputeUseCase.execute(userId, dto);
    }

    async getDisputes(userId: number) {
        return this.getDisputesUseCase.execute(userId);
    }

    async getDisputeById(userId: number, disputeId: number) {
        return this.getDisputeByIdUseCase.execute(userId, disputeId);
    }

    async sendMessage(userId: number, disputeId: number, dto: SendDisputeMessageDto) {
        return this.sendMessageUseCase.execute(userId, disputeId, dto);
    }

    async getMessages(userId: number, disputeId: number) {
        return this.getMessagesUseCase.execute(userId, disputeId);
    }

    async markMessagesAsRead(userId: number, disputeId: number) {
        return this.markMessagesAsReadUseCase.execute(userId, disputeId);
    }
}
