import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileMerchant } from './infrastructure/persistence/entities/profile-merchant.entity';
import { User } from '@/modules/users/infrastructure/persistence/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileMerchant, User]),
  ],
  exports: [TypeOrmModule],
})
export class ProfileModule { }
