import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/modules/users/infrastructure/persistence/entities/user.entity';

import { ProfileExpert } from './entities/profile-expert.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { Address } from '@/common/address/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileExpert, User, Address])],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
