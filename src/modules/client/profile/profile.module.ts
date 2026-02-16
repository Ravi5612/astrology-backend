import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/modules/users/infrastructure/persistence/entities/user.entity';

import { ProfileClient } from './entities/profile-client.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Address } from '@/common/address/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileClient, User, Address])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
