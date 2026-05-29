import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailQueueService } from './email-queue.service';
import { RedisConfig } from '@/config/redis.config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get<RedisConfig>('redis');
        return {
          connection: {
            host: redisConfig?.host || 'localhost',
            port: redisConfig?.port || 6379,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailQueueService],
  exports: [EmailQueueService, BullModule],
})
export class EmailQueueModule {}
