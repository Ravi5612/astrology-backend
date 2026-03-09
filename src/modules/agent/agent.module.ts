import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentProfile } from './infrastructure/persistence/entities/agent-profile.entity';
import { AgentController } from './api/controllers/agent.controller';
import { DatabaseModule } from '@/core/database/database.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AgentProfile]),
        DatabaseModule,
    ],
    controllers: [AgentController],
    providers: [],
})
export class AgentModule { }
