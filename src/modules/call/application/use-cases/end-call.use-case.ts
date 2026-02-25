import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallSession, CallSessionStatus } from '../../infrastructure/persistence/entities/call-session.entity';
import { CallGateway } from '../../call.gateway';

@Injectable()
export class EndCallUseCase {
    constructor(
        @InjectRepository(CallSession)
        private sessionRepo: Repository<CallSession>,
        private callGateway: CallGateway,
    ) { }

    async execute(sessionId: number) {
        const session = await this.sessionRepo.findOne({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException('Call session not found');
        }

        if (session.status === CallSessionStatus.COMPLETED || session.status === CallSessionStatus.CANCELLED) {
            return session;
        }

        // Update session status
        session.status = CallSessionStatus.COMPLETED;
        session.end_time = new Date();

        // Calculate duration and final price (simplified for now)
        if (session.start_time) {
            const durationMs = session.end_time.getTime() - session.start_time.getTime();
            session.duration_seconds = Math.floor(durationMs / 1000);
            session.final_price = Math.ceil(session.duration_seconds / 60) * session.price_per_minute;
        }

        const savedSession = await this.sessionRepo.save(session);

        // Notify both parties via socket
        this.callGateway.server.to(`call_room_${sessionId}`).emit('call_ended', { sessionId });

        return savedSession;
    }
}
